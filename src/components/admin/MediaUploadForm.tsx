"use client";

import { useActionState } from "react";
import { uploadMedia, type ActionState } from "@/app/actions/admin/media";
import { fieldClasses, AdminButton } from "@/components/admin/ui";

const initialState: ActionState = { status: "idle" };

export function MediaUploadForm() {
  const [state, formAction, pending] = useActionState(uploadMedia, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4 border border-white/10 bg-navy-900/50 p-6">
      <div className="flex-1">
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-silver-400" htmlFor="file">
          Upload File
        </label>
        <input className={fieldClasses} id="file" name="file" type="file" />
      </div>
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      <AdminButton type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </AdminButton>
    </form>
  );
}
