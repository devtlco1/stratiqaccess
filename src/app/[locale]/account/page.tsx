import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { createClient } from "@/lib/supabase/server";
import { accountSignOut } from "@/app/actions/account";
import type { Database } from "@/lib/supabase/types";

export const metadata = { title: "My Account — STRATIQ Access" };

type PurchaseWithDownloads = Database["public"]["Tables"]["purchases"]["Row"] & {
  downloads: Database["public"]["Tables"]["downloads"]["Row"][];
};

type SavedWithOpportunity = Database["public"]["Tables"]["saved_opportunities"]["Row"] & {
  opportunities: Pick<Database["public"]["Tables"]["opportunities"]["Row"], "id" | "title" | "status"> | null;
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login?next=/account");

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, downloads(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<PurchaseWithDownloads[]>();

  const { data: saved } = await supabase
    .from("saved_opportunities")
    .select("*, opportunities(id, title, status)")
    .eq("user_id", user.id)
    .returns<SavedWithOpportunity[]>();

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("dashboard.welcome", { email: user.email ?? "" })} />
      <Section>
        <div className="mb-10 flex justify-end">
          <form action={accountSignOut}>
            <button className="border border-white/15 px-5 py-2.5 text-xs uppercase tracking-wide text-silver-300 hover:border-gold-500/40 hover:text-gold-400">
              {t("dashboard.signOut")}
            </button>
          </form>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-ivory-100">{t("dashboard.purchasedReports")}</h2>
            {!purchases || purchases.length === 0 ? (
              <p className="mt-4 text-sm text-silver-400">{t("dashboard.noPurchases")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {purchases.map((p) => (
                  <li key={p.id} className="border border-white/10 bg-navy-900/50 p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-silver-200 capitalize">
                        {t("dashboard.purchaseSuffix", { type: p.item_type })}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-gold-400">{p.status}</span>
                    </div>
                    {p.status === "approved" &&
                      p.downloads?.map((d) => (
                        <p key={d.file_path} className="mt-2 text-xs text-silver-400">
                          {t("dashboard.fileReadyPrefix")} {d.file_path}
                        </p>
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ivory-100">{t("dashboard.savedOpportunities")}</h2>
            {!saved || saved.length === 0 ? (
              <p className="mt-4 text-sm text-silver-400">{t("dashboard.noSaved")}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {saved.map((s) => (
                  <li key={s.id} className="border border-white/10 bg-navy-900/50 p-5 text-sm text-silver-200">
                    {s.opportunities?.title ?? "—"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
