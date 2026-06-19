import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateOrderId } from "@/lib/utils";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="space-y-4 p-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="font-display text-2xl font-bold text-kling-forest">Order Submitted!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ll verify your payment and update you soon.
          </p>
          {orderId && (
            <p className="text-lg font-semibold">
              Order ID: <span className="text-primary">#{generateOrderId(orderId)}</span>
            </p>
          )}
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/dashboard">
              <Button className="w-full">Track My Order</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
