export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  // Common mistake: using the REST endpoint instead of the project URL
  const normalizedUrl = url.replace(/\/rest\/v1\/?$/, "");

  return { url: normalizedUrl, anonKey };
}
