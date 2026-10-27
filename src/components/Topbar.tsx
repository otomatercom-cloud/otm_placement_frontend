import { Search } from "lucide-react";
import { getSession } from "@/lib/auth";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import LiveClock from "./LiveClock";
import TopbarControls from "./TopbarControls";

export default async function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-card/95 backdrop-blur px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <TopbarControls />
        <div>
          <h1 className="text-lg font-semibold text-ink sm:text-xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <LiveClock className="hidden text-xs text-slate md:block" />
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate"
          />
          <input
            type="search"
            placeholder="Search candidates, slots…"
            className="w-64 rounded-full border border-line bg-paper py-2 pl-9 pr-4 text-sm text-ink placeholder:text-slate focus:border-brand focus:outline-none"
          />
        </div>
        <NotificationBell />
        <UserMenu name={session?.name} />
      </div>
    </header>
  );
}
