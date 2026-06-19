"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { approvePayment, rejectPayment, updateOrderStatus } from "@/actions/orders";
import { formatCurrency, formatDate, generateOrderId } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_COLORS, type Order, type OrderStatus } from "@/types";

interface AdminOrderRowProps {
  order: Order & {
    profile?: { full_name: string | null; email: string };
    order_items?: { product?: { name: string }; quantity: number; price: number }[];
  };
}

export function AdminOrderRow({ order }: AdminOrderRowProps) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const result = await approvePayment(order.id);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Payment approved");
  }

  async function handleReject() {
    setLoading(true);
    const result = await rejectPayment(order.id);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Payment rejected");
  }

  async function handleStatusChange(status: OrderStatus) {
    const result = await updateOrderStatus(order.id, status);
    if (result.error) toast.error(result.error);
    else toast.success("Status updated");
  }

  return (
    <tr className="border-b">
      <td className="px-4 py-3 text-sm font-medium">
        #{generateOrderId(order.id)}
      </td>
      <td className="px-4 py-3 text-sm">
        <div>{order.full_name}</div>
        <div className="text-muted-foreground">{order.profile?.email}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        {formatCurrency(order.total_amount)}
      </td>
      <td className="px-4 py-3">
        <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
          {order.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(order.created_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {order.payment_receipt_url && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Payment Receipt</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={order.payment_receipt_url}
                    alt="Payment receipt"
                    fill
                    className="object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

          {order.status === "Pending Verification" && (
            <>
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleApprove}
                disabled={loading}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={handleReject}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}

          <Select
            value={order.status}
            onValueChange={(value) => handleStatusChange(value as OrderStatus)}
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </td>
    </tr>
  );
}
