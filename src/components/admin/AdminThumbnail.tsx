import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

// Consistent list-row thumbnail across every admin section: shows the real
// image when one is set, otherwise a clean icon placeholder instead of a
// blank gray box.
export function AdminThumbnail({
  src,
  alt,
  fit = "cover",
}: {
  src: string | null | undefined;
  alt: string;
  fit?: "cover" | "contain";
}) {
  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy/5">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={fit === "cover" ? "object-cover" : "object-contain p-1.5"}
        />
      ) : (
        <Icon name="image" className="size-6 text-navy/25" />
      )}
    </div>
  );
}
