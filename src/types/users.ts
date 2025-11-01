import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),

  last_name: z
    .string()
    .trim()
    .refine((val) => val === "" || /^[a-zA-Z\s'-]{1,50}$/.test(val), {
      message:
        "Last name must be 1-50 characters and only contain letters, spaces, hyphens, and apostrophes",
    }),
  role: z.string().min(1, "Role is required"),
});

export const updateUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.string().min(1, "Role is required"),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export type CreateUserData = z.infer<typeof createUserSchema>;

export interface UserDetail {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: Role[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  user_count: number;
  is_system?: boolean;
}

export interface Permission {
  id: number;
  name: string;
  action: string;
  resource: string;
  description: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: Role[];
  permissions?: Permission[];
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserDetail {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: Role[];
  permissions: Permission[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
