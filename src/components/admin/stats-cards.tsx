"use client";

import { Package, ShoppingCart, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statConfig = [
  { key: "totalProducts" as const, label: "Total Products", icon: Package },
  { key: "totalOrders" as const, label: "Total Orders", icon: ShoppingCart },
  { key: "pendingOrders" as const, label: "Pending Orders", icon: Clock },
  { key: "totalSales" as const, label: "Total Sales", icon: DollarSign, isCurrency: true },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon, isCurrency }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isCurrency ? formatCurrency(stats[key]) : stats[key]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
