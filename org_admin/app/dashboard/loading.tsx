import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size={12} className="h-32" />
      </div>
    </DashboardLayout>
  );
}
