import { siteConfig } from "@/data/siteConfig";
import { getSiteImages } from "@/lib/siteImages";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const images = await getSiteImages(["logo_left", "logo_right"]);
  const logoLeft = images.logo_left || siteConfig.logo.dark;
  const logoRight = images.logo_right || siteConfig.logo.dark;
  return <HeaderClient logoLeft={logoLeft} logoRight={logoRight} />;
}
