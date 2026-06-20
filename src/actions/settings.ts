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

  return data?.value ? `${data.value}?t=${Date.now()}` : "";
}

export async function deleteGcashQr() {
  const supabase = await createClient();

  // Get current URL from settings
  const { data: settingData } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'gcash_qr_url')
    .single();

  const currentUrl = settingData?.value;
  if (!currentUrl) {
    // Nothing to delete
    return { success: true };
  }

  // Extract the filename from the public URL
  let fileName: string | undefined;
  try {
    const url = new URL(currentUrl);
    const parts = url.pathname.split('/');
    fileName = parts[parts.length - 1];
  } catch (_) {
    // fallback – if URL parsing fails, attempt simple split
    const parts = currentUrl.split('/');
    fileName = parts[parts.length - 1];
  }

  if (fileName) {
    const { error: deleteError } = await supabase.storage
      .from('gcash-qr')
      .remove([fileName]);
    if (deleteError) return { error: deleteError.message };
  }

  // Clear the setting
  const { error: settingsError } = await supabase
    .from('app_settings')
    .upsert({ key: 'gcash_qr_url', value: '' }, { onConflict: 'key' });
  if (settingsError) return { error: settingsError.message };

  // Revalidate pages that depend on the QR code
  revalidatePath('/checkout');
  revalidatePath('/admin/settings');
  return { success: true };
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
