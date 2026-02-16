// Timesheet service

import type { PaginatedResponse } from "@/types";
import { API_BASE_URL, apiClient } from "./api-client";

export interface CompletedWork {
  name: string;
  code: string;
  completed: boolean;
  workId: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName?: string;
  Client: {
    name: string;
  };
  Employee: {
    name: string;
  };
  clientId: string;
  clientName?: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  clientSignature?: string;
  completedWorks: CompletedWork[];
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitTimesheetDto {
  clientId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  clientSignature?: string;
  completedWorks: CompletedWork[];
  reason?: string;
}

export interface TimesheetEmployee {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface TimesheetResponse {
  status: number;
  message: string;
  data: Timesheet;
}

export type TimesheetsResponse = PaginatedResponse<Timesheet>;

export interface TimesheetEmployeesResponse {
  status: number;
  message: string;
  employees: TimesheetEmployee[];
}

export const timesheetService = {
  getAll: async (
    params: {
      page?: number;
      limit?: number;
      clientId?: string;
      employeeId?: string;
      date?: string;
      endDate?: string;
      search?: string;
    } = {}
  ): Promise<TimesheetsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.clientId) queryParams.append("clientId", params.clientId);
    if (params.employeeId) queryParams.append("employeeId", params.employeeId);
    if (params.date) queryParams.append("date", params.date);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.search) queryParams.append("search", params.search);

    return apiClient.get<TimesheetsResponse>(
      `/timesheet?${queryParams.toString()}`
    );
  },

  getById: async (id: string): Promise<TimesheetResponse> => {
    return apiClient.get<TimesheetResponse>(`/timesheet/${id}`);
  },

  getEmployeeList: async (): Promise<TimesheetEmployeesResponse> => {
    return apiClient.get<TimesheetEmployeesResponse>(
      "/timesheet/addSectionListWithEmployee"
    );
  },

  submit: async (data: SubmitTimesheetDto): Promise<TimesheetResponse> => {
    return apiClient.post<TimesheetResponse>("/timesheet", data);
  },

  downloadWeekly: async (data: {
    timesheets: Timesheet[];
    startDate: string;
    endDate: string;
    employeeId: string;
  }): Promise<Blob> => {
    // We need to use fetch directly here because we need to get a Blob response
    // The apiClient methods expect JSON responses
    const response = await fetch(`${API_BASE_URL}/timesheet/download/weekly`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to download timesheet: ${response.statusText}`);
    }

    return response.blob();
  },
};
