// Detail pages (services/sectors/insights) render a photo alongside the
// content. Most rows don't have a custom image uploaded yet, so rather than
// leaving the slot empty (dead layout space) or requiring every admin edit
// to include one, fall back to one of the 7 real Iraq photos already used
// elsewhere on the site (see public/images/PHOTO-CREDITS.md) — picked to
// loosely fit the topic via icon, or deterministically by slug when there's
// no icon to key off of.
const FALLBACK_PHOTOS = [
  "/images/photo-baghdad-skyline.jpg",
  "/images/photo-baghdad-tigris.jpg",
  "/images/photo-baghdad-2023.jpg",
  "/images/photo-construction-iraq.jpg",
  "/images/photo-erbil-expressway.jpg",
  "/images/photo-covered-market.jpg",
  "/images/photo-baghdad-medical-city.jpg",
] as const;

const ICON_PHOTO: Record<string, (typeof FALLBACK_PHOTOS)[number]> = {
  globe: "/images/photo-baghdad-tigris.jpg",
  briefcase: "/images/photo-baghdad-skyline.jpg",
  radar: "/images/photo-baghdad-skyline.jpg",
  "trending-up": "/images/photo-baghdad-skyline.jpg",
  truck: "/images/photo-erbil-expressway.jpg",
  "hard-hat": "/images/photo-construction-iraq.jpg",
  compass: "/images/photo-construction-iraq.jpg",
  "shield-check": "/images/photo-construction-iraq.jpg",
  shield: "/images/photo-construction-iraq.jpg",
  bolt: "/images/photo-construction-iraq.jpg",
  cpu: "/images/photo-baghdad-medical-city.jpg",
  handshake: "/images/photo-covered-market.jpg",
  landmark: "/images/photo-baghdad-2023.jpg",
  "building-2": "/images/photo-baghdad-2023.jpg",
  "heart-pulse": "/images/photo-baghdad-medical-city.jpg",
  phone: "/images/photo-covered-market.jpg",
  users: "/images/photo-covered-market.jpg",
  "file-check": "/images/photo-baghdad-medical-city.jpg",
  "file-search": "/images/photo-baghdad-medical-city.jpg",
  scale: "/images/photo-baghdad-2023.jpg",
  package: "/images/photo-covered-market.jpg",
  calendar: "/images/photo-baghdad-skyline.jpg",
  key: "/images/photo-baghdad-2023.jpg",
  languages: "/images/photo-covered-market.jpg",
  "flask-conical": "/images/photo-baghdad-medical-city.jpg",
  "map-pin": "/images/photo-erbil-expressway.jpg",
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function fallbackImageForIcon(icon: string): string {
  return ICON_PHOTO[icon] ?? FALLBACK_PHOTOS[hashString(icon) % FALLBACK_PHOTOS.length];
}

export function fallbackImageForSlug(slug: string): string {
  return FALLBACK_PHOTOS[hashString(slug) % FALLBACK_PHOTOS.length];
}
