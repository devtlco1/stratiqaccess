"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// ClientForm's logo is unlike the other admin forms — it accepts either a
// manual URL or an uploaded file, and the URL field's own value is what
// preserves the existing logo across a resubmit (unlike other forms, there's
// no separate "keep current image" server-side branch). Delete just clears
// both input values via ref, so the next save naturally lands on null.
export function ClientLogoField({ currentUrl }: { currentUrl?: string | null }) {
  const urlRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [removed, setRemoved] = useState(false);
  const showCurrent = !!currentUrl && !removed;

  function handleDelete() {
    setRemoved(true);
    if (urlRef.current) urlRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-ink/80 mb-1.5">
          Logo URL (used if no file is uploaded below)
        </label>
        {showCurrent && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-16 w-40 overflow-hidden rounded-lg bg-paper">
              <Image src={currentUrl} alt="" fill className="object-contain" />
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
        <input
          ref={urlRef}
          id="logo_url"
          name="logo_url"
          type="url"
          defaultValue={currentUrl ?? undefined}
          placeholder="https://..."
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        />
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-ink/80 mb-1.5">
          Or upload a logo file
        </label>
        <input
          ref={fileRef}
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-navy/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy"
        />
      </div>
    </>
  );
}
