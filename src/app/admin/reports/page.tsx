import { getSalesReport } from "@/actions/orders";
import { ReportsClient } from "@/components/admin/reports-client";

export default async function AdminReportsPage() {
  const [dailyData, weeklyData, monthlyData] = await Promise.all([
    getSalesReport("daily"),
    getSalesReport("weekly"),
    getSalesReport("monthly"),
  ]);

  return (
    <ReportsClient
      dailyData={dailyData}
      weeklyData={weeklyData}
      monthlyData={monthlyData}
    />
  );
}
