import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: sectors } = await supabase.from("sectors").select("*").order("sort_order");

  return (
    <>
      <AdminPageHeader title="New Article" />
      <ArticleForm sectors={sectors ?? []} />
    </>
  );
}
