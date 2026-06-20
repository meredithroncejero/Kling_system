import { getFeaturedProducts } from "@/actions/products";
import { ProductHeroCarousel } from "@/components/layout/product-hero-carousel";
import type { Product } from "@/types";

export async function HeroSection() {
  const products = (await getFeaturedProducts(8)) as Product[];

  return <ProductHeroCarousel products={products} />;
}
