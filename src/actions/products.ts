"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProductCategory } from "@/types";
import type { ProductFormData } from "@/lib/validations";

interface ProductFilters {
  category?: ProductCategory | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const { category, search, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    products: data ?? [],
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
    currentPage: page,
  };
}

export async function getFeaturedProducts(limit = 8) {
  const supabase = await createClient();

  const { data: withImages, error: imageError } = await supabase
    .from("products")
    .select("*")
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (imageError) throw new Error(imageError.message);
  if (withImages && withImages.length > 0) return withImages;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(
  formData: ProductFormData,
  imageUrl?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    ...formData,
    image_url: imageUrl ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProduct(
  id: string,
  formData: ProductFormData,
  imageUrl?: string
) {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = { ...formData };
  if (imageUrl !== undefined) updateData.image_url = imageUrl;

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateStock(id: string, stock: number) {
  if (stock < 0) return { error: "Stock cannot be negative" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { success: true };
}

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return { url: publicUrl };
}
