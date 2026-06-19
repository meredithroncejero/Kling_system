import { getProducts } from "@/actions/products";
import { InventoryTable } from "@/components/admin/inventory-table";
import type { Product } from "@/types";

export default async function AdminInventoryPage() {
  const { products } = await getProducts({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-kling-forest">Inventory</h1>
        <p className="text-muted-foreground">View and update stock levels.</p>
      </div>
      <InventoryTable products={products as Product[]} />
    </div>
  );
}
