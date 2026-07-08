import { createClient } from "@supabase/supabase-js";

function buildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

let client: ReturnType<typeof buildClient> | undefined;

// Cookie-free anon client for public marketing-page reads. Unlike the
// cookie-bound client in server.ts, this never touches next/headers, so
// routes that only use this stay eligible for Next.js's Full Route Cache/ISR.
// Only for public data guarded by "public read" RLS policies — /admin keeps
// using the cookie-bound client.
export function createPublicClient() {
  client ??= buildClient();
  return client;
}
