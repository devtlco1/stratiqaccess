// Routes an image path/URL through Next.js's built-in image optimizer,
// for spots (e.g. CSS background-image) that can't use next/image directly.
// `width`/`quality` should stick to Next's default deviceSizes/qualities
// config so no extra next.config.ts allow-listing is needed.
export function optimizedImageUrl(src: string, width: number, quality = 75): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
