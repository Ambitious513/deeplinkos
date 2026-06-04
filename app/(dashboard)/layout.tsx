import { Sidebar } from "@/components/dashboard/sidebar";
import { ToastProvider } from "@/lib/toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
