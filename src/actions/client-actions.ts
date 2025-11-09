"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";

export async function getClientsAction() {
  try {
    const result = await serverApiService.getClients();

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

export async function getClientsListAction(filters?: Record<string, any>) {
  try {
    const result = await serverApiService.getClients(filters);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch clients",
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

export async function getClientDetailAction(clientId: string) {
  try {
    const result = await serverApiService.getClientDetail(clientId);

    return {
      success: true,
      data: result.data || result.client,
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

export async function createClientAction(formData: FormData) {
  try {
    const result = await serverApiService.createClient(formData);
    revalidateTag("clients");

    const clientName = formData.get("name");

    return {
      success: true,
      data: result.data || result,
      message: `Client ${clientName} created successfully`,
    };
  } catch (error) {
    console.error("Error creating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client",
    };
  }
}

export async function updateClientAction(clientId: string, formData: FormData) {
  try {
    const result = await serverApiService.updateClient(clientId, formData);
    revalidateTag("clients");

    return {
      success: true,
      data: result.data || result,
      message: "Client updated successfully",
    };
  } catch (error) {
    console.error("Error updating client:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client",
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
