import type { PaginatedResponse } from "@/types";
import { apiClient } from "./api-client";

export interface Work {
  id: string;
  code: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkDto {
  code: number;
  name: string;
  description?: string;
}

export interface UpdateWorkDto {
  code?: number;
  name?: string;
  description?: string;
}

export interface WorkResponse {
  status: number;
  message: string;
  data: Work;
}

export type WorksResponse = PaginatedResponse<Work>;

export interface AssignWorkDto {
  employeeId: string;
  clientId: string;
  workId: string;
}

export interface WorkAssignment {
  id: string;
  employeeId: string;
  clientId: string;
  workId: string;
  createdAt: string;
}

export interface WorkAssignmentResponse {
  status: number;
  message: string;
  data: WorkAssignment;
}

export const workService = {
  getAll: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<WorksResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());
    if (search && search.trim()) queryParams.append("search", search.trim());

    return apiClient.get<WorksResponse>(`/works?${queryParams.toString()}`);
  },

  getById: async (id: string): Promise<WorkResponse> => {
    return apiClient.get<WorkResponse>(`/works/${id}`);
  },

  create: async (data: CreateWorkDto): Promise<WorkResponse> => {
    return apiClient.post<WorkResponse>("/works", data);
  },

  update: async (id: string, data: UpdateWorkDto): Promise<WorkResponse> => {
    return apiClient.put<WorkResponse>(`/works/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/works/${id}`);
  },

  assignWork: async (data: AssignWorkDto): Promise<WorkAssignmentResponse> => {
    return apiClient.post<WorkAssignmentResponse>("/works/assign", data);
  },
};
