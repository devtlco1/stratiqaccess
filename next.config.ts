import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Admin-uploaded logos may be SVG — safe here since uploads only come from the authenticated admin.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
    // Safe to cache indefinitely — uploadImage.ts gives every admin upload a
    // fresh crypto.randomUUID() path, so a re-upload is always a new URL.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
