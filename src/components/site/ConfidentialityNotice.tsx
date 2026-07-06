import { ShieldCheck } from "lucide-react";

export function ConfidentialityNotice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gold-400/20 bg-gold-500/[0.06] px-5 py-4 backdrop-blur-sm">
      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold-300" />
      <p className="text-sm leading-relaxed text-muted-500">{text}</p>
    </div>
  );
}
