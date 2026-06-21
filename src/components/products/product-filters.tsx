"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/types";
import { cn } from "@/lib/utils";

const categoryColors: Record<ProductCategory, string> = {
  Bracelet: "bg-kling-pink/20 text-kling-forest border-kling-pink/50 hover:bg-kling-pink/30",
  Charm: "bg-kling-blue/20 text-kling-forest border-kling-blue/50 hover:bg-kling-blue/30",
  Keychain: "bg-kling-yellow/25 text-kling-forest border-kling-yellow/50 hover:bg-kling-yellow/35",
  Necklace: "bg-kling-red/15 text-kling-forest border-kling-red/40 hover:bg-kling-red/25",
};

const categoryActive: Record<ProductCategory, string> = {
  Bracelet: "bg-kling-pink text-kling-forest border-kling-pink shadow-kling",
  Charm: "bg-kling-blue text-white border-kling-blue",
  Keychain: "bg-kling-yellow text-kling-forest border-kling-yellow",
  Necklace: "bg-kling-red text-white border-kling-red",
};

const customCategory = "Custom";

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const currentCategory = searchParams.get("category") ?? "all";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("search", search);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-sm">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kling-forest/50" />
          <Input
            placeholder="Search beads, bracelets, charms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border-kling-pink/30 bg-white pl-10 focus-visible:ring-kling-pink"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParams("category", "all")}
          className={cn(
            "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-all",
            currentCategory === "all"
              ? "border-kling-green bg-kling-green text-white shadow-sm"
              : "border-kling-green/40 bg-kling-green/10 text-kling-forest hover:bg-kling-green/20"
          )}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => updateParams("category", category)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-all",
              currentCategory === category
                ? categoryActive[category]
                : categoryColors[category]
            )}
          >
            {category}
          </button>
        ))}
        <button
          type="button"
          onClick={() => updateParams("category", customCategory)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-all",
            currentCategory === customCategory
              ? "border-purple-400 bg-purple-200 text-kling-forest shadow-sm"
              : "border-purple-300 bg-purple-100/70 text-kling-forest hover:bg-purple-100"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Custom
        </button>
      </div>
    </div>
  );
}
