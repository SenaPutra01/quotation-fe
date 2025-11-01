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

export async function getPurchaseOrderDetailAction(quotationId: string) {
  try {
    const result = await serverApiService.getPurchaseOrderDetail(quotationId);

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

export async function createPurchaseOrderAction(formData: FormData) {
  try {
    const result = await serverApiService.createPurchaseOrder(formData);
    revalidateTag("purchaseOrders");

    const quotationNumber = formData.get("quotation_number");

    return {
      success: true,
      data: result.data || result,
      message: `Quotation ${quotationNumber?.toString} created successfully`,
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

export async function updatePurchaseOrderAction(
  purchaseOrderId: string,
  formData: FormData
) {
  try {
    const result = await serverApiService.updatePurchaseOrder(
      purchaseOrderId,
      formData
    );
    revalidateTag("purchase-orders");

    return {
      success: true,
      data: result.data || result,
      message: "Purchase Order updated successfully",
    };
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update purchase order",
    };
  }
}

export async function deleteQuotationAction(quotationId: string) {
  try {
    await serverApiService.deleteQuotation(quotationId);
    revalidateTag("quotations");

    return {
      success: true,
      message: "Quotation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete quotation",
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
