"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/actions/auth";

const initialState: SignInState = { status: "idle" };
const fieldClasses =
  "w-full border border-white/15 bg-navy-900/50 px-4 py-3 text-sm text-silver-100 placeholder:text-silver-400 focus:border-gold-500/60 focus:outline-none";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-silver-300" htmlFor="email">
          Email
        </label>
        <input className={fieldClasses} id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div>
        <label className="mb-2 block text-xs uppercase tracking-wide text-silver-300" htmlFor="password">
          Password
        </label>
        <input
          className={fieldClasses}
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gold-500 px-6 py-3.5 text-sm font-medium uppercase tracking-wide text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
