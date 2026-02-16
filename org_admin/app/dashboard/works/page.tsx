"use client";

import type React from "react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/loading-spinner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { workService, type UpdateWorkDto, type Work } from "@/lib/works";
import type { PaginationResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Define validation schemas
const createWorkSchema = z.object({
  code: z.number().min(1, "Work code is required"),
  name: z.string().min(1, "Work name is required"),
  description: z.string().optional(),
});

const updateWorkSchema = createWorkSchema;
const assignWorkSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  clientId: z.string().min(1, "Client is required"),
  workId: z.string().min(1, "Work is required"),
});

type CreateWorkFormData = z.infer<typeof createWorkSchema>;
type UpdateWorkFormData = z.infer<typeof updateWorkSchema>;
type AssignWorkFormData = z.infer<typeof assignWorkSchema>;

export default function WorksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);
  const [isClientsLoading, setIsClientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationResponse>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  });

  const hasMounted = useRef(false);

  // Initialize forms
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<CreateWorkFormData>({
    resolver: zodResolver(createWorkSchema),
    mode: "all",
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
  } = useForm<UpdateWorkFormData>({
    resolver: zodResolver(updateWorkSchema),
    mode: "all",
  });

  const fetchWorks = useCallback(
    async (page: number, search?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await workService.getAll(
          page,
          pagination.itemsPerPage,
          search
        );

        setWorks(response.data);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch works");
        toast("Error", {
          description:
            err instanceof Error ? err.message : "Failed to fetch works",
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
      fetchWorks(1, debouncedSearchTerm || undefined);
    } else {
      hasMounted.current = true;
      fetchWorks(1);
    }
  }, [debouncedSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage && pagination.nextPage) {
      fetchWorks(pagination.nextPage, debouncedSearchTerm || undefined);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      fetchWorks(pagination.prevPage, debouncedSearchTerm || undefined);
    }
  };

  const refreshCurrentPage = () => {
    fetchWorks(pagination.currentPage, debouncedSearchTerm || undefined);
  };

  const handleCreateWork = async (data: CreateWorkFormData) => {
    try {
      const response = await workService.create(data);
      console.log(response);
      if (response.status === 201) {
        toast("Work created", {
          description: `${data.name} has been created successfully.`,
        });
        setIsCreateDialogOpen(false);
        resetCreate();
        fetchWorks(1, debouncedSearchTerm || undefined);
      } else {
        toast("Error", {
          description: response.message || "Failed to create work",
        });
      }
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to create work",
      });
    }
  };

  const handleEditWork = async (data: UpdateWorkFormData) => {
    if (!selectedWork) return;

    try {
      const updateData: UpdateWorkDto = {
        code: Number.parseInt(data.code.toString()),
        name: data.name,
        description: data.description,
      };
      await workService.update(selectedWork.id, updateData);
      toast("Work updated", {
        description: `${selectedWork.name} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update work",
      });
    }
  };

  const handleDeleteWork = async () => {
    if (!selectedWork) return;

    try {
      await workService.delete(selectedWork.id);
      toast("Work deleted", {
        description: `${selectedWork.name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete work",
      });
    }
  };

  // const handleAssignWork = async (data: AssignWorkFormData) => {
  //   try {
  //     await workService.assignWork(data);
  //     toast("Work assigned", {
  //       description: "The work has been assigned successfully.",
  //     });
  //     setIsAssignDialogOpen(false);
  //     resetAssign();
  //   } catch (err) {
  //     toast("Error", {
  //       description:
  //         err instanceof Error ? err.message : "Failed to assign work",
  //     });
  //   }
  // };

  const openEditDialog = (work: Work) => {
    setSelectedWork(work);
    resetUpdate({
      code: work.code,
      name: work.name,
      description: work.description || "",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading && works.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size={12} className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && works.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold mb-2">Error Loading Works</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchWorks(1)}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Works</h1>
            <p className="text-muted-foreground">
              Manage healthcare works and services
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Work
            </Button>
            {/* <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Work
            </Button> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search works..."
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((work) => (
                <TableRow key={work.id}>
                  <TableCell>{work.code}</TableCell>
                  <TableCell className="font-medium">{work.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {work.description}
                  </TableCell>
                  <TableCell>
                    {new Date(work.createdAt).toLocaleDateString()}
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
                            setSelectedWork(work);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(work)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWork(work);
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
              {works.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm
                      ? "No works found matching your search."
                      : "No works found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {(works.length > 0 || pagination.currentPage > 1) && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} total works
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

                    // Ensure pageNum is within valid range
                    if (pageNum < 1 || pageNum > pagination.totalPages) {
                      return null;
                    }

                    return (
                      <PaginationItem key={`page-${pageNum}`}>
                        <PaginationLink
                          onClick={() =>
                            fetchWorks(
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
                            fetchWorks(
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
        {works.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {works.length} work{works.length !== 1 ? "s" : ""} on this
            page
          </div>
        )}
      </div>

      {/* Create Work Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Work</DialogTitle>
            <DialogDescription>
              Create a new healthcare work or service.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(handleCreateWork)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Work Code</Label>
                  <Input
                    id="code"
                    type="number"
                    placeholder="1001"
                    {...registerCreate("code", { valueAsNumber: true })}
                  />
                  {createErrors.code && (
                    <p className="text-sm text-red-500">
                      {createErrors.code.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Work Name</Label>
                  <Input
                    id="name"
                    placeholder="Medication Administration"
                    {...registerCreate("name")}
                  />
                  {createErrors.name && (
                    <p className="text-sm text-red-500">
                      {createErrors.name.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Administering prescribed medications to clients"
                  rows={3}
                  {...registerCreate("description")}
                />
                {createErrors.description && (
                  <p className="text-sm text-red-500">
                    {createErrors.description.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                Create Work
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Work Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Work</DialogTitle>
            <DialogDescription>Update the work details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit(handleEditWork)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Work Code</Label>
                  <Input
                    id="edit-code"
                    type="number"
                    {...registerUpdate("code", { valueAsNumber: true })}
                  />
                  {updateErrors.code && (
                    <p className="text-sm text-red-500">
                      {updateErrors.code.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Work Name</Label>
                  <Input id="edit-name" {...registerUpdate("name")} />
                  {updateErrors.name && (
                    <p className="text-sm text-red-500">
                      {updateErrors.name.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  {...registerUpdate("description")}
                />
                {updateErrors.description && (
                  <p className="text-sm text-red-500">
                    {updateErrors.description.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Work Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Work Details</DialogTitle>
          </DialogHeader>
          {selectedWork && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Work Code
                  </p>
                  <p>{selectedWork.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Work Name
                  </p>
                  <p>{selectedWork.name}</p>
                </div>
              </div>
              {selectedWork.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p>{selectedWork.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p>{new Date(selectedWork.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p>{new Date(selectedWork.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Work Dialog */}
      {/* <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Assign Work</DialogTitle>
            <DialogDescription>
              Assign a work to an employee and client.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit(handleAssignWork)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select
                  onValueChange={(value) => setAssignValue("employeeId", value)}
                  disabled={isEmployeesLoading}
                >
                  <SelectTrigger id="employeeId">
                    <SelectValue
                      placeholder={
                        isEmployeesLoading ? "Loading..." : "Select employee"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignErrors.employeeId && (
                  <p className="text-sm text-red-500">
                    {assignErrors.employeeId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select
                  onValueChange={(value) => setAssignValue("clientId", value)}
                  disabled={isClientsLoading}
                >
                  <SelectTrigger id="clientId">
                    <SelectValue
                      placeholder={
                        isClientsLoading ? "Loading..." : "Select client"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignErrors.clientId && (
                  <p className="text-sm text-red-500">
                    {assignErrors.clientId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workId">Work</Label>
                <Select
                  onValueChange={(value) => setAssignValue("workId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="workId">
                    <SelectValue
                      placeholder={isLoading ? "Loading..." : "Select work"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {works.map((work) => (
                      <SelectItem key={work.id} value={work.id}>
                        {work.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignErrors.workId && (
                  <p className="text-sm text-red-500">
                    {assignErrors.workId.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning}>
                Assign Work
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog> */}

      {/* Delete Work Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedWork?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWork}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
