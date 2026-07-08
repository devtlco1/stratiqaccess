import { createPublicClient } from "@/lib/supabase/public";

// Fetches a single managed site image by key, falling back to a bundled
// placeholder path if the row is missing or has no image set yet.
export async function getSiteImage(key: string, fallback: string): Promise<string> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_images").select("image_url").eq("key", key).single();
  return data?.image_url || fallback;
}

// Fetches several at once (one round trip) — use on pages/sections that need
// more than one managed image, e.g. the homepage Introduction section.
export async function getSiteImages(keys: string[]): Promise<Record<string, string | null>> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_images").select("key, image_url").in("key", keys);
  const map: Record<string, string | null> = {};
  for (const row of data ?? []) map[row.key] = row.image_url;
  return map;
}
