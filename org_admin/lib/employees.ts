// Employee service

import type { PaginatedResponse } from "@/types";
import { apiClient } from "./api-client";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  code: string;
  contactNumber: string;
  verified?: boolean;
  ssn?: string;
  address?: string;
  gender?: string;
  dob?: string;
  signature?: string;
  reportingTo?: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  code: string;
  role: string;
  verified?: boolean;
  contactNumber: string;
  ssn?: string;
  address?: string;
  gender?: string;
  dob?: string;
  signature?: string;
  reportingTo?: string;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  role?: string;
  code?: string;
  verified?: boolean;
  contactNumber?: string;
  ssn?: string;
  address?: string;
  gender?: string;
  dob?: string;
  signature?: string;
  reportingTo?: string;
}

export interface EmployeeResponse {
  status: number;
  message: string;
  data: Employee;
}

// export interface EmployeesResponse {
//   status: number;
//   message: string;
//   data: Employee[];
//   pagination?: {
//     cursor: string | null;
//     hasMore: boolean;
//   };
// }

export type EmployeesResponse = PaginatedResponse<Employee>;

export interface AssignedWork {
  id: string;
  workId: string;
  workName: string;
  workDescription?: string;
  clientId: string;
  clientName: string;
  assignedAt: string;
}

export interface AssignedWorksResponse {
  status: number;
  message: string;
  data: {
    works: AssignedWork[];
  };
}

export interface EmployeeClient {
  id: string;
  name: string;
  medicalId: string;
  contactNumber: string;
  email?: string;
}

export interface EmployeeClientsResponse {
  status: number;
  message: string;
  data: {
    clients: EmployeeClient[];
  };
}

export const employeeService = {
  getAll: async (
    page: number,
    limit = 10,
    search?: string
  ): Promise<EmployeesResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("userType", "employee");
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());
    if (search && search.trim()) queryParams.append("search", search.trim());

    return apiClient.get<EmployeesResponse>(`/users?${queryParams.toString()}`);
  },

  getById: async (id: string): Promise<EmployeeResponse> => {
    return apiClient.get<EmployeeResponse>(`/users/${id}?userType=employee`);
  },

  create: async (data: CreateEmployeeDto): Promise<EmployeeResponse> => {
    return apiClient.post<EmployeeResponse>("/users/employees", data);
  },

  update: async (
    id: string,
    data: UpdateEmployeeDto
  ): Promise<EmployeeResponse> => {
    return apiClient.post<EmployeeResponse>(`/users/employee/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    // Note: The API doesn't seem to have a delete endpoint for employees
    // This is a placeholder for when that endpoint is available
    return apiClient.delete<void>(`/users/${id}?userType=employee`);
  },

  getAssignedWorks: async (
    employeeId?: string
  ): Promise<AssignedWorksResponse> => {
    const queryParams = new URLSearchParams();
    if (employeeId) queryParams.append("employeeId", employeeId);

    return apiClient.get<AssignedWorksResponse>(
      `/employee/assignedWork?${queryParams.toString()}`
    );
  },

  getClients: async (employeeId?: string): Promise<EmployeeClientsResponse> => {
    const queryParams = new URLSearchParams();
    if (employeeId) queryParams.append("employeeId", employeeId);

    return apiClient.get<EmployeeClientsResponse>(
      `/employee/clients?${queryParams.toString()}`
    );
  },
};
