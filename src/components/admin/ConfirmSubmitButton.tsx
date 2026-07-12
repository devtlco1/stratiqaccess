"use client";

import { useFormStatus } from "react-dom";

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
    </svg>
  );
}

// Same role as SubmitButton, but gates the submit behind a native
// window.confirm() dialog first. Used for irreversible/high-impact actions
// (delete, cancel campaign, send campaign, restore suppression) — this
// codebase has no modal library, so a native confirm is the lowest-risk way
// to add a confirmation step without introducing a new UI dependency.
export function ConfirmSubmitButton({
  children,
  confirmMessage,
  variant = "primary",
  size = "default",
  formAction,
  name,
  value,
}: {
  children: React.ReactNode;
  confirmMessage: string;
  variant?: "primary" | "danger" | "secondary";
  size?: "default" | "sm";
  // Lets one shared <form> (e.g. a bulk-actions toolbar) route different
  // submit buttons to different Server Actions, per the standard HTML
  // formAction override mechanism — avoids needing one <form> per action.
  formAction?: (formData: FormData) => void;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();

  const base =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : variant === "secondary"
        ? "border border-navy/15 text-navy hover:bg-paper"
        : "bg-stratiq-blue hover:bg-navy text-white";

  const sizeClasses =
    size === "sm"
      ? "px-4 py-2 text-xs font-semibold uppercase tracking-wide rounded-md"
      : "px-8 py-3 text-sm font-semibold uppercase tracking-wide rounded-md";

  return (
    <button
      type="submit"
      formAction={formAction}
      name={name}
      value={value}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={`inline-flex items-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${base} ${sizeClasses}`}
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}
