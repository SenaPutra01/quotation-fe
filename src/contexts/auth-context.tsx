"use client";

import * as React from "react";
import {
  loginAction,
  logoutAction,
  getAuthStatus,
} from "@/actions/auth-actions";
import {
  getUserData,
  saveUserData,
  clearUserData,
  type UserData,
} from "@/lib/auth-utils";

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  roles?: any[];
  permissions?: any[];
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const loadUserFromStorage = React.useCallback(() => {
    try {
      const userData = getUserData();
      if (userData) {
        setUser(userData as User);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    }
  }, []);

  const checkAuth = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const authStatus = await getAuthStatus();

      setIsAuthenticated(authStatus.isAuthenticated);

      if (authStatus.isAuthenticated) {
        loadUserFromStorage();
      } else {
        setUser(null);
        clearUserData();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
      clearUserData();
    } finally {
      setIsLoading(false);
    }
  }, [loadUserFromStorage]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);

      const result = await loginAction(credentials);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      if (result.user) {
        saveUserData(result.user as UserData);
        setUser(result.user as User);
        setIsAuthenticated(true);
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setUser(null);
      clearUserData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      clearUserData();
      setUser(null);
      setIsAuthenticated(false);
      await logoutAction();
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setIsAuthenticated(false);
      clearUserData();
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    console.log("Auth state updated:", {
      user,
      isLoading,
      isAuthenticated,
    });
  }, [user, isLoading, isAuthenticated]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
