import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-kling-forest">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
