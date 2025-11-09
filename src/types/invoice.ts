export type InvoiceStatus = "draft" | "submit" | "sent" | "close" | "cancel";

export interface Client {
  id: number;
  company_name: string;
  email?: string;
  phone?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  project_name: string;
  client: Client;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  purchase_order?: PurchaseOrder;
  client?: Client;
  total_amount: number;
  invoice_date: string;
  due_date?: string;
  status: InvoiceStatus;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceResponse {
  success: boolean;
  data:
    | Invoice[]
    | {
        data: Invoice[];
        pagination?: {
          total: number;
          page: number;
          limit: number;
        };
      };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export function safeValidateInvoiceResponse(response: any): {
  success: boolean;
  data?: InvoiceResponse;
} {
  try {
    if (!response) {
      return { success: false };
    }

    if (typeof response !== "object") {
      return { success: false };
    }

    if (response.success === false) {
      return { success: true, data: response };
    }

    if (Array.isArray(response.data)) {
      return { success: true, data: response };
    } else if (response.data && Array.isArray(response.data.data)) {
      return { success: true, data: response };
    }

    return { success: false };
  } catch (error) {
    console.error("Error validating invoice response:", error);
    return { success: false };
  }
}

export function extractInvoicesFromResponse(
  response: InvoiceResponse
): Invoice[] {
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  return [];
}

export function extractTotalFromResponse(response: InvoiceResponse): number {
  if (response.meta?.total) {
    return response.meta.total;
  } else if (
    response.data &&
    !Array.isArray(response.data) &&
    response.data.pagination?.total
  ) {
    return response.data.pagination.total;
  } else if (Array.isArray(response.data)) {
    return response.data.length;
  }
  return 0;
}
