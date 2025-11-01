"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";

export async function getDeliveryOrderAction(filters?: Record<string, any>) {
  try {
    const result = await serverApiService.getDeliveryOrders(filters);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Error fetch delivery orders:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch delivery orders",
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

export async function getDeliveryOrderDetailAction(deliveryOrderId: string) {
  try {
    const result = await serverApiService.getDeliveryOrderDetail(
      deliveryOrderId
    );

    return {
      success: true,
      data: result.data || result.deliveryOrder,
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

export async function createDeliveryOrderAction(formData: FormData) {
  try {
    const result = await serverApiService.createDeliveryOrder(formData);
    revalidateTag("deliveryOrders");

    return {
      success: true,
      data: result.data || result,
      message: `Delivery Order created successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create delivery order",
    };
  }
}

export async function updateDeliveryOrderAction(
  deliveryOrderId: string,
  formData: FormData
) {
  try {
    const result = await serverApiService.updateDeliveryOrder(
      deliveryOrderId,
      formData
    );
    revalidateTag("deliveryOrders");

    return {
      success: true,
      data: result.data || result,
      message: "Delivery Order updated successfully",
    };
  } catch (error) {
    console.error("Error updating delivery order: ", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update delivery order",
    };
  }
}
