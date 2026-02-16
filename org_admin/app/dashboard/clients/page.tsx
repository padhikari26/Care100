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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { clientService, type Client } from "@/lib/clients";
import { PaginationResponse } from "@/types";
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Define validation schemas
const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  medicalId: z.string().min(1, "Medical ID is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email address"),
});

const updateClientSchema = createClientSchema;

type CreateClientFormData = z.infer<typeof createClientSchema>;
type UpdateClientFormData = z.infer<typeof updateClientSchema>;

export default function ClientsPage() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientWorks, setClientWorks] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasMounted = useRef(false);

  // Initialize forms
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    mode: "all",
  });

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
  } = useForm<UpdateClientFormData>({
    resolver: zodResolver(updateClientSchema),
    mode: "all",
  });

  const fetchClients = useCallback(
    async (page: number, search?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await clientService.getAll(
          page,
          pagination.itemsPerPage,
          search
        );

        setClients(response.data);
        setPagination(response.pagination);

        // Generate client works data
        const worksData: Record<string, number> = {};
        response.data.forEach((client) => {
          worksData[client.id] = Math.floor(Math.random() * 5) + 1;
        });
        setClientWorks(worksData);

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch clients"
        );
        toast("Error", {
          description:
            err instanceof Error ? err.message : "Failed to fetch clients",
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
      fetchClients(1, debouncedSearchTerm || undefined);
    } else {
      fetchClients(1);
      hasMounted.current = true;
    }
  }, [debouncedSearchTerm, fetchClients]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage && pagination.nextPage) {
      fetchClients(pagination.nextPage, debouncedSearchTerm || undefined);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage && pagination.prevPage) {
      fetchClients(pagination.prevPage, debouncedSearchTerm || undefined);
    }
  };

  const refreshCurrentPage = () => {
    fetchClients(pagination.currentPage, debouncedSearchTerm || undefined);
  };

  const handleCreateClient = async (data: CreateClientFormData) => {
    try {
      await clientService.create(data);
      toast("Client created", {
        description: `${data.name} has been created successfully.`,
      });
      setIsCreateDialogOpen(false);
      resetCreate();
      fetchClients(1, debouncedSearchTerm || undefined);
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to create client",
      });
    }
  };

  const handleEditClient = async (data: UpdateClientFormData) => {
    if (!selectedClient) return;
    try {
      await clientService.update(selectedClient.id, data);
      toast("Client updated", {
        description: `${selectedClient.name} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      refreshCurrentPage();
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update client",
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      await clientService.delete(selectedClient.id);
      toast("Client deleted", {
        description: `${selectedClient.name} has been deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      fetchClients(1);
    } catch (err) {
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete client",
      });
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    resetUpdate({
      name: client.name,
      medicalId: client.medicalId,
      contactNumber: client.contactNumber,
      email: client.email || "",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading && clients.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size={12} className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && clients.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold mb-2">Error Loading Clients</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchClients(1)}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage clients across all organizations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
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
                <TableHead>Client</TableHead>
                <TableHead>Medical ID</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32`}
                          alt={client.name}
                        />
                        <AvatarFallback>
                          {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.medicalId}</TableCell>
                  <TableCell>{client.contactNumber}</TableCell>
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
                            setSelectedClient(client);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(client)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedClient(client);
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
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {searchTerm
                      ? "No clients found matching your search."
                      : "No clients found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {(clients.length > 0 || pagination.currentPage > 1) && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages} •{" "}
              {pagination.totalItems} total clients
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
                            fetchClients(
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
                            fetchClients(
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
        {clients.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {clients.length} client{clients.length !== 1 ? "s" : ""} on
            this page
          </div>
        )}
      </div>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client in the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(handleCreateClient)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    {...registerCreate("name")}
                  />
                  {createErrors.name && (
                    <p className="text-sm text-red-500">
                      {createErrors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalId">Medical ID</Label>
                  <Input
                    id="medicalId"
                    placeholder="MED123456789"
                    {...registerCreate("medicalId")}
                  />
                  {createErrors.medicalId && (
                    <p className="text-sm text-red-500">
                      {createErrors.medicalId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    placeholder="+15559876543"
                    {...registerCreate("contactNumber")}
                  />
                  {createErrors.contactNumber && (
                    <p className="text-sm text-red-500">
                      {createErrors.contactNumber.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  {...registerCreate("email")}
                />
                {createErrors.email && (
                  <p className="text-sm text-red-500">
                    {createErrors.email.message}
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
                Create Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update the client details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit(handleEditClient)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input id="edit-name" {...registerUpdate("name")} />
                  {updateErrors.name && (
                    <p className="text-sm text-red-500">
                      {updateErrors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-medicalId">Medical ID</Label>
                  <Input id="edit-medicalId" {...registerUpdate("medicalId")} />
                  {updateErrors.medicalId && (
                    <p className="text-sm text-red-500">
                      {updateErrors.medicalId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contactNumber">Contact Number</Label>
                  <Input
                    id="edit-contactNumber"
                    {...registerUpdate("contactNumber")}
                  />
                  {updateErrors.contactNumber && (
                    <p className="text-sm text-red-500">
                      {updateErrors.contactNumber.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...registerUpdate("email")}
                />
                {updateErrors.email && (
                  <p className="text-sm text-red-500">
                    {updateErrors.email.message}
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

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={selectedClient.name}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedClient.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedClient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Medical ID
                  </p>
                  <p>{selectedClient.medicalId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </p>
                  <p>{selectedClient.contactNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assigned Works
                </p>
                <p>{clientWorks[selectedClient.id] || 0} works assigned</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p>{new Date(selectedClient.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedClient?.name}? This
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
            <Button variant="destructive" onClick={handleDeleteClient}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
