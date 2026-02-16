'use client'

import type React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UserType } from "@/types";
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { LoadingSpinner } from "./loading-spinner";
import { ModeToggle } from "./mode-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  const { user, userType, logout } = useAuth();
  let logoPreview =
    typeof window !== "undefined"
      ? localStorage.getItem("logo") || "/placeholder.svg"
      : "/placeholder.svg";

  // Define routes based on user type
  const routes =
    userType === UserType.super_admin
      ? [
        {
          label: "Dashboard",
          icon: BarChart3,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          label: "Organizations",
          icon: Building2,
          href: "/dashboard/organizations",
          active: pathname === "/dashboard/organizations",
        },
      ]
      : [
        {
          label: "Dashboard",
          icon: BarChart3,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          label: "Organizations",
          icon: Building2,
          href: "/dashboard/organizations",
          active: pathname === "/dashboard/organizations",
        },
        {
          label: "Employees",
          icon: Users,
          href: "/dashboard/employees",
          active: pathname === "/dashboard/employees",
        },
        {
          label: "Clients",
          icon: User,
          href: "/dashboard/clients",
          active: pathname === "/dashboard/clients",
        },
        {
          label: "Works",
          icon: Briefcase,
          href: "/dashboard/works",
          active: pathname === "/dashboard/works",
        },
        {
          label: "Timesheets",
          icon: ClipboardList,
          href: "/dashboard/timesheets",
          active: pathname === "/dashboard/timesheets",
        },
        {
          label: "Settings",
          icon: Settings,
          href: "/dashboard/settings",
          active: pathname === "/dashboard/settings",
        },
      ];

  if (!user || !userType) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={12} className="h-32" />
      </div>
    );
  }
  const filteredRoutes = routes.filter((route) => {
    return !(
      userType === UserType.organization &&
      route.href === "/dashboard/organizations"
    );
  });


  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background z-10">
        <div className="flex h-16 items-center px-4 sm:px-6">
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-4 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-72">
                <nav className="flex flex-col gap-4 mt-8">
                  {filteredRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                        route.active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="font-bold text-xl hidden md:inline-block">
                Healthcare Admin
              </span>
              <span className="font-bold text-xl md:hidden">HA</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <div className="flex items-center gap-4">
              <img
                src={logoPreview || "/placeholder.svg"}
                alt="Organization Logo"
                className="h-10 w-10 rounded-lg object-cover border"
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium">
                  {user?.name || user?.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.userType}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <aside className="w-64 border-r bg-background hidden md:block overflow-y-auto">
            <nav className="flex flex-col gap-1 p-4">
              {filteredRoutes.map((route) => {
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                      route.active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
