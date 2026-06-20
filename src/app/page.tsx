import { Suspense } from "react";
import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { CustomOrderSection } from "@/components/products/custom-order-section";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGridSkeleton } from "@/components/products/product-grid-skeleton";
import { Pagination } from "@/components/pagination";
import { ErrorBoundary } from "@/components/error-boundary";
import { HeroSection } from "@/components/layout/hero-section";
import { HeroCarouselSkeleton } from "@/components/layout/hero-carousel-skeleton";
import type { ProductCategory } from "@/types";

interface HomePageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

async function ProductGrid({
  category,
  search,
  page,
}: {
  category?: string;
  search?: string;
  page: number;
}) {
  if (category === "Custom") {
    return <CustomOrderSection />;
  }

  const { products, totalPages, currentPage } = await getProducts({
    category: (category as ProductCategory) ?? "all",
    search,
    page,
  });

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="font-display text-lg text-kling-forest">No products found.</p>
        <p className="mt-1 text-sm">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-8">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  return (
    <div>
      <Suspense fallback={<HeroCarouselSkeleton />}>
        <HeroSection />
      </Suspense>

      <section id="collection" className="container mx-auto px-4 py-12">
        <h2 className="kling-section-title">Our Collection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse bracelets, charms, necklaces, and keychains
        </p>

        <div className="mt-6">
          <Suspense fallback={null}>
            <ProductFilters />
          </Suspense>
        </div>

        <div className="mt-8">
          <ErrorBoundary>
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid
                category={params.category}
                search={params.search}
                page={page}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
}
