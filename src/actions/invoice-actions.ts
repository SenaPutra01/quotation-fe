"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";

export async function getInvoiceAction(filters?: Record<string, any>) {
  try {
    const result = await serverApiService.getInvoices(filters);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch quotations",
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        filters: {},
      },
    };
  }
}

export async function getInvoiceDetailAction(quotationId: string) {
  try {
    const result = await serverApiService.getInvoiceDetail(quotationId);

    return {
      success: true,
      data: result.data || result.quotation,
    };
  } catch (error) {
    console.error("Error fetching quotation detail:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch quotation details",
    };
  }
}

export async function createInvoiceAction(formData: FormData) {
  try {
    const result = await serverApiService.createInvoice(formData);
    revalidateTag("invoice");

    const invoiceNumber = formData.get("invoice_number");

    return {
      success: true,
      data: result.data || result,
      message: `Invoice ${invoiceNumber?.toString} created successfully`,
    };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create quotation",
    };
  }
}

export async function updateInvoiceAction(
  purchaseOrderId: string,
  formData: FormData
) {
  try {
    const result = await serverApiService.updateInvoice(
      purchaseOrderId,
      formData
    );
    revalidateTag("invoice");

    return {
      success: true,
      data: result.data || result,
      message: "Invoice updated successfully",
    };
  } catch (error) {
    console.error("Error updating Invoice:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update invoice",
    };
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: string,
  updatedBy: number
) {
  try {
    const result = await serverApiService.updateInvoiceStatus(
      invoiceId,
      status,
      updatedBy
    );

    revalidateTag("purchase-orders");
    revalidateTag(`purchase order - ${invoiceId}`);

    return {
      success: true,
      data: result.data || result,
      message: `Purchase Order status updated to ${status} successfully`,
    };
  } catch (error) {
    console.error("Error updating quotation status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update quotation status",
    };
  }
}

export async function getPurchaseOrderList() {
  try {
    const result = await serverApiService.getPurchaseOrderList();

    return {
      success: true,
      data: result.data,
      total: result.total,
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch clients",
      data: [],
      total: 0,
    };
  }
}
