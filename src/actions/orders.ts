"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";

export async function getCustomerOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getAllOrders(page: number = 1, limit: number = 10) {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, email), order_items(*, product:products(name))", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    orders: data ?? [],
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
    currentPage: page,
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function approvePayment(orderId: string) {
  return updateOrderStatus(orderId, "Payment Verified");
}

export async function rejectPayment(orderId: string) {
  return updateOrderStatus(orderId, "Rejected");
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [products, orders, pendingOrders, sales] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending Verification"),
    supabase
      .from("orders")
      .select("total_amount")
      .in("status", ["Payment Verified", "Processing", "Shipped", "Completed"]),
  ]);

  const totalSales = (sales.data ?? []).reduce(
    (sum, order) => sum + Number(order.total_amount),
    0
  );

  return {
    totalProducts: products.count ?? 0,
    totalOrders: orders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    totalSales,
  };
}

export async function getSalesReport(period: "daily" | "weekly" | "monthly") {
  const supabase = await createClient();
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "daily":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      break;
    case "weekly":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 84);
      break;
    case "monthly":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      break;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .gte("created_at", startDate.toISOString())
    .in("status", ["Payment Verified", "Processing", "Shipped", "Completed"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const grouped = new Map<string, { sales: number; orders: number }>();

  for (const order of data ?? []) {
    const date = new Date(order.created_at);
    let key: string;

    if (period === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (period === "weekly") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = grouped.get(key) ?? { sales: 0, orders: 0 };
    existing.sales += Number(order.total_amount);
    existing.orders += 1;
    grouped.set(key, existing);
  }

  return Array.from(grouped.entries()).map(([date, stats]) => ({
    date,
    sales: stats.sales,
    orders: stats.orders,
  }));
}

export async function exportOrdersCSV() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profile:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const headers = [
    "Order ID",
    "Customer",
    "Email",
    "Total",
    "Status",
    "Date",
  ];
  const rows = (data ?? []).map((order) => [
    order.id,
    order.full_name,
    (order.profile as { email: string })?.email ?? "",
    order.total_amount,
    order.status,
    order.created_at,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
