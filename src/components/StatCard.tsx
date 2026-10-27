import { LucideIcon } from "lucide-react";
import Link from "next/link";
import AnimatedNumber from "./AnimatedNumber";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "#087cf0",
  hint,
  href,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
  href?: string;
}) {
  const content = (
    <div
      className="flex items-start gap-4 rounded-2xl border border-line bg-card shadow-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}1a`, color: accent }}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="font-display text-2xl leading-none text-ink">
          <AnimatedNumber value={value} />
        </p>
        <p className="mt-1 text-sm text-slate">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate">{hint}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
