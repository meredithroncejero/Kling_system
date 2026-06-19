import { getAllOrders } from "@/actions/orders";
import { AdminOrderRow } from "@/components/admin/admin-order-row";
import { Pagination } from "@/components/pagination";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/types";

interface AdminOrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { orders, totalPages, currentPage } = await getAllOrders(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-kling-forest">Orders</h1>
        <p className="text-muted-foreground">Manage and verify customer orders.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => (
                  <AdminOrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/orders"
      />
    </div>
  );
}
