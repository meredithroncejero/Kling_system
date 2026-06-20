"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateCartQuantity, removeFromCart } from "@/actions/cart";
import { formatCurrency } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

interface CartItemRowProps {
  item: CartItem & { product: Product };
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { product } = item;

  async function handleQuantityChange(newQuantity: number) {
    const result = await updateCartQuantity(item.id, newQuantity);
    if (result.error) toast.error(result.error);
  }

  async function handleRemove() {
    const result = await removeFromCart(item.id);
    if (result.error) toast.error(result.error);
    else toast.success("Item removed from cart");
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
          {product.image_url ? (
            <Image src={product.image_url.split(",")[0]} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <p className="mt-1 font-semibold text-primary">
            {formatCurrency(product.price)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= product.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-right">
          <p className="font-semibold">
            {formatCurrency(product.price * item.quantity)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-8 w-8 text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between border-t pt-4 text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(subtotal)}</span>
        </div>
        <Link href="/checkout">
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
