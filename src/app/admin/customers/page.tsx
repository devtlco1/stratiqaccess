import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { CustomerRow, CustomerStatus } from "@/lib/types";

const STATUSES: CustomerStatus[] = ["New", "Contacted", "Qualified", "In Progress", "Won", "Lost"];

const STATUS_STYLES: Record<CustomerStatus, string> = {
  New: "bg-navy/10 text-navy",
  Contacted: "bg-blue-100 text-blue-700",
  Qualified: "bg-purple-100 text-purple-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("customers").select("*").order("created_at", { ascending: false });

  if (status && STATUSES.includes(status as CustomerStatus)) {
    query = query.eq("status", status);
  }

  if (q && q.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(
      `name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`
    );
  }

  const { data } = await query;
  const customers = (data ?? []) as CustomerRow[];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Customers</h1>
        <Link
          href="/admin/customers/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Customer
        </Link>
      </div>

      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, company, email, phone…"
          className="flex-1 min-w-[220px] rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors"
        >
          Filter
        </button>
        {(q || status) && (
          <Link
            href="/admin/customers"
            className="inline-flex items-center px-3 text-sm font-medium text-ink/60 hover:text-navy transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-8 flex flex-col gap-3">
        {customers.length === 0 && (
          <p className="text-sm text-ink/60">
            {q || status ? "No customers match your search." : "No customers yet — add your first one."}
          </p>
        )}
        {customers.map((customer) => (
          <Link
            key={customer.id}
            href={`/admin/customers/${customer.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <p className="font-medium text-navy">{customer.name}</p>
              <p className="text-sm text-ink/60">
                {[customer.company, customer.email, customer.phone].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[customer.status]}`}>
              {customer.status}
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
