"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGcashQrUrl() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "gcash_qr_url")
    .single();

  return data?.value ?? "";
}

export async function uploadGcashQr(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const fileName = `gcash-qr.${file.name.split(".").pop()}`;

  const { error: uploadError } = await supabase.storage
    .from("gcash-qr")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from("gcash-qr")
    .getPublicUrl(fileName);

  const { error: settingsError } = await supabase
    .from("app_settings")
    .upsert({ key: "gcash_qr_url", value: publicUrl }, { onConflict: "key" });

  if (settingsError) return { error: settingsError.message };

  revalidatePath("/checkout");
  revalidatePath("/admin/settings");
  return { url: publicUrl };
}
