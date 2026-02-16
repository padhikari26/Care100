"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { organizationService, type Organization } from "@/lib/organizations";
import { formatDateForInput } from "@/lib/utils";
import type { PaginationResponse } from "@/types";
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Define validation schemas
const createOrganizationSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  orgType: z.string().min(1, "Organization type is required"),
  providerId: z.string().min(1, "Provider ID is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  description: z.string().optional(),
  expiryDate: z.string().optional(),
  logo: z.string().optional(),
  createdAt: z.string().optional(),
});

const updateOrganizationSchema = createOrganizationSchema.omit({
  password: true,
});

type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;
type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>;

export default function OrganizationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMounted = useRef(false);

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

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize forms
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
    mode: "all",
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
  } = useForm<UpdateOrganizationFormData>({
    resolver: zodResolver(updateOrganizationSchema),
    mode: "all",
  });

  const fetchOrganizations = useCallback(
    async (page: number, search?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await organizationService.getAll(
          page,
          pagination.itemsPerPage,
          search
        );

        setOrganizations(response.data);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch organizations"
        );
        toast("Error", {
          description:
            err instanceof Error
              ? err.message
              : "Failed to fetch organizations",
        });
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    [pagination.itemsPerPage]
  );

  // Reset pagination when search changes
  useEffect(() => {
    if (hasMounted.current) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      setIsSearching(true);
      fetchOrganizations(1, debouncedSearchTerm || undefined);
    } else {
      hasMounted.current = true;
      fetchOrganizations(1);
    }
  }, [debouncedSearchTerm, fetchOrganizations]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage && pagination.nextPage) {
      fetchOrganizations(pagination.nextPage, debouncedSearchTerm || undefined);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      fetchOrganizations(pagination.prevPage, debouncedSearchTerm || undefined);
    }
  };

  const refreshCurrentPage = () => {
    fetchOrganizations(
      pagination.currentPage,
      debouncedSearchTerm || undefined
    );
  };

  const handleCreateOrg = async (data: CreateOrganizationFormData) => {
    try {
      await organizationService.create(data);
      toast("Organization created", {
        description: `${data.orgName} has been created successfully.`,
      });
      setIsCreateDialogOpen(false);
      resetCreate();
      // Refresh first page
      fetchOrganizations(1, debouncedSearchTerm || undefined);
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to create organization",
      });
    }
  };

  const handleEditOrg = async (data: UpdateOrganizationFormData) => {
    if (!selectedOrg) return;

    try {
      await organizationService.update(selectedOrg.id, data);
      toast("Organization updated", {
        description: `${selectedOrg.orgName} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      // Refresh current page
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update organization",
      });
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;

    try {
      await organizationService.delete(selectedOrg.id);
      toast("Organization deleted", {
        description: `${selectedOrg.orgName} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      // Refresh current page
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete organization",
      });
    }
  };

  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    resetUpdate({
      orgName: org.orgName,
      orgType: org.orgType,
      providerId: org.providerId,
      email: org.email,
      description: org.description || "",
      expiryDate: formatDateForInput(org.expiryDate) || "",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading && organizations.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size={12} className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && organizations.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Organizations
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchOrganizations(1)}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage healthcare organizations in the system
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Organization
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search organizations by name, email, or provider ID..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {isSearching && (
              <div className="absolute right-2.5 top-2.5">
                <LoadingSpinner size={4} />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.orgName}</TableCell>
                  <TableCell>{org.orgType}</TableCell>
                  <TableCell>{org.providerId}</TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>
                    {org.expiryDate ? (
                      new Date(org.expiryDate).toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(org.createdAt).toLocaleDateString()}
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
                            setSelectedOrg(org);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            console.log(org);
                            openEditDialog(org);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrg(org);
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
              {organizations.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm
                      ? "No organizations found matching your search."
                      : "No organizations found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {(organizations.length > 0 || pagination.currentPage > 1) && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} total organizations
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

                {/* Show page numbers */}
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(
                      1,
                      Math.min(
                        pagination.currentPage - 2 + i,
                        pagination.totalPages - 4 + i
                      )
                    );

                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() =>
                            fetchOrganizations(
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
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
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
        {organizations.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {organizations.length} organization
            {organizations.length !== 1 ? "s" : ""} on this page
          </div>
        )}
      </div>

      {/* All your existing dialogs remain the same */}
      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Organization</DialogTitle>
            <DialogDescription>
              Create a new healthcare organization in the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(handleCreateOrg)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    {...registerCreate("orgName")}
                    placeholder="General Hospital"
                  />
                  {createErrors.orgName && (
                    <p className="text-sm text-destructive">
                      {createErrors.orgName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgType">Organization Type</Label>
                  <Input
                    id="orgType"
                    {...registerCreate("orgType")}
                    placeholder="Hospital"
                  />
                  {createErrors.orgType && (
                    <p className="text-sm text-destructive">
                      {createErrors.orgType.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerId">Provider ID</Label>
                  <Input
                    id="providerId"
                    {...registerCreate("providerId")}
                    placeholder="HOSP12345"
                  />
                  {createErrors.providerId && (
                    <p className="text-sm text-destructive">
                      {createErrors.providerId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerCreate("email")}
                    placeholder="admin@hospital.org"
                  />
                  {createErrors.email && (
                    <p className="text-sm text-destructive">
                      {createErrors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...registerCreate("expiryDate")}
                  />
                  {createErrors.expiryDate && (
                    <p className="text-sm text-destructive">
                      {createErrors.expiryDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...registerCreate("password")}
                  placeholder="••••••••"
                />
                {createErrors.password && (
                  <p className="text-sm text-destructive">
                    {createErrors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...registerCreate("description")}
                  placeholder="A leading healthcare provider in the region"
                  rows={3}
                />
                {createErrors.description && (
                  <p className="text-sm text-destructive">
                    {createErrors.description.message}
                  </p>
                )}
              </div>
            </div>
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
                {isCreating ? "Creating..." : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update the organization details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit(handleEditOrg)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-orgName">Organization Name</Label>
                  <Input id="edit-orgName" {...registerUpdate("orgName")} />
                  {updateErrors.orgName && (
                    <p className="text-sm text-destructive">
                      {updateErrors.orgName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-orgType">Organization Type</Label>
                  <Input id="edit-orgType" {...registerUpdate("orgType")} />
                  {updateErrors.orgType && (
                    <p className="text-sm text-destructive">
                      {updateErrors.orgType.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-providerId">Provider ID</Label>
                  <Input
                    id="edit-providerId"
                    {...registerUpdate("providerId")}
                  />
                  {updateErrors.providerId && (
                    <p className="text-sm text-destructive">
                      {updateErrors.providerId.message}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                  <Input
                    id="edit-expiryDate"
                    type="date"
                    {...registerUpdate("expiryDate")}
                  />
                  {updateErrors.expiryDate && (
                    <p className="text-sm text-destructive">
                      {updateErrors.expiryDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  {...registerUpdate("description")}
                  rows={3}
                />
                {updateErrors.description && (
                  <p className="text-sm text-destructive">
                    {updateErrors.description.message}
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

      {/* View Organization Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Organization Name
                  </p>
                  <p>{selectedOrg.orgName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Organization Type
                  </p>
                  <p>{selectedOrg.orgType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Provider ID
                  </p>
                  <p>{selectedOrg.providerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{selectedOrg.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expiry Date
                  </p>
                  <p>
                    {selectedOrg.expiryDate
                      ? new Date(selectedOrg.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {selectedOrg.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p>{selectedOrg.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p>{new Date(selectedOrg.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedOrg?.orgName}? This
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
            <Button variant="destructive" onClick={handleDeleteOrg}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
