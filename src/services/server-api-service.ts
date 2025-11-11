import { getValidToken, refreshTokenAction } from "@/actions/auth-actions";
import { checkAndRefresh } from "@/actions/token-actions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
class ServerApiService {
  private async makeRequestWithAuthRetry(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<any> {
    const maxRetries = 1;

    try {
      await checkAndRefresh();
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
        } catch {}
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

  async generateSliderCaptcha(): Promise<{
    sessionId: string;
    backgroundImage: string;
    puzzlePiece: string;
    puzzleY: number;
    canvasWidth: number;
    canvasHeight: number;
    puzzleSize: number;
    expiresIn: number;
    success?: boolean;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/captcha/generate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to generate captcha: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.sessionId || !data.backgroundImage || !data.puzzlePiece) {
        throw new Error("Invalid captcha response format");
      }

      return data;
    } catch (error) {
      console.error("Captcha generation error:", error);
      throw error;
    }
  }

  async verifySliderCaptcha(
    sessionId: string,
    sliderPosition: number
  ): Promise<{
    message: string;
    valid: boolean;
    difference?: number;
    success?: boolean;
    token?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/captcha/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          sliderPosition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Captcha verification failed: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Captcha verification error:", error);
      throw error;
    }
  }

  async loginWithCaptcha(credentials: {
    email: string;
    password: string;
    captchaSessionId: string;
    sliderPosition: number;
    captchaToken?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      user: any;
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    };
  }> {
    try {
      const captchaVerification = await this.verifySliderCaptcha(
        credentials.captchaSessionId,
        credentials.sliderPosition
      );

      if (!captchaVerification.valid) {
        throw new Error(
          captchaVerification.message || "Captcha verification failed"
        );
      }

      const loginPayload: any = {
        email: credentials.email,
        password: credentials.password,
      };

      if (captchaVerification.token) {
        loginPayload.captchaToken = captchaVerification.token;
      } else {
        loginPayload.captchaSessionId = credentials.captchaSessionId;
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Login failed: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Login with captcha error:", error);
      throw error;
    }
  }

  async loginWithPreVerifiedCaptcha(credentials: {
    email: string;
    password: string;
    captchaToken: string;
  }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed: ${response.status}`);
    }

    return response.json();
  }

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

  async getClients(filters: Record<string, any> = {}) {
    const body = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search || null,
      company_name: filters.company_name || null,
      contact_person: filters.contact_person || null,
      sortBy: filters.sortBy || "c.created_at",
      sortOrder: filters.sortOrder || "DESC",
    };

    const res = await this.makeRequestWithAuthRetry("/clients/all", {
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

  async createProduct(data: any) {
    return this.makeRequestWithAuthRetry("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId: string, data: any) {
    return this.makeRequestWithAuthRetry(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId: string) {
    return this.makeRequestWithAuthRetry(`/products/${productId}`, {
      method: "DELETE",
    });
  }

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

  async updateQuotationStatus(
    quotationId: string,
    status: string,
    updatedBy: number
  ) {
    return this.makeRequestWithAuthRetry(`/quotations/status/${quotationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
        updated_by: updatedBy,
      }),
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

  async getPurchaseOrderList() {
    return this.makeRequestWithAuthRetry(
      `/purchase-orders/getAllPurchaseOrderComplete`,
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

  async updatePurchaseOrderStatus(
    purchaseOrderId: string,
    status: string,
    updatedBy: number
  ) {
    return this.makeRequestWithAuthRetry(
      `/purchase-orders/status/${purchaseOrderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
          updated_by: updatedBy,
        }),
      }
    );
  }

  async getPurchaseOrderDetail(purchaseOrderId: string) {
    return this.makeRequestWithAuthRetry(`/purchase-orders/${purchaseOrderId}`);
  }

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

  async getInvoiceDetail(invoiceId: string) {
    return this.makeRequestWithAuthRetry(`/invoices/${invoiceId}`);
  }

  async createInvoice(formData: FormData) {
    return this.makeRequestWithAuthRetry("/invoices", {
      method: "POST",
      body: formData,
    });
  }

  async updateInvoice(invoiceId: string, formData: FormData) {
    return this.makeRequestWithAuthRetry(`/invoices/${invoiceId}`, {
      method: "PUT",
      body: formData,
    });
  }

  async updateInvoiceStatus(
    invoiceId: string,
    status: string,
    updatedBy: number
  ) {
    return this.makeRequestWithAuthRetry(`/invoice/status/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
        updated_by: updatedBy,
      }),
    });
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
