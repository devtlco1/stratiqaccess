"use client";

import { useState } from "react";
import Image from "next/image";

// Shared image-upload field for admin forms: shows the current image (if
// any) with a Delete button that clears it — the deleted state is tracked
// locally and submitted as a hidden "removeImage" flag alongside the rest
// of the form, so it only takes effect when the admin clicks the real
// Save button. Deleting does not require picking a replacement file.
export function ImageField({
  label,
  name = "image",
  currentUrl,
  fit = "cover",
}: {
  label: string;
  name?: string;
  currentUrl?: string | null;
  fit?: "cover" | "contain";
}) {
  const [removed, setRemoved] = useState(false);
  const showCurrent = !!currentUrl && !removed;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink/80 mb-1.5">
        {label} {showCurrent && "(leave empty to keep current image)"}
      </label>

      {showCurrent && (
        <div className="mb-3 flex items-center gap-3">
          <div className="relative h-32 w-48 overflow-hidden rounded-lg bg-paper">
            <Image
              src={currentUrl}
              alt=""
              fill
              className={fit === "cover" ? "object-cover" : "object-contain p-2"}
            />
          </div>
          <button
            type="button"
            onClick={() => setRemoved(true)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-navy/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy"
      />
      {removed && <input type="hidden" name="removeImage" value="true" />}
    </div>
  );
}
