import Image from "next/image";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { SiteImageRow } from "@/lib/types";
import { updateSiteImage } from "./actions";

export default async function AdminSiteImagesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_images").select("*").order("key");
  const images = (data ?? []) as SiteImageRow[];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">Site Images</h1>
      <p className="mt-2 text-sm text-ink/60 max-w-2xl">
        Manage the background photos used on the homepage hero, homepage introduction, and every
        page header across the site. These are separate from the Services, Sectors, Case Studies,
        and Insights photos, which you manage from their own sections.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => {
          const action = updateSiteImage.bind(null, image.key);

          return (
            <div key={image.key} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-navy/5">
                {image.image_url && (
                  <Image src={image.image_url} alt={image.label} fill className="object-cover" />
                )}
              </div>
              <p className="mt-3 text-sm font-medium text-navy">{image.label}</p>

              <form action={action} className="mt-3 flex flex-col gap-2">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full text-xs text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-navy/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-navy"
                />
                <button
                  type="submit"
                  className="self-start rounded-md bg-stratiq-blue px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-navy transition-colors"
                >
                  Replace
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
