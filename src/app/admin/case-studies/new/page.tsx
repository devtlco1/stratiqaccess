import { AdminShell } from "@/components/admin/AdminShell";
import { CaseStudyForm } from "../CaseStudyForm";
import { createCaseStudy } from "../actions";

export default function NewCaseStudyPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Case Study</h1>
      <CaseStudyForm action={createCaseStudy} />
    </AdminShell>
  );
}
