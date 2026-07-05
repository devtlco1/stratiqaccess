import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Admin Login — STRATIQ Access" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-6">
      <div className="w-full max-w-sm border border-white/10 bg-navy-900/50 p-10">
        <p className="font-display text-lg text-silver-100">
          STRATIQ <span className="text-gold-400">Access</span>
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-silver-400">Admin Console</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
