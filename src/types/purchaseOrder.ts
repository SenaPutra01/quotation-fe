import { z } from "zod";

export const ClientSchema = z.object({
  id: z.number(),
  company_name: z.string(),
  contact_person: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const QuotationRefSchema = z.object({
  id: z.number(),
  quotation_number: z.string(),
  status: z.string().optional(),
  total_amount: z.string().optional(),
});

export const PurchaseOrderStatusSchema = z.enum([
  "draft",
  "submit",
  "sent",
  "cancel",
  "close",
]);

export const PurchaseOrderSchema = z.object({
  id: z.number(),
  po_number: z.string(),
  project_name: z.string(),
  total_amount: z.string(),
  order_date: z.string().datetime(),
  delivery_date: z.string().datetime().nullable(),
  status: PurchaseOrderStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  client: ClientSchema,
  quotation: QuotationRefSchema,
});

export const UniversalPurchaseOrderResponseSchema = z
  .object({
    success: z.boolean(),
    data: z
      .union([
        z.array(PurchaseOrderSchema),
        z
          .object({
            data: z.array(PurchaseOrderSchema).optional(),
            pagination: z
              .object({
                total: z.number(),
                page: z.number().optional(),
                limit: z.number().optional(),
                totalPages: z.number().optional(),
                hasNextPage: z.boolean().optional(),
                hasPrevPage: z.boolean().optional(),
              })
              .optional(),
          })
          .optional(),
        z.array(z.any()).optional(),
      ])
      .optional(),
    message: z.string().optional(),
    error: z.string().optional(),
    meta: z
      .object({
        total: z.number().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
        totalPages: z.number().optional(),
      })
      .optional(),
    timestamp: z.string().datetime().optional(),
  })
  .passthrough();

export const safeValidatePurchaseOrderResponse = (data: unknown) => {
  try {
    const result = UniversalPurchaseOrderResponseSchema.safeParse(data);

    if (result.success) {
      return {
        success: true as const,
        data: result.data,
      };
    } else {
      console.warn("Zod validation warnings:", result.error.errors);
      return {
        success: true as const,
        data: data as any,
        warnings: result.error.errors,
      };
    }
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error : new Error("Validation failed"),
    };
  }
};

export const extractPurchaseOrdersFromResponse = (
  response: any
): PurchaseOrder[] => {
  if (!response) return [];

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  console.warn("Could not extract purchase orders from:", response);
  return [];
};

export const extractTotalFromResponse = (response: any): number => {
  if (!response) return 0;

  if (response.meta?.total) {
    return response.meta.total;
  }

  if (response.data?.pagination?.total) {
    return response.data.pagination.total;
  }

  const purchaseOrders = extractPurchaseOrdersFromResponse(response);
  return purchaseOrders.length;
};

export type Client = z.infer<typeof ClientSchema>;
export type QuotationRef = z.infer<typeof QuotationRefSchema>;
export type PurchaseOrderStatus = z.infer<typeof PurchaseOrderStatusSchema>;
export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type PurchaseOrderFilters = {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  client_id?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
};

export const PurchaseOrderItemSchema = z.object({
  id: z.number().optional(),
  product_name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be positive"),
  total_price: z.number().min(0, "Total price must be positive"),
});

export const PurchaseOrderFormDataSchema = z.object({
  po_number: z.string().min(1, "PO number is required"),
  quotation_id: z.number().min(1, "Quotation is required"),
  client_id: z.number().min(1, "Client is required"),
  project_name: z.string().min(1, "Project name is required"),
  order_date: z.string().min(1, "Order date is required"),
  delivery_date: z.string().nullable(),
  total_amount: z.number().min(0, "Total amount must be positive"),
  notes: z.string().optional(),
  terms_conditions: z.string().optional(),
  items: z
    .array(PurchaseOrderItemSchema)
    .min(1, "At least one item is required"),
});

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderFormDataSchema>;
export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;
