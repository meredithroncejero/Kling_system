"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CUSTOM_REQUEST_STATUSES,
  PRODUCT_CATEGORIES,
  type CustomRequest,
  type CustomRequestStatus,
  type ProductCategory,
} from "@/types";

type ActionResult = {
  success?: boolean;
  error?: string;
  orderId?: string;
};

type CustomRequestFilters = {
  page?: number;
  status?: string;
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
};

const MAX_REFERENCE_SIZE = 5 * 1024 * 1024;
const REFERENCE_BUCKET = "custom-request-references";

function isProductCategory(value: FormDataEntryValue | null): value is ProductCategory {
  return typeof value === "string" && PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

function isCustomRequestStatus(value: string): value is CustomRequestStatus {
  return CUSTOM_REQUEST_STATUSES.includes(value as CustomRequestStatus);
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function attachReferenceUrls(requests: CustomRequest[]) {
  const supabase = await createClient();

  return Promise.all(
    requests.map(async (request) => {
      if (!request.reference_image_path) {
        return { ...request, reference_image_url: null };
      }

      const { data } = await supabase.storage
        .from(REFERENCE_BUCKET)
        .createSignedUrl(request.reference_image_path, 60 * 60);

      return {
        ...request,
        reference_image_url: data?.signedUrl ?? null,
      };
    })
  );
}

export async function submitCustomRequest(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please log in before submitting a custom request." };
  }

  const fullName = normalizeText(formData.get("fullName"));
  const category = formData.get("category");
  const description = normalizeText(formData.get("description"));
  const contactNumber = normalizeText(formData.get("contactNumber"));
  const landmark = normalizeText(formData.get("landmark"));
  const file = formData.get("referenceDesign");

  if (!fullName || !isProductCategory(category) || !description || !contactNumber || !landmark) {
    return { error: "Please complete all required custom request fields." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please upload a reference design image." };
  }

  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    return { error: "Reference design must be a PNG or JPG image." };
  }

  if (file.size > MAX_REFERENCE_SIZE) {
    return { error: "Reference design must be 5MB or smaller." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(REFERENCE_BUCKET)
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase.from("custom_requests").insert({
    user_id: user.id,
    category,
    full_name: fullName,
    contact_number: contactNumber,
    landmark,
    description,
    reference_image_path: fileName,
    status: "New Request",
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/custom-requests");

  return { success: true };
}

export async function getCustomRequests(filters: CustomRequestFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 5;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("custom_requests")
    .select("*, profile:profiles(full_name, email)", { count: "exact" });

  if (filters.status && filters.status !== "all" && isCustomRequestStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    const term = filters.search.replaceAll(",", " ").trim();
    if (term) {
      query = query.or(
        `full_name.ilike.%${term}%,contact_number.ilike.%${term}%,description.ilike.%${term}%`
      );
    }
  }

  query = query.order("created_at", {
    ascending: filters.sort === "oldest",
  });

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  const requests = await attachReferenceUrls((data ?? []) as CustomRequest[]);

  return {
    requests,
    totalCount: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
    currentPage: page,
  };
}

export async function getCustomRequestStats() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("custom_requests").select("status");

  if (error) throw new Error(error.message);

  const counts = Object.fromEntries(
    CUSTOM_REQUEST_STATUSES.map((status) => [status, 0])
  ) as Record<CustomRequestStatus, number>;

  for (const request of data ?? []) {
    const status = request.status as CustomRequestStatus;
    if (status in counts) counts[status] += 1;
  }

  return {
    total: data?.length ?? 0,
    ...counts,
  };
}

export async function updateCustomRequest(
  id: string,
  values: {
    status?: CustomRequestStatus;
    negotiatedPrice?: number | null;
    adminNotes?: string | null;
  }
): Promise<ActionResult> {
  const update: Record<string, string | number | null> = {};

  if (values.status) update.status = values.status;
  if (values.negotiatedPrice !== undefined) update.negotiated_price = values.negotiatedPrice;
  if (values.adminNotes !== undefined) update.admin_notes = values.adminNotes;

  const supabase = await createClient();
  const { error } = await supabase.from("custom_requests").update(update).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/custom-requests");
  return { success: true };
}

export async function convertCustomRequestToOrder(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: request, error: fetchError } = await supabase
    .from("custom_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) return { error: fetchError.message };
  if (!request) return { error: "Custom request not found." };
  if (request.status !== "Approved") {
    return { error: "Only approved custom requests can be converted." };
  }

  const totalAmount = Number(request.negotiated_price ?? 0);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return { error: "Set a negotiated price before converting this request." };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: request.user_id,
      total_amount: totalAmount,
      status: "Processing",
      payment_receipt_url: null,
      shipping_address: request.landmark,
      delivery_notes: `Custom request: ${request.description}`,
      contact_number: request.contact_number,
      full_name: request.full_name,
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  const { error: updateError } = await supabase
    .from("custom_requests")
    .update({
      status: "Converted",
      order_id: order.id,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/custom-requests");
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");

  return { success: true, orderId: order.id };
}
