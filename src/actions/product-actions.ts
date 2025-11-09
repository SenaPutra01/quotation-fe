"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";
import { AnyCnameRecord } from "node:dns";

export async function getProductsAction() {
  try {
    const result = await serverApiService.getProducts();

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

export async function getProductDetailAction(productId: string) {
  try {
    const result = await serverApiService.getProductDetail(productId);

    return {
      success: true,
      data: result.data || result.product,
    };
  } catch (error) {
    console.error("Error fetching client detail:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch client details",
    };
  }
}

export async function createProductAction(data: any) {
  try {
    const result = await serverApiService.createProduct(data);

    revalidateTag("products");

    const productName = data.name || "New Product";

    return {
      success: true,
      data: result?.data || result,
      message: `Product ${productName} created successfully`,
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message: error?.message || "Failed to create product",
    };
  }
}

export async function updateProductAction(clientId: string, data: any) {
  try {
    const result = await serverApiService.updateProduct(clientId, data);
    revalidateTag("products");

    return {
      success: true,
      data: result.data || result,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating client:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
}

export async function deleteClientAction(clientId: string) {
  try {
    await serverApiService.deleteClient(clientId);
    revalidateTag("clients");

    return {
      success: true,
      message: "Client deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete client",
    };
  }
}
