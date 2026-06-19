"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitOrder, uploadPaymentReceipt } from "@/actions/cart";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

interface CheckoutFormProps {
  cartItems: (CartItem & { product: Product })[];
  gcashQrUrl: string;
}

export function CheckoutForm({ cartItems, gcashQrUrl }: CheckoutFormProps) {
  const router = useRouter();
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadPaymentReceipt(formData);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      setReceiptUrl(result.url);
      toast.success("Receipt uploaded successfully");
    }
  }

  async function onSubmit(data: CheckoutFormData) {
    if (!receiptUrl) {
      toast.error("Please upload your payment receipt before submitting.");
      return;
    }

    setSubmitting(true);
    const result = await submitOrder(data, receiptUrl);
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.orderId) {
      router.push(`/checkout/success?orderId=${result.orderId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input id="contact_number" {...register("contact_number")} />
              {errors.contact_number && (
                <p className="text-sm text-destructive">{errors.contact_number.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_address">Shipping Address</Label>
              <Textarea id="shipping_address" rows={3} {...register("shipping_address")} />
              {errors.shipping_address && (
                <p className="text-sm text-destructive">{errors.shipping_address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GCash Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan the QR code using GCash and upload proof of payment.
            </p>
            {gcashQrUrl ? (
              <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg border">
                <Image src={gcashQrUrl} alt="GCash QR Code" fill className="object-contain" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                GCash QR code not yet configured. Please contact the shop.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="receipt">Payment Receipt</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  disabled={uploading}
                />
                {receiptUrl && (
                  <span className="text-sm text-green-600">Uploaded ✓</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-4 text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting || !receiptUrl}
            >
              <Upload className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Order"}
            </Button>
            {!receiptUrl && (
              <p className="text-center text-xs text-muted-foreground">
                Upload payment receipt to enable order submission
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
