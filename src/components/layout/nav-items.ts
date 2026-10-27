import { LayoutDashboard, Users, CalendarClock, ClipboardCheck } from "lucide-react";

export const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/slots", label: "Interview Slots", icon: CalendarClock },
  { href: "/interviews", label: "Mock Interviews", icon: ClipboardCheck },
] as const;
