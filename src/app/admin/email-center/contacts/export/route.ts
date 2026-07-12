import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ContactStatus, EmailContactRow } from "@/lib/email/dbTypes";

const STATUSES: ContactStatus[] = ["active", "unsubscribed", "bounced", "suppressed", "archived"];
const CSV_COLUMNS: (keyof EmailContactRow)[] = [
  "name", "company_name", "email", "phone", "country", "city", "sector", "job_title",
  "website", "source", "language", "status", "is_subscribed", "last_contacted_at", "created_at",
];

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : Array.isArray(value) ? value.join(";") : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

// GET-only, admin-authenticated via the existing /admin middleware (same
// cookie-bound session check as every other admin page) — Server Actions
// can't return a file with download headers, so this is the one Email
// Center read path implemented as a route handler instead of a Server
// Action, purely for the Content-Disposition response.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  let query = supabase.from("email_contacts").select("*").order("created_at", { ascending: false });

  const status = params.get("status");
  const country = params.get("country");
  const sector = params.get("sector");
  const source = params.get("source");
  const tag = params.get("tag");
  const q = params.get("q");

  if (status && STATUSES.includes(status as ContactStatus)) query = query.eq("status", status);
  if (country) query = query.ilike("country", `%${country}%`);
  if (sector) query = query.ilike("sector", `%${sector}%`);
  if (source) query = query.eq("source", source);
  if (tag) query = query.contains("tags", [tag]);
  if (q?.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const contacts = (data ?? []) as EmailContactRow[];
  const lines = [
    CSV_COLUMNS.join(","),
    ...contacts.map((contact) => CSV_COLUMNS.map((col) => csvEscape(contact[col])).join(",")),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="email-contacts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
