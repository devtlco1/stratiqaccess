import { ShieldCheck } from "lucide-react";

export function ConfidentialityNotice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-gold-500/25 bg-gold-500/5 px-5 py-4">
      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold-400" />
      <p className="text-sm leading-relaxed text-muted-500">{text}</p>
    </div>
  );
}
