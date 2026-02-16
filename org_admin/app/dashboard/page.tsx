'use client';

import { DashboardLayout } from "@/components/dashboard-layout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import {
  Briefcase,
  ClipboardList,
  User,
  Users,
} from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

interface DashboardResponse {
  status: number;
  message: string;
  dashboardData: DashboardData;
}

interface DashboardData {
  totalEmployees: number;
  totalClients: number;
  totalTimesheets: number;
  totalWork: number;
}

export default function DashboardPage() {

  const [userType, setUserType] = useState<string>("");

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userTypeFromStorage = localStorage.getItem("userType");
        if (userTypeFromStorage) {
          setUserType(userTypeFromStorage);
        } else {
          console.error("User type not found in localStorage");
        }
        const DashboardResponse = await apiClient.get<DashboardResponse>("/users/dashboard");
        const data = DashboardResponse.dashboardData;
        if (!data) {
          throw new Error("No data found in dashboard response");
        }
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, []);


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your system's performance and activities
          </p>
        </div>
        {
          userType === "organization" &&
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalEmployees || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clients
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalClients || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Works
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalWork || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Timesheets Submitted
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.totalTimesheets || 0}</div>
              </CardContent>
            </Card>
          </div>
        }

        {/* <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {i % 2 === 0
                          ? "New employee added"
                          : "Timesheet submitted"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i % 2 === 0
                          ? "Organization: General Hospital"
                          : "Employee: John Doe"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {i}h ago
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${i <= 2 ? "bg-destructive" : "bg-amber-500"
                        }`}
                    ></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {i % 3 === 0
                          ? "Review timesheet"
                          : i % 2 === 0
                            ? "Approve work assignment"
                            : "Client follow-up"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due in {i} day{i !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-xs font-medium">
                      {i <= 2 ? "High" : "Medium"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
