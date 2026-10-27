import { GraduationCap } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight text-ink">Logic School of Management</p>
            <p className="text-xs text-slate">Placement Cell</p>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
