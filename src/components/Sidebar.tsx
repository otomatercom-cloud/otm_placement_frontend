"use client";

import { cn } from "@/lib/utils";
import { ChevronsLeft, GraduationCap, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SIDEBAR_ITEMS } from "./layout/nav-items";
import { useNav } from "./layout/nav-context";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleCollapsed } = useNav();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <div className={cn("flex items-center h-16 border-b border-white/10", collapsed ? "justify-center px-2" : "gap-2 px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-white truncate">Logic School</p>
            <p className="text-[11px] leading-tight text-sidebar-muted truncate">Placement Console</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-sidebar-active text-white shadow-[0_0_0_1px_rgba(8,124,240,0.4),0_4px_12px_-2px_rgba(8,124,240,0.5)]"
                  : "text-sidebar-text hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-text transition-colors hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
          {!collapsed && "Sign out"}
        </button>
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <ChevronsLeft className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-300", collapsed && "rotate-180")} aria-hidden />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { collapsed, drawerOpen, closeDrawer } = useNav();

  return (
    <>
      <aside
        className={cn(
          "hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:shrink-0 bg-navy transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          collapsed ? "lg:w-[70px]" : "lg:w-[245px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile off-canvas drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={closeDrawer} />
          <aside className="relative z-50 flex h-dvh w-64 flex-col bg-navy">
            <SidebarContent onNavigate={closeDrawer} />
          </aside>
        </div>
      )}
    </>
  );
}
