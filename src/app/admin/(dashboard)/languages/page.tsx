import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminTable, StatusBadge } from "@/components/admin/ui";
import { toggleLanguageActive } from "@/app/actions/admin/languages";

export default async function AdminLanguagesPage() {
  const supabase = await createClient();
  const { data: languages } = await supabase.from("languages").select("*").order("sort_order");

  return (
    <>
      <AdminPageHeader
        title="Languages"
        description="English ships today. Activate additional languages once translations are ready — the site's i18n routing already supports adding a locale here without restructuring."
      />

      <AdminTable columns={["Language", "Code", "Direction", "Status", ""]}>
        {(languages ?? []).map((lang) => (
          <tr key={lang.code}>
            <td className="px-4 py-3 text-silver-200">{lang.name}</td>
            <td className="px-4 py-3 text-silver-400">{lang.code}</td>
            <td className="px-4 py-3 text-silver-400">{lang.is_rtl ? "RTL" : "LTR"}</td>
            <td className="px-4 py-3">
              <StatusBadge tone={lang.is_active ? "good" : "neutral"}>
                {lang.is_active ? "Active" : "Inactive"}
              </StatusBadge>
            </td>
            <td className="px-4 py-3 text-right">
              <form action={toggleLanguageActive.bind(null, lang.code, !lang.is_active)}>
                <button className="text-xs uppercase tracking-wide text-gold-400 hover:text-gold-300">
                  {lang.is_active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
