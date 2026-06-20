"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductHeroCarouselProps {
  products: Product[];
}

const AUTO_PLAY_MS = 5000;

export function ProductHeroCarousel({ products }: ProductHeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = products.length;
  const hasProducts = total > 0;

  const goTo = useCallback(
    (index: number) => {
      if (!hasProducts) return;
      setCurrent((index + total) % total);
    },
    [hasProducts, total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!hasProducts || isPaused || total <= 1) return;

    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [hasProducts, isPaused, total, next]);

  if (!hasProducts) {
    return (
      <section className="relative overflow-hidden border-b border-white/50 bg-gradient-to-b from-white/80 via-kling-pink/5 to-background py-16 text-center">
        <div className="container mx-auto px-4">
          <Logo size="hero" showLink={false} className="mx-auto" />
          <p className="mt-2 font-script text-2xl text-kling-forest md:text-3xl">
            beads jewelry
          </p>
          <h1 className="mt-6 font-display text-3xl font-bold text-kling-forest md:text-4xl">
            Colorful Handmade Pieces,
            <span className="kling-gradient-text"> Made with Love</span>
          </h1>
        </div>
      </section>
    );
  }

  const product = products[current];

  return (
    <section
      className="relative overflow-hidden border-b border-white/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative h-[55vh] min-h-[420px] max-h-[600px] w-full md:h-[65vh]">
        {products.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              index === current ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={index !== current}
          >
            {item.image_url ? (
              <Image
                src={item.image_url.split(",")[0]}
                alt={item.name}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-kling-pink/20 via-kling-blue/10 to-kling-yellow/20">
                <ShoppingBag className="h-24 w-24 text-kling-forest/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-kling-forest/75 via-kling-forest/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-kling-forest/50 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content overlay */}
        <div className="container relative mx-auto flex h-full items-center px-4">
          <div className="max-w-xl text-white">
            <Logo size="sm" showLink={false} className="mb-4 drop-shadow-lg" />
            <Badge className="mb-3 border-white/30 bg-white/20 text-white backdrop-blur-sm">
              {product.category}
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-tight drop-shadow-md md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 line-clamp-2 text-sm text-white/90 md:text-base">
              {product.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <span className="font-display text-2xl font-bold text-kling-pink md:text-3xl">
                {formatCurrency(product.price)}
              </span>
              {product.stock === 0 ? (
                <Badge variant="destructive">Sold Out</Badge>
              ) : (
                <span className="text-sm text-white/80">{product.stock} in stock</span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/#collection">
                <Button
                  size="lg"
                  className="rounded-full bg-kling-pink font-semibold text-kling-forest shadow-kling hover:bg-kling-pink/90"
                >
                  Shop Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:left-6 md:h-12 md:w-12"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:right-6 md:h-12 md:w-12"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Dots + slide counter */}
      {total > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {products.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === current
                    ? "w-8 bg-kling-pink"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-white/70">
            {current + 1} / {total}
          </span>
        </div>
      )}
    </section>
  );
}
