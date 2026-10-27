import Topbar from "@/components/Topbar";
import PipelineStrip from "@/components/PipelineStrip";
import StatCard from "@/components/StatCard";
import MiniCalendar from "@/components/MiniCalendar";
import PerformanceChart from "@/components/PerformanceChart";
import BreakdownBars from "@/components/BreakdownBars";
import HeroBanner from "@/components/HeroBanner";
import {
  getDashboardStats,
  getInterviews,
  getSlots,
  getProgramBreakdown,
  getEmploymentBreakdown,
  getInterviewStatusBreakdown,
  getModeBreakdown,
  getMonthSlotCounts,
} from "@/lib/queries";
import { Users, CalendarClock, ClipboardCheck, GraduationCap, Clock3 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();
  const [
    stats,
    todaySlots,
    upcomingInterviews,
    programBreakdown,
    employmentBreakdown,
    interviewStatusBreakdown,
    modeBreakdown,
    monthSlotCounts,
  ] = await Promise.all([
    getDashboardStats(),
    getSlots({ from: today.toISOString().slice(0, 10) }),
    getInterviews({ status: "scheduled", from: today.toISOString().slice(0, 10) }),
    getProgramBreakdown(),
    getEmploymentBreakdown(),
    getInterviewStatusBreakdown(),
    getModeBreakdown(),
    getMonthSlotCounts(today.getFullYear(), today.getMonth() + 1),
  ]);

  const nowMs = today.getTime();
  const nextUpcoming = [...upcomingInterviews]
    .filter((iv) => new Date(iv.scheduled_start.replace(" ", "T")).getTime() > nowMs)
    .sort(
      (a, b) =>
        new Date(a.scheduled_start.replace(" ", "T")).getTime() -
        new Date(b.scheduled_start.replace(" ", "T")).getTime()
    )[0];

  return (
    <>
      <Topbar title="Dashboard" subtitle="Placement cell overview" />
      <main className="flex-1 space-y-6 p-6">
        <HeroBanner
          teamLabel="Placement Team"
          interviewsToday={stats.interviews_today}
          pendingReattempts={stats.pending_reattempts}
          nextInterview={
            nextUpcoming
              ? { name: nextUpcoming.candidate_id?.[1] || "Candidate", scheduledStart: nextUpcoming.scheduled_start }
              : null
          }
        />

        <section className="reveal" style={{ animationDelay: "60ms" }}>
          <h2 className="mb-3 font-display text-lg text-ink">Candidate pipeline</h2>
          <PipelineStrip counts={stats.stage_counts} />
        </section>

        <section className="reveal grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "120ms" }}>
          <StatCard
            label="Active candidates"
            value={stats.total_candidates}
            icon={Users}
            accent="#087cf0"
            href="/candidates"
          />
          <StatCard
            label="Interview slots today"
            value={stats.slots_today}
            icon={CalendarClock}
            accent="#0891b2"
            href="/slots"
          />
          <StatCard
            label="Mock interviews today"
            value={stats.interviews_today}
            icon={ClipboardCheck}
            accent="#ff7600"
            href="/interviews"
          />
          <StatCard
            label="Placements this month"
            value={stats.placements_this_month}
            icon={GraduationCap}
            accent="#08c85a"
            href="/candidates?stage=placement"
          />
        </section>

        <section className="reveal grid grid-cols-1 gap-6 lg:grid-cols-3" style={{ animationDelay: "180ms" }}>
          <div className="lg:col-span-2">
            <PerformanceChart data={programBreakdown} />
          </div>
          <MiniCalendar year={today.getFullYear()} month={today.getMonth() + 1} slotCounts={monthSlotCounts} />
        </section>

        <section className="reveal grid grid-cols-1 gap-6 lg:grid-cols-3" style={{ animationDelay: "240ms" }}>
          <BreakdownBars title="Employment status" data={employmentBreakdown} accent="#0891b2" />
          <BreakdownBars title="Mock interview outcomes" data={interviewStatusBreakdown} accent="#ff7600" />
          <BreakdownBars title="Interview mode" data={modeBreakdown} accent="#087cf0" />
        </section>

        <section className="reveal grid grid-cols-1 gap-6 lg:grid-cols-2" style={{ animationDelay: "300ms" }}>
          <div className="rounded-2xl border border-line bg-card shadow-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base text-ink">Today&apos;s interview slots</h3>
              <Link href="/slots" className="text-sm text-brand-dark hover:underline">
                View all
              </Link>
            </div>
            {todaySlots.length === 0 ? (
              <p className="text-sm text-slate">No slots scheduled for today.</p>
            ) : (
              <ul className="space-y-3">
                {todaySlots.slice(0, 6).map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Clock3 size={16} className="text-slate" />
                      <span className="text-ink">{slot.name}</span>
                    </div>
                    <span className="text-slate">
                      {slot.booked_count}/{slot.capacity} booked
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card shadow-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base text-ink">Upcoming mock interviews</h3>
              <Link href="/interviews" className="text-sm text-brand-dark hover:underline">
                View all
              </Link>
            </div>
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-slate">Nothing scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingInterviews.slice(0, 6).map((iv) => (
                  <li key={iv.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink">{iv.candidate_id?.[1]}</span>
                    <span className="text-slate">
                      {new Date(iv.scheduled_start.replace(" ", "T")).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
