import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, generateOrderId } from "@/lib/utils";
import { ORDER_STATUS_COLORS, type Order, type OrderItem, type Product } from "@/types";

interface OrderCardProps {
  order: Order & {
    order_items: (OrderItem & { product: Product })[];
  };
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Order #{generateOrderId(order.id)}
        </CardTitle>
        <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
          {order.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
        <div className="space-y-1">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product?.name} x{item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(order.total_amount)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
