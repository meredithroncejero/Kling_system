"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, updateProduct, uploadProductImage } from "@/actions/products";
import { productSchema, type ProductFormData } from "@/lib/validations";
import { PRODUCT_CATEGORIES, type Product } from "@/types";

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.image_url ? product.image_url.split(",").filter(Boolean) : []
  );
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          stock: product.stock,
        }
      : undefined,
  });

  const category = watch("category");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadProductImage(formData);
      if (result.error) {
        toast.error(`Failed to upload ${file.name}: ${result.error}`);
      } else if (result.url) {
        uploadedUrls.push(result.url);
      }
    }

    setUploading(false);

    if (uploadedUrls.length > 0) {
      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: ProductFormData) {
    setLoading(true);
    const serializedImages = imageUrls.join(",");
    const result = product
      ? await updateProduct(product.id, data, serializedImages || "")
      : await createProduct(data, serializedImages || "");
    setLoading(false);

    if (result.error) toast.error(result.error);
    else {
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setValue("category", value as ProductFormData["category"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (PHP)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input id="stock" type="number" {...register("stock")} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product Images (Multiple allowed)</Label>
            <Input id="images" type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
            {uploading && <p className="text-xs text-muted-foreground animate-pulse">Uploading images...</p>}
            
            {imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-md border bg-muted animate-in fade-in zoom-in-95 duration-200">
                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100 shadow-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-kling-forest px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
                        Cover Image
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
