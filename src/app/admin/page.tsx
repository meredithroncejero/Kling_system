import { getDashboardStats, getSalesReport } from "@/actions/orders";
import { StatsCards } from "@/components/admin/stats-cards";
import { SalesChart } from "@/components/admin/sales-chart";

export default async function AdminDashboardPage() {
  const [stats, salesData] = await Promise.all([
    getDashboardStats(),
    getSalesReport("daily"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-kling-forest">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance.</p>
      </div>
      <StatsCards stats={stats} />
      <SalesChart data={salesData} title="Daily Sales (Last 30 Days)" />
    </div>
  );
}
