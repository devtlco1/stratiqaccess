import { signOut } from "@/app/actions/auth";

export function AdminTopBar({ email, role }: { email: string; role: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 lg:px-10">
      <div>
        <p className="text-sm text-silver-200">{email}</p>
        <p className="text-xs uppercase tracking-wide text-silver-500">{role}</p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="border border-white/15 px-4 py-2 text-xs uppercase tracking-wide text-silver-300 transition-colors hover:border-gold-500/40 hover:text-gold-400"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
