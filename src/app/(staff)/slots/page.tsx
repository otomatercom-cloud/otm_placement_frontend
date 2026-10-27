import Topbar from "@/components/Topbar";
import { getSlots } from "@/lib/queries";
import clsx from "clsx";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-brand/10 text-brand-dark",
  full: "bg-amber/10 text-amber",
  past: "bg-line text-slate",
};

export default async function SlotsPage({
  searchParams,
}: PageProps<"/slots">) {
  const sp = await searchParams;
  const mode = typeof sp.mode === "string" ? sp.mode : undefined;
  const slots = await getSlots({ mode, from: new Date().toISOString().slice(0, 10) });

  return (
    <>
      <Topbar title="Interview Slots" subtitle="Online & offline mock-interview availability" />
      <main className="flex-1 space-y-4 p-6">
        <div className="flex gap-2">
          {[
            { label: "All", value: undefined },
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
          ].map((f) => (
            <Link
              key={f.label}
              href={f.value ? `/slots?mode=${f.value}` : "/slots"}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                mode === f.value
                  ? "border-brand bg-brand/10 text-brand-dark"
                  : "border-line bg-card text-slate hover:text-ink"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <div key={slot.id} className="rounded-2xl border border-line bg-card shadow-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{slot.name}</p>
                  <p className="text-xs capitalize text-slate">{slot.mode}</p>
                </div>
                <span className={clsx("rounded-full px-2.5 py-1 text-xs capitalize", STATUS_STYLES[slot.slot_status])}>
                  {slot.slot_status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate">
                <span>{slot.interviewer_display_name || "Unassigned"}</span>
                <span>
                  {slot.booked_count}/{slot.capacity}
                </span>
              </div>
              {slot.venue && <p className="mt-1 text-xs text-slate">{slot.venue}</p>}
            </div>
          ))}
          {slots.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-slate">
              No upcoming slots. Generate some from the Odoo backend (Placement → Generate Interview Slots).
            </p>
          )}
        </div>
      </main>
    </>
  );
}
