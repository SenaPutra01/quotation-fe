import { getValidToken, refreshTokenAction } from "@/actions/auth-actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
class ServerApiService {
  private async makeRequestWithAuthRetry(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<any> {
    const maxRetries = 1;

    try {
      const token = await getValidToken();

      const isFormData = options.body instanceof FormData;

      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, config);

      if (response.status === 401 && retryCount < maxRetries) {
        await refreshTokenAction();
        return this.makeRequestWithAuthRetry(endpoint, options, retryCount + 1);
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // bisa jadi response kosong / non-JSON
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      if (retryCount >= maxRetries) {
        console.error(`API call failed after ${retryCount} retries:`, error);
        throw error;
      }

      if (error instanceof Error && error.message.includes("auth")) {
        await refreshTokenAction();
        return this.makeRequestWithAuthRetry(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  // User Management
  async getRoles() {
    return this.makeRequestWithAuthRetry("/roles");
  }

  async createUser(userData: any) {
    return this.makeRequestWithAuthRetry("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUsers() {
    return this.makeRequestWithAuthRetry("/users");
  }

  async updateUser(userId: number, userData: any) {
    return this.makeRequestWithAuthRetry(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.makeRequestWithAuthRetry(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getUsersWithRoles() {
    const [users, roles] = await Promise.all([
      this.makeRequestWithAuthRetry("/users"),
      this.makeRequestWithAuthRetry("/roles"),
    ]);

    return { users, roles };
  }

  async getUserDetail(userId: string) {
    return this.makeRequestWithAuthRetry(`/users/${userId}`, { method: "GET" });
  }

  // Client Management
  async getClients() {
    const res = await this.makeRequestWithAuthRetry("/clients", {
      method: "GET",
    });

    return {
      success: res.success ?? true,
      data: res.data?.data || [],
      total: res.data?.total || 0,
    };
  }

  async getClientDetail(clientId: string) {
    return this.makeRequestWithAuthRetry(`/clients/${clientId}`, {
      method: "GET",
    });
  }

  async createClient(formData: FormData) {
    return this.makeRequestWithAuthRetry("/clients", {
      method: "POST",
      body: formData,
    });
  }

  async updateClient(clientId: string, formData: FormData) {
    return this.makeRequestWithAuthRetry(`/clients/${clientId}`, {
      method: "PUT",
      body: formData,
    });
  }

  async deleteClient(clientId: string) {
    return this.makeRequestWithAuthRetry(`/clients/${clientId}`, {
      method: "DELETE",
    });
  }

  // Product Management
  async getProducts() {
    const res = await this.makeRequestWithAuthRetry("/products", {
      method: "GET",
    });

    return {
      success: res.success ?? true,
      data: res.data || [],
      total: res.data?.total || 0,
    };
  }

  async getProductDetail(productId: string) {
    return this.makeRequestWithAuthRetry(`/products/${productId}`, {
      method: "GET",
    });
  }

  async createProduct(formData: FormData) {
    return this.makeRequestWithAuthRetry("/products", {
      method: "POST",
      body: formData,
    });
  }

  async updateProduct(productId: string, formData: FormData) {
    return this.makeRequestWithAuthRetry(`/product/${productId}`, {
      method: "PUT",
      body: formData,
    });
  }

  async deleteProduct(productId: string) {
    return this.makeRequestWithAuthRetry(`/products/${productId}`, {
      method: "DELETE",
    });
  }

  // Quotation Management

  async getQuotationList() {
    return this.makeRequestWithAuthRetry(
      `/quotations/getAllQuotationsComplete`,
      {
        method: "GET",
      }
    );
  }

  async getQuotations(filters: Record<string, any> = {}) {
    const body = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status || "",
      search: filters.search || null,
      company: filters.company || null,
      sortBy: filters.sortBy || "created_at",
      sortOrder: filters.sortOrder || "DESC",
    };

    const res = await this.makeRequestWithAuthRetry("/quotations/list", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const responseData = res.data || {};

    return {
      success: res.success ?? true,
      data: responseData.data || [],
      meta: {
        page: responseData.pagination?.page || body.page,
        limit: responseData.pagination?.limit || body.limit,
        total: responseData.pagination?.total || 0,
        totalPages: responseData.pagination?.totalPages || 1,
        hasNextPage: responseData.pagination?.hasNextPage || false,
        hasPrevPage: responseData.pagination?.hasPrevPage || false,
        filters: responseData.filters || {},
      },
    };
  }

  async createQuotation(formData: FormData) {
    return this.makeRequestWithAuthRetry("/quotations", {
      method: "POST",
      body: formData,
    });
  }
  async updateQuotation(quotationId: string, formData: FormData) {
    return this.makeRequestWithAuthRetry(`/quotations/${quotationId}`, {
      method: "PUT",
      body: formData,
    });
  }
  async getQuotationDetail(quotationId: string) {
    return this.makeRequestWithAuthRetry(`/quotations/${quotationId}`);
  }
  async deleteQuotation(quotationId: string) {
    return this.makeRequestWithAuthRetry(`/quotations/${quotationId}`, {
      method: "DELETE",
    });
  }

  // Purchase Order Management
  async getPurchaseOrderList() {
    return this.makeRequestWithAuthRetry(
      `@/components/purchase-order/getAllPurchaseOrderComplete`,
      {
        method: "GET",
      }
    );
  }

  async getPurchaseOrders(filters: Record<string, any> = {}) {
    const body = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status || "",
      search: filters.search || null,
      company: filters.company || null,
      sortBy: filters.sortBy || "created_at",
      sortOrder: filters.sortOrder || "DESC",
    };

    const res = await this.makeRequestWithAuthRetry("/purchase-orders/all", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const responseData = res.data?.data || {};
    const responsePaginate = res.data?.pagination || {};

    return {
      success: res.success ?? true,
      data: responseData || [],
      meta: {
        page: responsePaginate.page || body.page,
        limit: responsePaginate.limit || body.limit,
        total: responsePaginate.total || 0,
        totalPages: responsePaginate.totalPages || 1,
        hasNextPage: responsePaginate.hasNextPage || false,
        hasPrevPage: responsePaginate.hasPrevPage || false,
        filters: responseData.filters || {},
      },
    };
  }

  async createPurchaseOrder(formData: FormData) {
    return this.makeRequestWithAuthRetry("/purchase-orders", {
      method: "POST",
      body: formData,
    });
  }
  async updatePurchaseOrder(quotationId: string, formData: FormData) {
    return this.makeRequestWithAuthRetry(`/purchase-orders/${quotationId}`, {
      method: "PUT",
      body: formData,
    });
  }

  async getPurchaseOrderDetail(purchaseOrderId: string) {
    return this.makeRequestWithAuthRetry(`/purchase-orders/${purchaseOrderId}`);
  }

  // Delivery Order
  async getDeliveryOrders(filters: Record<string, any> = {}) {
    const body = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status || "",
      search: filters.search || null,
      company: filters.company || null,
      sortBy: filters.sortBy || "created_at",
      sortOrder: filters.sortOrder || "DESC",
    };

    const res = await this.makeRequestWithAuthRetry("/delivery-orders/list", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const responseData = res.data || {};

    return {
      success: res.success ?? true,
      data: responseData.data || [],
      meta: {
        page: responseData.pagination?.page || body.page,
        limit: responseData.pagination?.limit || body.limit,
        total: responseData.pagination?.total || 0,
        totalPages: responseData.pagination?.totalPages || 1,
        hasNextPage: responseData.pagination?.hasNextPage || false,
        hasPrevPage: responseData.pagination?.hasPrevPage || false,
        filters: responseData.filters || {},
      },
    };
  }

  async getDeliveryOrderDetail(deliveryOrderId: string) {
    return this.makeRequestWithAuthRetry(`/delivery-orders/${deliveryOrderId}`);
  }

  async createDeliveryOrder(formData: FormData) {
    return this.makeRequestWithAuthRetry("/delivery-orders", {
      method: "POST",
      body: formData,
    });
  }

  async updateDeliveryOrder(doId: string, formData: FormData) {
    return this.makeRequestWithAuthRetry(`/delivery-orders/${doId}`, {
      method: "PUT",
      body: formData,
    });
  }

  // Invoice
  async getInvoices(filters: Record<string, any> = {}) {
    const body = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      status: filters.status || "",
      search: filters.search || null,
      company: filters.company || null,
      sortBy: filters.sortBy || "created_at",
      sortOrder: filters.sortOrder || "DESC",
    };

    const res = await this.makeRequestWithAuthRetry("/invoices/all", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const responseData = res.data || {};

    return {
      success: res.success ?? true,
      data: responseData.data || [],
      meta: {
        page: responseData.pagination?.page || body.page,
        limit: responseData.pagination?.limit || body.limit,
        total: responseData.pagination?.total || 0,
        totalPages: responseData.pagination?.totalPages || 1,
        hasNextPage: responseData.pagination?.hasNextPage || false,
        hasPrevPage: responseData.pagination?.hasPrevPage || false,
        filters: responseData.filters || {},
      },
    };
  }

  /**
   * @param type
   * @param to
   * @param cc
   * @param subject
   * @param message
   * @param number
   */
  async sendTransactionEmail({
    type,
    to,
    cc,
    subject,
    message,
    number,
  }: {
    type: "quotation" | "purchase-order" | "delivery-order" | "invoice";
    to: string;
    cc?: string;
    subject: string;
    message: string;
    number: string;
  }) {
    const endpointMap: Record<string, string> = {
      quotation: "/emails/send-quotation",
      "purchase-order": "/emails/send-purchase-order",
      "delivery-order": "/emails/send-delivery-order",
      invoice: "/emails/send-invoice",
    };

    const endpoint = endpointMap[type];

    if (!endpoint) {
      throw new Error(`Invalid email type: ${type}`);
    }

    const numberFieldMap: Record<string, string> = {
      quotation: "quotation_number",
      "purchase-order": "po_number",
      "delivery-order": "do_number",
      invoice: "invoice_number",
    };

    const numberField = numberFieldMap[type];

    const body = {
      to,
      cc,
      subject,
      message,
      [numberField]: number,
    };

    return this.makeRequestWithAuthRetry(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}

export const serverApiService = new ServerApiService();
