"use client";

import { Menu, PanelLeft } from "lucide-react";
import { useNav } from "./layout/nav-context";

export default function TopbarControls() {
  const { openDrawer, toggleCollapsed } = useNav();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={openDrawer}
        aria-label="Open menu"
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-light-blue text-slate"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <button
        onClick={toggleCollapsed}
        aria-label="Toggle sidebar"
        className="hidden lg:flex h-10 w-10 items-center justify-center rounded-full hover:bg-light-blue text-slate"
      >
        <PanelLeft className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
