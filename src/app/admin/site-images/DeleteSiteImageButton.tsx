"use client";

import { useFormStatus } from "react-dom";

// A second submit button inside the same <form> as the "Replace" file
// upload, using formAction to override which Server Action runs — avoids
// nesting a second <form>. Shares the form's pending state so it disables
// during either a replace or a delete submission.
export function DeleteSiteImageButton({
  deleteAction,
}: {
  deleteAction: (formData: FormData) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={deleteAction}
      disabled={pending}
      className="rounded-md border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    >
      Delete
    </button>
  );
}
