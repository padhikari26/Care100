// Authentication service

import { apiClient } from "./api-client";

export type UserType = "super_admin" | "organization" | "employee";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  orgName?: string;
  orgType?: string;
  logo?: string; // base64 string
  providerId?: string;
  description?: string;
  email?: string;
  name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    userType: UserType;
    name?: string;
    orgId?: string;
    orgLogo?: string;
    role?: string;
  };
  token?: string;
}

export interface User {
  id: string;
  email: string;
  userType: UserType;
  name?: string;
  orgId?: string;
  orgLogo?: string;
  role?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  email: string;
  userType: UserType;
  name?: string;
  orgName?: string;
  orgType?: string;
  logo?: string;
  providerId?: string;
  description?: string;
  role?: string;
  [key: string]: any;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout", {});
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>("/auth/me");
  },

  getUserProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<{ data: UserProfile }>(
      "/users/profile"
    );
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileData,
    userId: string
  ): Promise<UserProfile> => {
    const response = await apiClient.post<{ organization: UserProfile }>(
      `/users/organization/${userId}`,
      data
    );

    return response.organization;
  },

  checkAuthStatus: async (): Promise<{
    isAuthenticated: boolean;
    user?: User;
  }> => {
    try {
      const user = await apiClient.get<User>("/auth/me");
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false };
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post("/users/changepassword", data);
  },
};
