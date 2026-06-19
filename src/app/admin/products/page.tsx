import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getProducts } from "@/actions/products";
import { deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export default async function AdminProductsPage() {
  const { products } = await getProducts({ limit: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-kling-forest">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product: Product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold text-primary">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(product.id);
                  }}
                >
                  <Button variant="destructive" size="sm" type="submit">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
