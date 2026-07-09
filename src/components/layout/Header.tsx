import { siteConfig } from "@/data/siteConfig";
import { getSiteImages } from "@/lib/siteImages";
import { createPublicClient } from "@/lib/supabase/public";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const images = await getSiteImages(["logo_left", "logo_right"]);
  const logoLeft = images.logo_left || siteConfig.logo.dark;
  const logoRight = images.logo_right || siteConfig.logo.dark;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("slug, title, title_ar")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(6);

  return <HeaderClient logoLeft={logoLeft} logoRight={logoRight} services={data ?? []} />;
}
