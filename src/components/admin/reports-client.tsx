"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SalesChart } from "@/components/admin/sales-chart";
import { exportOrdersCSV } from "@/actions/orders";
import type { SalesDataPoint } from "@/types";

interface ReportsClientProps {
  dailyData: SalesDataPoint[];
  weeklyData: SalesDataPoint[];
  monthlyData: SalesDataPoint[];
}

export function ReportsClient({
  dailyData,
  weeklyData,
  monthlyData,
}: ReportsClientProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportOrdersCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
    setExporting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-kling-forest">Sales Reports</h1>
          <p className="text-muted-foreground">Analyze your store performance.</p>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <SalesChart data={dailyData} title="Daily Sales (Last 30 Days)" />
        </TabsContent>
        <TabsContent value="weekly">
          <SalesChart data={weeklyData} title="Weekly Sales (Last 12 Weeks)" />
        </TabsContent>
        <TabsContent value="monthly">
          <SalesChart data={monthlyData} title="Monthly Sales (Last 12 Months)" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
