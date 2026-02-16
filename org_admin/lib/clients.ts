// Client service

import type { PaginatedResponse } from "@/types";
import { apiClient } from "./api-client";

export interface Client {
  id: string;
  name: string;
  medicalId: string;
  contactNumber: string;
  email?: string;
  signature?: string;
  address?: string;
  gender?: string;
  dob?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  medicalId: string;
  contactNumber: string;
  email?: string;
  signature?: string;
  address?: string;
  gender?: string;
  dob?: string;
}

export interface UpdateClientDto {
  name?: string;
  medicalId?: string;
  contactNumber?: string;
  email?: string;
  signature?: string;
  address?: string;
  gender?: string;
  dob?: string;
}

export interface ClientResponse {
  status: number;
  message: string;
  data: Client;
}

// export interface ClientsResponse {
//   status: number;
//   message: string;
//   data: Client[];
//   pagination?: {
//     cursor: string | null;
//     hasMore: boolean;
//   };
// }

export type ClientsResponse = PaginatedResponse<Client>;

export const clientService = {
  getAll: async (
    page: number = 1,
    limit = 10,
    search?: string
  ): Promise<ClientsResponse> => {
    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());
    if (search && search.trim()) queryParams.append("search", search.trim());

    return apiClient.get<ClientsResponse>(`/users?userType=client&${queryParams.toString()}`);
  },

  getById: async (id: string): Promise<ClientResponse> => {
    return apiClient.get<ClientResponse>(`/users/${id}?userType=client`);
  },

  create: async (data: CreateClientDto): Promise<ClientResponse> => {
    return apiClient.post<ClientResponse>("/users/clients", data);
  },

  update: async (
    id: string,
    data: UpdateClientDto
  ): Promise<ClientResponse> => {
    return apiClient.post<ClientResponse>(`/users/client/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    // Note: The API doesn't seem to have a delete endpoint for clients
    // This is a placeholder for when that endpoint is available
    return apiClient.delete<void>(`/users/${id}?userType=client`);
  },
};
