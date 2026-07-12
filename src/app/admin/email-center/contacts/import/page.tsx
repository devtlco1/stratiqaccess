import { AdminShell } from "@/components/admin/AdminShell";
import { ImportWizard } from "./ImportWizard";

export default function ImportContactsPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">Import Contacts</h1>
      <p className="mt-2 text-sm text-ink/60">
        Upload a CSV or XLSX file, paste a list, or pull from existing Customers/Messages records. Nothing is saved until you review the preview and confirm.
      </p>
      <ImportWizard />
    </AdminShell>
  );
}
