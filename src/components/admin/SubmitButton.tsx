"use client";

import { useFormStatus } from "react-dom";

function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}

// Drop-in replacement for a static <button type="submit">Save</button> —
// reads the pending state of the nearest ancestor <form action={...}>, so it
// works with the existing pattern of passing a Server Action reference
// directly as the form's action, no extra wiring needed per form.
export function SubmitButton({
  children = "Save",
  size = "default",
}: {
  children?: React.ReactNode;
  size?: "default" | "sm";
}) {
  const { pending } = useFormStatus();

  if (size === "sm") {
    return (
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md bg-stratiq-blue px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-navy transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Spinner className="size-3.5" />}
        {pending ? "Saving…" : children}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start inline-flex items-center gap-2 rounded-md bg-stratiq-blue px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Spinner />}
      {pending ? "Saving…" : children}
    </button>
  );
}
