import z from "zod";

export const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.string().min(1, "Role is required"),
});

export type CreateUserData = z.infer<typeof createUserSchema>;

export interface CreateUserResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
  user_count: string;
}

export interface RolesResponse {
  roles: Role[];
  search: string | null;
  includeInactive: boolean;
}
