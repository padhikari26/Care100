"use client";

import { authService, type User, type UserType } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface LoginResponse {
  user: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  hasPermission: (requiredRole: UserType | UserType[]) => boolean;
  isSuperAdmin: () => boolean;
  isOrganization: () => boolean;
  isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Run only once on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isAuthenticated, user: userData } =
          await authService.checkAuthStatus();

        if (isAuthenticated && userData) {
          setUser(userData);
          setUserType(userData.userType);
        } else {
          // If not authenticated, reset user state
          //redirect to login page
          if (pathname !== "/login") {
            router.replace("/login");
          }
          setUser(null);
          setUserType(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        authService.logout();
        setUser(null);
        setUserType(null);
      } finally {
        // Mark auth check as complete and stop loading
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - run only once

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log(response);

      if (response) {
        // Save user data and token in local storage

        console.log(response);

        if (response.token) {
          setUserType(response.user.userType);
          localStorage.setItem("authToken", response.token);
        }
        if (response.user) {
          setUser(response.user);
          localStorage.setItem("user", JSON.stringify(response.user));
          localStorage.setItem("logo", response.user.orgLogo || "");
          localStorage.setItem("userType", response.user.userType);
        }

        if (response.user.userType === "employee") {
          toast.error("Employees cannot access the admin panel", {
            description: "Please contact your administrator for access.",
            duration: 3000,
          });
          router.replace("/login");
          return Promise.reject(
            new Error("Employees cannot access the admin panel")
          );
        }

        router.replace("/dashboard");
        return response;
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserType(null);
    router.replace("/login");
  };

  const hasPermission = (requiredRole: UserType | UserType[]): boolean => {
    if (!userType) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(userType);
  };

  const isSuperAdmin = () => userType === "super_admin";
  const isOrganization = () => userType === "organization";
  const isEmployee = () => userType === "employee";

  const value = {
    user,
    userType,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    isSuperAdmin,
    isOrganization,
    isEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
