"use server";

import { revalidateTag } from "next/cache";
import { serverApiService } from "@/services/server-api-service";
import { CreateUserData } from "@/types/users";

export async function getRolesAction() {
  try {
    const result = await serverApiService.getRoles();
    return {
      success: true,
      data: result.roles,
    };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch roles",
    };
  }
}

export async function createUserAction(userData: CreateUserData) {
  try {
    const result = await serverApiService.createUser(userData);

    revalidateTag("users");

    return {
      success: true,
      data: result,
      message: `User ${userData.username} created successfully`,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function getUsersAction() {
  try {
    const result = await serverApiService.getUsers();
    return {
      success: true,
      data: result.users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

export async function updateUserAction(userId: number, userData: any) {
  try {
    const result = await serverApiService.updateUser(userId, userData);

    revalidateTag("users");

    return {
      success: true,
      data: result,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

export async function getUserDetailAction(userId: string) {
  try {
    const data = await serverApiService.getUserDetail(userId);

    const userData = {
      ...data.user,
      roles: data.user?.roles || [],
      permissions: data.user?.permissions || [],
    };

    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error("Error fetching user detail:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch user details",
    };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await serverApiService.deleteUser(userId);

    revalidateTag("users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
