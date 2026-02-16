"use client";

import type React from "react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import {
  timesheetService,
  type CompletedWork,
  type Timesheet,
  type TimesheetEmployee,
} from "@/lib/timesheets";
import type { PaginationResponse } from "@/types";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { time } from "console";

export default function TimesheetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(
    null
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [employees, setEmployees] = useState<TimesheetEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayCount: 0,
    completedCount: 0,
    incompleteCount: 0,
  });

  // Download popover state
  const [downloadPopoverOpen, setDownloadPopoverOpen] = useState(false);
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");
  const [downloadEmployee, setDownloadEmployee] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // PDF Preview state
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");

  const itemsPerPage = 10;

  const fetchTimesheets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: {
        employeeId?: string;
        date?: string;
        endDate?: string;
        search?: string;
      } = {};

      if (employeeFilter && employeeFilter !== "all") {
        params.employeeId = employeeFilter;
      }

      if (startDate) {
        params.date = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const response = await timesheetService.getAll(params);

      // Transform data to match your interface
      const transformedData = response.data.map((timesheet) => ({
        ...timesheet,
        employeeName: timesheet.Employee?.name,
        clientName: timesheet.Client?.name,
      }));

      setTimesheets(transformedData);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const todayCount = response.data.filter(
        (timesheet) =>
          new Date(timesheet.date).toISOString().split("T")[0] === today
      ).length;

      const completedCount = response.data.filter((timesheet) => {
        const totalWorks = timesheet.completedWorks.length || 0;
        const completedWorks = timesheet.completedWorks.length || 0;
        return totalWorks === completedWorks;
      }).length;

      const incompleteCount = response.data.length - completedCount;

      setStats({
        todayCount,
        completedCount,
        incompleteCount,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch timesheets"
      );
      toast("Error", {
        description:
          err instanceof Error ? err.message : "Failed to fetch timesheets",
      });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, employeeFilter, debouncedSearchTerm]);

  const fetchEmployees = useCallback(async () => {
    setIsEmployeesLoading(true);
    try {
      const response = await timesheetService.getEmployeeList();
      console.log(response);

      setEmployees(response.employees);
    } catch (err) {
      toast("Error", {
        description: "Failed to fetch employees",
      });
    } finally {
      setIsEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTimesheets();
  }, [startDate, endDate, employeeFilter, debouncedSearchTerm]);

  // Cleanup PDF preview URL when dialog closes
  useEffect(() => {
    if (!isPdfPreviewOpen && pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }, [isPdfPreviewOpen, pdfPreviewUrl]);

  // Get current page items
  const currentTimesheets = timesheets.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleEmployeeFilterChange = (value: string) => {
    setEmployeeFilter(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const setQuickDateRange = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    setStartDate(startDate.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const getTimesheetStatus = (
    timesheet: Timesheet
  ): "completed" | "incomplete" => {
    const totalWorks = timesheet.completedWorks.length || 0;
    const completedWorks = timesheet.completedWorks.length || 0;
    return totalWorks === completedWorks ? "completed" : "incomplete";
  };

  // Calculate the end of the week (Sunday) based on a start date
  const getWeekEndDate = (startDate: string): string => {
    const start = new Date(startDate);
    const dayOfWeek = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToAdd = 6 - dayOfWeek; // Days to add to reach the end of week (6 days later)
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + 6); // Always add 6 days for a 7-day week
    return endDate.toISOString().split("T")[0];
  };

  // Check if the date range is exactly 7 days (a week)
  const isValidWeekRange = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 6; // Exactly 6 days difference (7 days total including start day)
  };

  // When start date changes, automatically set end date to the end of that week
  const handleDownloadStartDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newStartDate = e.target.value;
    setDownloadStartDate(newStartDate);

    if (newStartDate) {
      const weekEndDate = getWeekEndDate(newStartDate);
      setDownloadEndDate(weekEndDate);
    } else {
      setDownloadEndDate("");
    }
  };

  // Generate a random number for unique filename
  const generateRandomNumber = (): string => {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
  };

  // Handle the weekly timesheet download
  const handleDownloadWeekly = async () => {
    // Validate employee selection
    if (!downloadEmployee) {
      toast("Employee required", {
        description: "Please select a particular employee for download.",
      });
      return;
    }

    // Validate date selection
    if (!downloadStartDate) {
      toast("Start date required", {
        description: "Please select a start date.",
      });
      return;
    }

    if (!isValidWeekRange(downloadStartDate, downloadEndDate)) {
      const correctEndDate = getWeekEndDate(downloadStartDate);
      toast("Invalid date range", {
        description: `The week should end on ${new Date(
          correctEndDate
        ).toLocaleDateString()}.`,
      });
      return;
    }

    setIsDownloading(true);

    try {
      // Filter timesheets for the selected employee and date range
      const filteredTimesheets = timesheets.filter((timesheet) => {
        const timesheetDate = new Date(timesheet.date)
          .toISOString()
          .split("T")[0];
        const isInDateRange =
          timesheetDate >= downloadStartDate &&
          timesheetDate <= downloadEndDate;
        const isSelectedEmployee = timesheet.employeeId === downloadEmployee;
        return isInDateRange && isSelectedEmployee;
      });

      if (filteredTimesheets.length === 0) {
        toast("No timesheets found", {
          description:
            "No timesheets found for the selected employee and date range.",
        });
        setIsDownloading(false);
        return;
      }

      // Call the API with the filtered timesheets
      const blob = await timesheetService.downloadWeekly({
        timesheets: filteredTimesheets,
        startDate: downloadStartDate,
        endDate: downloadEndDate,
        employeeId: downloadEmployee,
      });

      // Generate a unique filename with random number
      const randomNum = generateRandomNumber();
      const fileName = `timesheet-${downloadStartDate}-${randomNum}.pdf`;
      setPdfFileName(fileName);

      // Create object URL for PDF preview
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);

      // Open PDF preview dialog
      setIsPdfPreviewOpen(true);

      toast("Timesheet ready for preview", {
        description: `Weekly timesheet for ${employees.find((e) => e.id === downloadEmployee)?.name
          } has been generated.`,
      });

      // Reset and close popover
      setDownloadPopoverOpen(false);
    } catch (err) {
      toast("Error", {
        description: "Failed to generate timesheet preview",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const toLocalTime = (isoString: any) => {
    const utcDate = new Date(isoString);
    return utcDate.toUTCString().split(" ")[4];
  };


  // Handle manual download from PDF preview
  const handleManualDownload = () => {
    if (!pdfPreviewUrl || !pdfFileName) return;

    const link = document.createElement("a");
    link.href = pdfPreviewUrl;
    link.download = pdfFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast("Timesheet downloaded", {
      description: `The timesheet has been downloaded as ${pdfFileName}`,
    });
  };

  if (isLoading && timesheets.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size={12} className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && timesheets.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Timesheets
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchTimesheets()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground">
            View and manage employee timesheets
          </p>
        </div>
        {/* 
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Timesheets
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todayCount > 0
                  ? `${stats.todayCount} submitted today`
                  : "No timesheets today"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Works
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedCount > 0
                  ? `${stats.completedCount} timesheets completed`
                  : "No completed timesheets"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Incomplete Works
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.incompleteCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.incompleteCount > 0
                  ? `${stats.incompleteCount} timesheets incomplete`
                  : "No incomplete timesheets"}
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search timesheets..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Select
              value={employeeFilter || "all"}
              onValueChange={handleEmployeeFilterChange}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue
                  placeholder={
                    isEmployeesLoading ? "Loading..." : "All employees"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Date Range Filter</Label>
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label
                  htmlFor="start-date"
                  className="text-xs text-muted-foreground"
                >
                  From Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="end-date"
                  className="text-xs text-muted-foreground"
                >
                  To Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="w-full"
                  min={startDate || undefined}
                />
              </div>
            </div>

            {/* Quick Date Range Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickDateRange(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickDateRange(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickDateRange(90)}
              >
                Last 90 days
              </Button>

              {/* Download Weekly Popover */}
              <Popover
                open={downloadPopoverOpen}
                onOpenChange={setDownloadPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Weekly
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Download Weekly Timesheets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Select Employee
                        </Label>
                        <Select
                          value={downloadEmployee}
                          onValueChange={setDownloadEmployee}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Choose an employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees?.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Select Week Range
                        </Label>
                        <div className="space-y-2">
                          <div>
                            <Label
                              htmlFor="download-start-date"
                              className="text-xs text-muted-foreground"
                            >
                              Start Date (Week Beginning)
                            </Label>
                            <Input
                              id="download-start-date"
                              type="date"
                              value={downloadStartDate}
                              onChange={handleDownloadStartDateChange}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="download-end-date"
                              className="text-xs text-muted-foreground"
                            >
                              End Date (7 days from start)
                            </Label>
                            <Input
                              id="download-end-date"
                              type="date"
                              value={downloadEndDate}
                              onChange={(e) => { }} // No-op function to make it read-only
                              className="w-full bg-gray-50 cursor-not-allowed"
                              disabled
                            />
                          </div>
                        </div>
                        {downloadStartDate && downloadEndDate && (
                          <div className="text-xs text-muted-foreground">
                            Selected range:{" "}
                            {new Date(downloadStartDate).toLocaleDateString()} -{" "}
                            {new Date(downloadEndDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleDownloadWeekly}
                          disabled={
                            isDownloading ||
                            !downloadEmployee ||
                            !downloadStartDate
                          }
                          className="flex-1"
                        >
                          {isDownloading ? (
                            <>
                              <LoadingSpinner size={4} className="mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDownloadStartDate("");
                            setDownloadEndDate("");
                            setDownloadEmployee("");
                            setDownloadPopoverOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In/Out</TableHead>
                <TableHead>Works Done</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTimesheets.map((timesheet) => {
                const status = getTimesheetStatus(timesheet);
                const completedWorksCount =
                  timesheet.completedWorks.length || 0;

                return (
                  <TableRow key={timesheet.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32`}
                            alt={timesheet.employeeName}
                          />
                          <AvatarFallback>
                            {timesheet.employeeName
                              ? timesheet.employeeName
                                .substring(0, 2)
                                .toUpperCase()
                              : "EM"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {timesheet.employeeName || "Unknown Employee"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {timesheet.clientName || "Unknown Client"}
                    </TableCell>
                    <TableCell>
                      {new Date(timesheet.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          In: {toLocalTime(timesheet.clockIn)}
                        </div>
                        {timesheet.clockOut && (
                          <div className="flex items-center text-sm">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            Out: {toLocalTime(timesheet.clockOut)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{completedWorksCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "completed" ? "default" : "destructive"
                        }
                        className={
                          status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }
                      >
                        {status === "completed" ? "Completed" : "Incomplete"}
                      </Badge>
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
                              setSelectedTimesheet(timesheet);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() =>
                              handleDownloadTimesheet(timesheet.id)
                            }
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {currentTimesheets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No timesheets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.max(prev.currentPage - 1, 1),
                  }))
                }
                className={
                  pagination.currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNumber;
                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (
                  pagination.currentPage >=
                  pagination.totalPages - 2
                ) {
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  pageNumber = pagination.currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          currentPage: pageNumber,
                        }))
                      }
                      isActive={pagination.currentPage === pageNumber}
                    >
                      {pageNumber}
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
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: Math.min(
                      prev.currentPage + 1,
                      prev.totalPages
                    ),
                  }))
                }
                className={
                  pagination.currentPage === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* View Timesheet Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Timesheet Details</DialogTitle>
          </DialogHeader>
          {selectedTimesheet && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40`}
                      alt={selectedTimesheet.employeeName}
                    />
                    <AvatarFallback>
                      {selectedTimesheet.employeeName
                        ? selectedTimesheet.employeeName
                          .substring(0, 2)
                          .toUpperCase()
                        : "EM"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedTimesheet.employeeName || "Unknown Employee"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Employee</p>
                  </div>
                </div>
                <Badge
                  variant={
                    getTimesheetStatus(selectedTimesheet) === "completed"
                      ? "default"
                      : "destructive"
                  }
                  className={
                    getTimesheetStatus(selectedTimesheet) === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }
                >
                  {getTimesheetStatus(selectedTimesheet) === "completed"
                    ? "Completed"
                    : "Incomplete"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Client
                  </p>
                  <p>{selectedTimesheet.clientName || "Unknown Client"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date
                  </p>
                  <p>{new Date(selectedTimesheet.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Clock In
                  </p>
                  <p>
                    {new Date(selectedTimesheet.clockIn).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Clock Out
                  </p>
                  <p>
                    {selectedTimesheet.clockOut
                      ? new Date(
                        selectedTimesheet.clockOut
                      ).toLocaleTimeString()
                      : "Not clocked out"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Works Completed
                </p>
                <div className="space-y-2">
                  {Array.isArray(selectedTimesheet.completedWorks) &&
                    selectedTimesheet.completedWorks.length > 0 ? (
                    selectedTimesheet.completedWorks.map(
                      (work: CompletedWork, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          {work.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {work.name}
                            {work.code && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({work.code})
                              </span>
                            )}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-muted-foreground italic">
                      No works completed
                    </div>
                  )}
                </div>
              </div>

              {getTimesheetStatus(selectedTimesheet) === "incomplete" &&
                selectedTimesheet.reason && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Reason for Incomplete Works
                    </p>
                    <p className="text-sm">{selectedTimesheet.reason}</p>
                  </div>
                )}

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Client Signature
                </p>
                {selectedTimesheet.clientSignature ? (
                  //show base64 image
                  <div className="border rounded p-4">
                    <img
                      src={`data:image/png;base64,${selectedTimesheet.clientSignature}`}
                      alt="Client Signature"
                      style={{ maxHeight: "200px", width: "auto" }}
                    />
                  </div>
                ) : (
                  <div className="border rounded p-4 text-center">
                    <p className="italic text-muted-foreground">
                      No signature provided
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {/* <Button
              variant="outline"
              onClick={() =>
                handleDownloadTimesheet(selectedTimesheet?.id || "")
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button> */}
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Timesheet Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="border rounded-md overflow-hidden"
              style={{ height: "70vh" }}
            >
              {pdfPreviewUrl && (
                <iframe
                  src={`${pdfPreviewUrl}#toolbar=0`}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Preview of timesheet for{" "}
              {employees.find((e) => e.id === downloadEmployee)?.name} from{" "}
              {downloadStartDate &&
                new Date(downloadStartDate).toLocaleDateString()}{" "}
              to{" "}
              {downloadEndDate &&
                new Date(downloadEndDate).toLocaleDateString()}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPdfPreviewOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handleManualDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
