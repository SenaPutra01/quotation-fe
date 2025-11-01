import { z } from "zod";

export const createQuotationSchema = z.object({
  quotation_number: z.string().min(1, "Quotation number is required"),
  company: z.string().min(1, "Company name is required"),
  project_name: z.string().min(1, "Project name is required"),
  requestor: z.string().min(1, "Requestor name is required"),
  valid_until: z.string().min(1, "Valid until date is required"),
  total_amount: z
    .union([z.number(), z.string()])
    .refine((val) => !isNaN(Number(val)), {
      message: "Total amount must be a valid number",
    }),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
});

export const updateQuotationSchema = z.object({
  quotation_number: z.string().min(1, "Quotation number is required"),
  company: z.string().min(1, "Company name is required"),
  project_name: z.string().min(1, "Project name is required"),
  requestor: z.string().min(1, "Requestor name is required"),
  valid_until: z.string(),
  total_amount: z
    .union([z.number(), z.string()])
    .refine((val) => !isNaN(Number(val)), {
      message: "Total amount must be a valid number",
    }),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
});

export type CreateQuotationData = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationData = z.infer<typeof updateQuotationSchema>;

export interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const quotationSchema = z.object({
  id: z.number(),
  quotation_number: z.string(),
  company: z.string(),
  project_name: z.string(),
  requestor: z.string(),
  total_amount: z.union([z.string(), z.number()]),
  valid_until: z.string(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Quotation = z.infer<typeof quotationSchema>;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters?: Record<string, any>;
  };
}
