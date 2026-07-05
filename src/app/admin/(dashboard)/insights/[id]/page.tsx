import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: article }, { data: sectors }] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).single(),
    supabase.from("sectors").select("*").order("sort_order"),
  ]);

  if (!article) notFound();

  return (
    <>
      <AdminPageHeader title="Edit Article" />
      <ArticleForm article={article} sectors={sectors ?? []} />
    </>
  );
}
