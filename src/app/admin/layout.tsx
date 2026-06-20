import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminMobileHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex-1 overflow-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
