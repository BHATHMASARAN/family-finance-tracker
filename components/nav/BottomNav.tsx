"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Plus, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AddSheet } from "./AddSheet";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
];
const rightLinks = [
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);

  const Item = ({ href, label, icon: Icon }: (typeof links)[number]) => {
    const active = pathname === href || pathname?.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
          active ? "text-brand-600" : "text-slate-400"
        )}
      >
        <Icon size={22} />
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {links.map((l) => (
          <Item key={l.href} {...l} />
        ))}

        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40 active:scale-95"
          >
            <Plus size={26} />
          </button>
        </div>

        {rightLinks.map((l) => (
          <Item key={l.href} {...l} />
        ))}
      </nav>
      <AddSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
