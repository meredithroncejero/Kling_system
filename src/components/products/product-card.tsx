"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ProductDetailDialog } from "@/components/products/product-detail-dialog";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.stock === 0;
  const firstImageUrl = product.image_url ? product.image_url.split(",")[0] : null;

  return (
    <Card className="kling-card group overflow-hidden">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-kling-pink/10 via-white to-kling-blue/10">
        {firstImageUrl ? (
          <Image
            src={firstImageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-20" />
          </div>
        )}
        {isSoldOut && (
          <Badge className="absolute left-3 top-3 bg-destructive text-destructive-foreground">
            Sold Out
          </Badge>
        )}
        <Badge variant="secondary" className="absolute right-3 top-3">
          {product.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-display font-semibold leading-tight text-kling-forest">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-kling-pink">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">
            {isSoldOut ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <ProductDetailDialog product={product} />
      </CardFooter>
    </Card>
  );
}
