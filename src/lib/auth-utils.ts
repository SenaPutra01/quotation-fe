"use client";

export interface Role {
  id: number;
  name: string;
  is_system: boolean;
  description: string;
}

export interface Permission {
  id: number;
  name: string;
  action: string;
  resource: string;
  description: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: Role[];
  permissions?: Permission[];
  last_login?: string;
}

const USER_STORAGE_KEY = "user";

/**
 * Simpan user data ke localStorage
 */
export function saveUserData(user: UserData): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error(" Failed to save user data:", error);
    }
  }
}

/**
 * Ambil user data dari localStorage
 */
export function getUserData(): UserData | null {
  if (typeof window !== "undefined") {
    try {
      const userData = localStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  }
  return null;
}

/**
 * Hapus user data dari localStorage
 */
export function clearUserData(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear user data:", error);
    }
  }
}

/**
 * Update user data di localStorage (partial update)
 */
export function updateUserData(updates: Partial<UserData>): void {
  const currentUser = getUserData();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    saveUserData(updatedUser);
  }
}

/**
 * Get user ID
 */
export function getUserId(): number | null {
  const user = getUserData();
  return user?.id ?? null;
}

/**
 * Get username
 */
export function getUsername(): string | null {
  const user = getUserData();
  return user?.username ?? null;
}

/**
 * Get user email
 */
export function getUserEmail(): string | null {
  const user = getUserData();
  return user?.email ?? null;
}

/**
 * Get user first name
 */
export function getFirstName(): string | null {
  const user = getUserData();
  return user?.first_name ?? null;
}

/**
 * Get user last name
 */
export function getLastName(): string | null {
  const user = getUserData();
  return user?.last_name ?? null;
}

/**
 * Get user full name
 */
export function getUserFullName(): string | null {
  const user = getUserData();
  if (!user) return null;
  return `${user.first_name} ${user.last_name}`.trim() || null;
}

/**
 * Get user initials (for avatars)
 */
export function getUserInitials(): string {
  const user = getUserData();
  if (!user) return "?";

  const firstInitial = user.first_name?.[0]?.toUpperCase() || "";
  const lastInitial = user.last_name?.[0]?.toUpperCase() || "";

  return `${firstInitial}${lastInitial}` || "?";
}

/**
 * Get last login date
 */
export function getLastLogin(): Date | null {
  const user = getUserData();
  if (!user?.last_login) return null;

  try {
    return new Date(user.last_login);
  } catch {
    return null;
  }
}

/**
 * Get all user roles
 */
export function getUserRoles(): Role[] {
  const user = getUserData();
  return user?.roles || [];
}

/**
 * Get all user permissions
 */
export function getUserPermissions(): Permission[] {
  const user = getUserData();
  return user?.permissions || [];
}

/**
 * Check if user has a specific role
 */
export function hasRole(roleName: string): boolean {
  const roles = getUserRoles();
  return roles.some((role) => role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roleNames: string[]): boolean {
  const roles = getUserRoles();
  return roles.some((role) => roleNames.includes(role.name));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(roleNames: string[]): boolean {
  const roles = getUserRoles();
  const userRoleNames = roles.map((r) => r.name);
  return roleNames.every((roleName) => userRoleNames.includes(roleName));
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permissionName: string): boolean {
  const permissions = getUserPermissions();
  return permissions.some((permission) => permission.name === permissionName);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(permissionNames: string[]): boolean {
  const permissions = getUserPermissions();
  return permissions.some((permission) =>
    permissionNames.includes(permission.name)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(permissionNames: string[]): boolean {
  const permissions = getUserPermissions();
  const userPermissionNames = permissions.map((p) => p.name);
  return permissionNames.every((permName) =>
    userPermissionNames.includes(permName)
  );
}

/**
 * Check if user can perform an action on a resource
 * Example: canPerform("read", "users") → checks for "users:read"
 */
export function canPerform(action: string, resource: string): boolean {
  const permissionName = `${resource}:${action}`;
  return hasPermission(permissionName);
}

/**
 * Get permissions for a specific resource
 * Example: getResourcePermissions("users") → ["users:read", "users:write"]
 */
export function getResourcePermissions(resource: string): Permission[] {
  const permissions = getUserPermissions();
  return permissions.filter((p) => p.resource === resource);
}

/**
 * Get all actions user can perform on a resource
 * Example: getResourceActions("users") → ["read", "write", "delete"]
 */
export function getResourceActions(resource: string): string[] {
  const permissions = getResourcePermissions(resource);
  return permissions.map((p) => p.action);
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(): boolean {
  return hasRole("super_admin");
}

/**
 * Check if user is admin (any admin role)
 */
export function isAdmin(): boolean {
  const roles = getUserRoles();
  return roles.some((role) => role.name.includes("admin"));
}

/**
 * Check if user data exists in localStorage
 */
export function isUserDataStored(): boolean {
  return getUserData() !== null;
}

/**
 * Get user data as JSON string
 */
export function getUserDataJSON(): string | null {
  const user = getUserData();
  return user ? JSON.stringify(user, null, 2) : null;
}

/**
 * Debug: Log user data to console
 */
export function debugUserData(): void {
  const user = getUserData();
  console.group("🔍 User Data Debug");

  console.groupEnd();
}

/**
 * Get user summary (for display)
 */
export function getUserSummary(): {
  id: number | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
  initials: string;
  roleCount: number;
  permissionCount: number;
  isSuperAdmin: boolean;
} | null {
  const user = getUserData();
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: getUserFullName(),
    initials: getUserInitials(),
    roleCount: getUserRoles().length,
    permissionCount: getUserPermissions().length,
    isSuperAdmin: isSuperAdmin(),
  };
}

/**
 * Validate if stored user data is valid
 */
export function validateUserData(): boolean {
  const user = getUserData();
  if (!user) return false;

  const hasRequiredFields =
    typeof user.id === "number" &&
    typeof user.username === "string" &&
    typeof user.email === "string" &&
    typeof user.first_name === "string" &&
    typeof user.last_name === "string";

  if (!hasRequiredFields) {
    console.warn("⚠️ Invalid user data structure");
    clearUserData();
    return false;
  }

  return true;
}

/**
 * Refresh user data validity check
 * Returns true if valid, false if invalid (and clears it)
 */
export function ensureValidUserData(): boolean {
  return validateUserData();
}
