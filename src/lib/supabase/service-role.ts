import { createClient } from "@supabase/supabase-js";

function buildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) is not configured — required for Email Center webhook/cron/unsubscribe routes."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

let client: ReturnType<typeof buildClient> | undefined;

// Service-role client: bypasses Row Level Security entirely. Use ONLY in
// route handlers that have no admin browser session to check RLS against
// (the Hostinger webhook, the cron queue processor, the public unsubscribe
// endpoint). Every admin dashboard page/Server Action must keep using the
// cookie-bound client in lib/supabase/server.ts instead — that's what RLS's
// "admin all" policies are actually protecting. Never import this from a
// client component or expose the key it reads to the browser.
export function createServiceRoleClient() {
  client ??= buildClient();
  return client;
}
