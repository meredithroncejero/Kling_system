"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/actions/cart";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductDetailDialogProps {
  product: Product;
}

export function ProductDetailDialog({ product }: ProductDetailDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const isSoldOut = product.stock === 0;

  const imageUrls = product.image_url ? product.image_url.split(",").filter(Boolean) : [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  async function handleAddToCart() {
    setLoading(true);
    const result = await addToCart(product.id, quantity);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Added to cart!");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" disabled={isSoldOut}>
          {isSoldOut ? "Sold Out" : "View Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-kling-forest">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted border border-white/40">
              {imageUrls.length > 0 ? (
                <Image
                  src={imageUrls[activeImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-300"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingCart className="h-16 w-16 opacity-20" />
                </div>
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      activeImageIndex === index
                        ? "border-kling-pink ring-2 ring-kling-pink/20"
                        : "border-muted opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} gallery ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
            </div>

            <p className="text-2xl font-semibold text-primary">
              {formatCurrency(product.price)}
            </p>

            <p className="text-sm text-muted-foreground">{product.description}</p>

            <p className="text-sm">
              <span className="font-medium">Stock:</span>{" "}
              {isSoldOut ? (
                <span className="text-destructive">This product is currently sold out.</span>
              ) : (
                `${product.stock} available`
              )}
            </p>

            {!isSoldOut && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleAddToCart} disabled={loading} className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {loading ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
