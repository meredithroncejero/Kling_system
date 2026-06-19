import { redirect } from "next/navigation";
import { getCartItems } from "@/actions/cart";
import { getGcashQrUrl } from "@/actions/settings";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { CartItem, Product } from "@/types";

export default async function CheckoutPage() {
  const [cartItems, gcashQrUrl] = await Promise.all([
    getCartItems(),
    getGcashQrUrl(),
  ]);

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-kling-forest">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Complete your order by filling in your details and uploading payment proof.
      </p>
      <div className="mt-8">
        <CheckoutForm
          cartItems={cartItems as (CartItem & { product: Product })[]}
          gcashQrUrl={gcashQrUrl}
        />
      </div>
    </div>
  );
}
