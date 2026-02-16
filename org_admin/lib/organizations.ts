// Updated organization service with search support

import type { PaginatedResponse } from "@/types";
import { apiClient } from "./api-client";

export interface Organization {
  id: string;
  orgName: string;
  orgType: string;
  providerId: string;
  email: string;
  description?: string;
  expiryDate?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  orgName: string;
  orgType: string;
  providerId: string;
  email: string;
  password: string;
  description?: string;
  logo?: string;
  expiryDate?: string;
}

export interface UpdateOrganizationDto {
  orgName?: string;
  orgType?: string;
  providerId?: string;
  email?: string;
  description?: string;
  logo?: string;
  expiryDate?: string;
}

export interface OrganizationResponse {
  status: number;
  message: string;
  data: Organization;
}

export type OrganizationsResponse = PaginatedResponse<Organization>;

// export interface OrganizationsResponse {
//   status: number;
//   message: string;
//   data: Organization[];
//   pagination?: {
//     cursor: string | null;
//     hasMore: boolean;
//   };
// }

export const organizationService = {
  getAll: async (
    page: number,
    limit = 10,
    search?: string
  ): Promise<OrganizationsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("userType", "organization");

    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());
    if (search && search.trim()) queryParams.append("search", search.trim());

    return apiClient.get<OrganizationsResponse>(
      `/users?${queryParams.toString()}`
    );
  },

  getById: async (id: string): Promise<OrganizationResponse> => {
    return apiClient.get<OrganizationResponse>(
      `/users/${id}?userType=organization`
    );
  },

  create: async (
    data: CreateOrganizationDto
  ): Promise<OrganizationResponse> => {
    return apiClient.post<OrganizationResponse>("/users/organizations", data);
  },

  update: async (
    id: string,
    data: UpdateOrganizationDto
  ): Promise<OrganizationResponse> => {
    return apiClient.post<OrganizationResponse>(
      `/users/organization/${id}`,
      data
    );
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}?userType=organization`);
  },
};
