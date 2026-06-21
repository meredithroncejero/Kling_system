import { getCustomerOrders } from "@/actions/orders";
import { getCustomerCustomRequests } from "@/actions/custom-requests";
import { DashboardClient } from "@/components/orders/dashboard-client";
import type { Order, OrderItem, Product } from "@/types";

export default async function DashboardPage() {
  const orders = (await getCustomerOrders()) as (Order & {
    order_items: (OrderItem & { product: Product })[];
  })[];

  const customRequests = await getCustomerCustomRequests();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-kling-forest">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of your orders and custom requests.
        </p>
      </div>

      <div className="mt-8">
        <DashboardClient orders={orders} customRequests={customRequests} />
      </div>
    </div>
  );
}
