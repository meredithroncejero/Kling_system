"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CheckoutFormData } from "@/lib/validations";

export async function getCartItems() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:products(*)")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addToCart(productId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to add items to cart" };

  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (!product || product.stock === 0) {
    return { error: "This product is currently sold out." };
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  const newQuantity = (existing?.quantity ?? 0) + quantity;
  if (newQuantity > product.stock) {
    return { error: `Only ${product.stock} items available in stock.` };
  }

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { data: cartItem } = await supabase
    .from("cart_items")
    .select("*, product:products(stock)")
    .eq("id", cartItemId)
    .single();

  if (!cartItem) return { error: "Cart item not found" };

  const stock = (cartItem.product as { stock: number })?.stock ?? 0;
  if (quantity > stock) {
    return { error: `Only ${stock} items available in stock.` };
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);

  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId);

  if (error) return { error: error.message };
  revalidatePath("/cart");
  return { success: true };
}

export async function getCartCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

export async function submitOrder(
  checkoutData: CheckoutFormData,
  receiptUrl: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!receiptUrl) {
    return { error: "Payment receipt is required to submit your order." };
  }

  const cartItems = await getCartItems();
  if (cartItems.length === 0) return { error: "Your cart is empty." };

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = (item.product as { price: number })?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      status: "Pending Verification",
      payment_receipt_url: receiptUrl,
      shipping_address: checkoutData.shipping_address,
      contact_number: checkoutData.contact_number,
      full_name: checkoutData.full_name,
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: (item.product as { price: number })?.price ?? 0,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) return { error: itemsError.message };

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  revalidatePath("/cart");
  revalidatePath("/dashboard");
  revalidatePath("/admin/orders");

  return { success: true, orderId: order.id };
}

export async function uploadPaymentReceipt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-receipts")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: signedData } = await supabase.storage
    .from("payment-receipts")
    .createSignedUrl(fileName, 60 * 60 * 24 * 365);

  return { url: signedData?.signedUrl ?? fileName };
}
