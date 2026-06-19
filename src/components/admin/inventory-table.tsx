"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { updateStock } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface InventoryTableProps {
  products: Product[];
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [stocks, setStocks] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, p.stock]))
  );
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpdate(productId: string) {
    const stock = stocks[productId];
    if (stock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    setLoading(productId);
    const result = await updateStock(productId, stock);
    setLoading(null);

    if (result.error) toast.error(result.error);
    else toast.success("Stock updated");
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      value={stocks[product.id]}
                      onChange={(e) =>
                        setStocks((prev) => ({
                          ...prev,
                          [product.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(product.id)}
                      disabled={loading === product.id}
                    >
                      {loading === product.id ? "Saving..." : "Update"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
