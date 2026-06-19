import { Package } from "lucide-react";
import { getCustomerOrders } from "@/actions/orders";
import { OrderCard } from "@/components/orders/order-card";
import type { Order, OrderItem, Product } from "@/types";

export default async function DashboardPage() {
  const orders = (await getCustomerOrders()) as (Order & {
    order_items: (OrderItem & { product: Product })[];
  })[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-kling-forest">My Orders</h1>
      <p className="mt-2 text-muted-foreground">Track the status of your orders.</p>

      {orders.length === 0 ? (
        <div className="mt-16 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-lg text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
