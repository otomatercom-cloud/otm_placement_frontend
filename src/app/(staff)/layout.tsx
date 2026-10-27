import Sidebar from "@/components/Sidebar";
import { NavProvider } from "@/components/layout/nav-context";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </NavProvider>
  );
}
