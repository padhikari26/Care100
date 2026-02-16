export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedResponse<T> {
  status: number;
  message: string;
  data: T[];
  pagination: PaginationResponse;
}

// three user types
export enum UserType {
  super_admin = "super_admin",
  employee = "employee",
  organization = "organization",
}
