"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";

export async function getQuotationsAction(filters?: Record<string, any>) {
  try {
    const result = await serverApiService.getQuotations(filters);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Error fetching quotations:", error);
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

export async function getQuotationList() {
  try {
    const result = await serverApiService.getQuotationList();

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

export async function getQuotationDetailAction(quotationId: string) {
  try {
    const result = await serverApiService.getQuotationDetail(quotationId);

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

export async function createQuotationAction(formData: FormData) {
  try {
    const result = await serverApiService.createQuotation(formData);
    revalidateTag("quotations");

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

export async function updateQuotationAction(
  quotationId: string,
  formData: FormData
) {
  try {
    const result = await serverApiService.updateQuotation(
      quotationId,
      formData
    );
    revalidateTag("quotations");

    return {
      success: true,
      data: result.data || result,
      message: "Quotation updated successfully",
    };
  } catch (error) {
    console.error("Error updating quotation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update quotation",
    };
  }
}

export async function updateQuotationStatusAction(
  quotationId: string,
  status: string,
  updatedBy: number
) {
  try {
    const result = await serverApiService.updateQuotationStatus(
      quotationId,
      status,
      updatedBy
    );

    revalidateTag("quotations");
    revalidateTag(`quotation-${quotationId}`);

    return {
      success: true,
      data: result.data || result,
      message: `Quotation status updated to ${status} successfully`,
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
