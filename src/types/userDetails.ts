import { z } from "zod";

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_system: z.boolean(),
  description: z.string(),
});

export const permissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  action: z.string(),
  resource: z.string(),
  description: z.string(),
});

export const userDetailSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  is_active: z.boolean(),
  last_login: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  roles: z.array(roleSchema),
  permissions: z.array(permissionSchema),
});

export type UserDetail = z.infer<typeof userDetailSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof permissionSchema>;

export interface UserDetailResponse {
  user: UserDetail;
}
