import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  try {
    const product = await getProductById(id);
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-display text-3xl font-bold text-kling-forest">Edit Product</h1>
        <ProductForm product={product} />
      </div>
    );
  } catch {
    notFound();
  }
}
