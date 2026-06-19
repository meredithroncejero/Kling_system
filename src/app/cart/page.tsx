import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCartItems } from "@/actions/cart";
import { CartItemRow, CartSummary } from "@/components/cart/cart-items";
import { Button } from "@/components/ui/button";
import type { CartItem, Product } from "@/types";

export default async function CartPage() {
  const cartItems = (await getCartItems()) as (CartItem & { product: Product })[];

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection and add some beautiful pieces.
        </p>
        <Link href="/" className="mt-6">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-kling-forest">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
        <div>
          <CartSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  );
}
