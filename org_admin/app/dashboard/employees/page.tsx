"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { employeeService, type Employee } from "@/lib/employees";
import { PaginationResponse } from "@/types";
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Define validation schemas
const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  code: z.string().min(1, "Code is required"),
  role: z.string().min(1, "Role is required"),
  ssn: z.string().optional(),
  verified: z.boolean().optional(),
  contactNumber: z.string().min(1, "Contact number is required"),
  address: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();
type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

// Pagination state
const initialPaginationState: PaginationResponse = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNextPage: false,
  hasPrevPage: false,
  nextPage: null,
  prevPage: null,
};

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse>(
    initialPaginationState
  );

  const hasMounted = useRef(false);

  // Initialize forms
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    mode: "all",
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
  } = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    mode: "all",
  });

  const fetchEmployees = useCallback(
    async (page: number, search?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await employeeService.getAll(
          page,
          pagination.itemsPerPage,
          search
        );

        const employeeData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data[0])
            ? response.data[0]
            : [];

        setEmployees(employeeData);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch employees"
        );
        toast.error("Error", {
          description:
            err instanceof Error ? err.message : "Failed to fetch employees",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.itemsPerPage]
  );

  useEffect(() => {
    if (hasMounted.current) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchEmployees(1, debouncedSearchTerm || undefined);
    } else {
      fetchEmployees(1);
      hasMounted.current = true;
    }
  }, [debouncedSearchTerm, fetchEmployees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage && pagination.nextPage) {
      fetchEmployees(pagination.nextPage, debouncedSearchTerm || undefined);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      fetchEmployees(pagination.prevPage, debouncedSearchTerm || undefined);
    }
  };

  const refreshCurrentPage = () => {
    fetchEmployees(pagination.currentPage, debouncedSearchTerm || undefined);
  };

  const handleCreateEmployee = async (data: CreateEmployeeFormData) => {
    try {
      await employeeService.create(data);
      toast.success("Employee created", {
        description: `${data.name} has been created successfully.`,
      });
      setIsCreateDialogOpen(false);
      resetCreate();
      fetchEmployees(1, debouncedSearchTerm || undefined);
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to create employee",
      });
    }
  };

  const handleEditEmployee = async (data: UpdateEmployeeFormData) => {
    if (!selectedEmployee) return;

    try {
      await employeeService.update(selectedEmployee.id, data);
      toast("Employee updated", {
        description: `${selectedEmployee.name} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update employee",
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await employeeService.delete(selectedEmployee.id);
      toast("Employee deleted", {
        description: `${selectedEmployee.name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete employee",
      });
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    resetUpdate({
      name: employee.name,
      email: employee.email,
      code: employee.code || "",
      role: employee.role || "",
      contactNumber: employee.contactNumber || "",
      verified: employee.verified || false,
      address: employee.address || "",
      gender: employee.gender || "",
      dob: employee.dob || "",
      ssn: employee.ssn || "",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading && employees.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size={12} className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && employees.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Employees
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchEmployees(1)}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage employees across all organizations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${employee.role === "doctor"
                          ? "bg-green-500"
                          : employee.role === "nurse"
                            ? "bg-blue-500"
                            : employee.role === "admin"
                              ? "bg-purple-500"
                              : "bg-gray-500"
                          }`}
                      ></div>
                      <span className="capitalize">{employee.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.contactNumber}</TableCell>
                  <TableCell>
                    {employee.verified ? (
                      <span className="text-green-500">Yes</span>
                    ) : (
                      <span className="text-red-500">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(employee)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm
                      ? "No employees found matching your search."
                      : "No employees found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {(employees.length > 0 || pagination.currentPage > 1) && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} total employees
              {searchTerm && ` • Searching for "${searchTerm}"`}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePreviousPage}
                    className={
                      !pagination.hasPrevPage || isLoading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;

                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.totalPages - 2
                    ) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    if (pageNum <= 0 || pageNum > pagination.totalPages)
                      return null;

                    return (
                      <PaginationItem key={`page-${pageNum}`}>
                        <PaginationLink
                          onClick={() =>
                            fetchEmployees(
                              pageNum,
                              debouncedSearchTerm || undefined
                            )
                          }
                          isActive={pageNum === pagination.currentPage}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}

                {pagination.totalPages > 5 &&
                  pagination.currentPage < pagination.totalPages - 2 && (
                    <>
                      <PaginationItem key="ellipsis">
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem key={`page-${pagination.totalPages}`}>
                        <PaginationLink
                          onClick={() =>
                            fetchEmployees(
                              pagination.totalPages,
                              debouncedSearchTerm || undefined
                            )
                          }
                          className="cursor-pointer"
                        >
                          {pagination.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    className={
                      !pagination.hasNextPage || isLoading
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Results Summary */}
        {employees.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {employees.length} employee
            {employees.length !== 1 ? "s" : ""} on this page
          </div>
        )}
      </div>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee in the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(handleCreateEmployee)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...registerCreate("name")}
                    placeholder="Dr. John Smith"
                  />
                  {createErrors.name && (
                    <p className="text-sm text-destructive">
                      {createErrors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerCreate("email")}
                    placeholder="john.smith@hospital.org"
                  />
                  {createErrors.email && (
                    <p className="text-sm text-destructive">
                      {createErrors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  type="code"
                  {...registerCreate("code")}
                  placeholder="••••••••"
                />
                {createErrors.code && (
                  <p className="text-sm text-destructive">
                    {createErrors.code.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    {...registerCreate("role")}
                    onValueChange={(value) => {
                      registerCreate("role").onChange({
                        target: {
                          name: "role",
                          value,
                        },
                      });
                    }}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {createErrors.role && (
                    <p className="text-sm text-destructive">
                      {createErrors.role.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    {...registerCreate("contactNumber")}
                    placeholder="+15551234567"
                  />
                  {createErrors.contactNumber && (
                    <p className="text-sm text-destructive">
                      {createErrors.contactNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN (optional)</Label>
                  <Input
                    id="ssn"
                    type="text"
                    {...registerCreate("ssn")}
                    placeholder="123-45-6789"
                  />
                  {createErrors.ssn && (
                    <p className="text-sm text-destructive">
                      {createErrors.ssn.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    {...registerCreate("gender")}
                    onValueChange={(value) => {
                      registerCreate("gender").onChange({
                        target: {
                          name: "gender",
                          value,
                        },
                      });
                    }}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {createErrors.gender && (
                    <p className="text-sm text-destructive">
                      {createErrors.gender.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" {...registerCreate("dob")} />
                  {createErrors.dob && (
                    <p className="text-sm text-destructive">
                      {createErrors.dob.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...registerCreate("address")}
                  placeholder="123 Medical Dr, Boston, MA"
                />
                {createErrors.address && (
                  <p className="text-sm text-destructive">
                    {createErrors.address.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="verified"
                type="checkbox"
                {...registerCreate("verified")}
                className="h-4 w-4"
              />
              <Label htmlFor="verified">Verified</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Check this box to make employee active.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetCreate();
                  setIsCreateDialogOpen(false);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit(handleEditEmployee)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" {...registerUpdate("name")} />
                  {updateErrors.name && (
                    <p className="text-sm text-destructive">
                      {updateErrors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...registerUpdate("email")}
                  />
                  {updateErrors.email && (
                    <p className="text-sm text-destructive">
                      {updateErrors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code</Label>
                <Input
                  id="edit-code"
                  type="text"
                  {...registerUpdate("code")}
                  placeholder="••••••••"
                />
                {updateErrors.code && (
                  <p className="text-sm text-destructive">
                    {updateErrors.code.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    {...registerUpdate("role")}
                    onValueChange={(value) => {
                      registerUpdate("role").onChange({
                        target: {
                          name: "role",
                          value,
                        },
                      });
                    }}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {updateErrors.role && (
                    <p className="text-sm text-destructive">
                      {updateErrors.role.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactNumber">Contact Number</Label>
                  <Input
                    id="edit-contactNumber"
                    {...registerUpdate("contactNumber")}
                  />
                  {updateErrors.contactNumber && (
                    <p className="text-sm text-destructive">
                      {updateErrors.contactNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ssn">SSN (optional)</Label>
                  <Input
                    id="edit-ssn"
                    type="text"
                    {...registerUpdate("ssn")}
                    placeholder="123-45-6789"
                  />
                  {updateErrors.ssn && (
                    <p className="text-sm text-destructive">
                      {updateErrors.ssn.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="edit-verified"
                  type="checkbox"
                  {...registerUpdate("verified")}
                  onChange={(e) => {
                    registerUpdate("verified").onChange({
                      target: {
                        name: "verified",
                        value: e.target.checked,
                      },
                    });
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-verified">Verified</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Check this box to make employee active.
              </p>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" {...registerUpdate("address")} />
                {updateErrors.address && (
                  <p className="text-sm text-destructive">
                    {updateErrors.address.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  resetUpdate();
                  setIsEditDialogOpen(false);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={selectedEmployee.name}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Code
                  </p>
                  <p>{selectedEmployee.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verified
                  </p>
                  <p>
                    {selectedEmployee.verified ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Role
                  </p>
                  <p className="capitalize">{selectedEmployee.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </p>
                  <p>{selectedEmployee.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    SSN
                  </p>
                  <p>{selectedEmployee.ssn || "Not provided"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p>{new Date(selectedEmployee.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedEmployee.address && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p>{selectedEmployee.address}</p>
                </div>
              )}
              {selectedEmployee.gender && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Gender
                    </p>
                    <p className="capitalize">{selectedEmployee.gender}</p>
                  </div>
                  {selectedEmployee.dob && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p>
                        {new Date(selectedEmployee.dob).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedEmployee?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
