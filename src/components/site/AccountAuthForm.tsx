"use client";

import { useActionState } from "react";
import { accountSignIn, accountSignUp, type AccountAuthState } from "@/app/actions/account";
import { Button } from "@/components/ui/Button";

const initialState: AccountAuthState = { status: "idle" };
const fieldClasses =
  "w-full border border-white/15 bg-navy-900/50 px-4 py-3 text-sm text-silver-100 placeholder:text-silver-400 focus:border-gold-500/60 focus:outline-none";
const labelClasses = "mb-2 block text-xs uppercase tracking-wide text-silver-300";

export function AccountAuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? accountSignIn : accountSignUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      {mode === "signup" && (
        <div>
          <label className={labelClasses} htmlFor="full_name">Full name</label>
          <input className={fieldClasses} id="full_name" name="full_name" required />
        </div>
      )}
      <div>
        <label className={labelClasses} htmlFor="email">Email</label>
        <input className={fieldClasses} id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div>
        <label className={labelClasses} htmlFor="password">Password</label>
        <input
          className={fieldClasses}
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
      </Button>
    </form>
  );
}
