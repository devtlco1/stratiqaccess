export function ConfidentialityNotice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 border border-gold-500/25 bg-gold-500/5 px-5 py-4">
      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
      <p className="text-xs leading-relaxed text-silver-300">{text}</p>
    </div>
  );
}
