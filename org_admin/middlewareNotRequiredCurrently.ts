import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "./lib/api-client";
import { UserType } from "./types";

// Define protected and public routes
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];
const adminRoutes = ["/dashboard/organizations"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  const token = req.cookies.get("authToken")?.value;

  // If accessing a protected route
  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    try {
      // Verify token and check role
      const response = await fetch(
        `${
          process.env.BACKEND_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          API_BASE_URL
        }/auth/me`,
        {
          headers: {
            Cookie: req.headers.get("cookie") || "",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.log("Token verification failed, redirecting to login");

        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }

      const user = await response.json();
      const hasPermission =
        user.userType === UserType.super_admin ||
        user.userType === UserType.organization;

      if (
        adminRoutes.includes(path) &&
        user.userType !== UserType.super_admin
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      }
      if (!hasPermission) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
  }

  // If trying to access login while already logged in with valid role, redirect to dashboard
  if (path === "/login" && token) {
    try {
      const response = await fetch(
        `${
          process.env.BACKEND_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          API_BASE_URL
        }/auth/me`,
        {
          headers: {
            Cookie: req.headers.get("cookie") || "",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const user = await response.json();
        const hasPermission =
          user.userType === "super_admin" || user.userType === "organization";

        if (hasPermission) {
          return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
        }
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
