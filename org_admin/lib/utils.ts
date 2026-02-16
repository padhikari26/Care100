import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateForInput = (dateString: string | undefined) => {
  return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
};
