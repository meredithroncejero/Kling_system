"use server";

import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/resend";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
  return { error: "Unable to start Google sign in." };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient();
  // Hash the password using SHA-256 (demo only; use bcrypt in prod)
  const crypto = await import('crypto');
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    const message = error.message === "{}"
      ? "Database error saving new user. This is likely caused by the handle_new_user() trigger function on auth.users failing. Please ensure public schema table names and SECURITY DEFINER are correctly set on your Supabase triggers."
      : error.message;
    return { error: message };
  }

  // Store password hash in profiles table
  if (data?.user?.id) {
    await supabase
      .from('profiles')
      .update({ password_hash: hash })
      .eq('id', data.user.id);
  }

  // Send verification email via Resend.io (custom domain)
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?email=${encodeURIComponent(email)}`;
  const resendResult = await sendVerificationEmail({
    to: email,
    verificationUrl,
    // replace with your verified domain address
    from: 'no-reply@your-custom-domain.com',
  });
  if (resendResult?.error) {
    // Log but still consider sign‑up successful – user can retry verification
    console.error('Resend verification email error:', resendResult.error);
  }

  return { success: true };
}

export async function resendSignupEmail(email: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
