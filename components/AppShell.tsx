"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Topbar } from "@/components/nav/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/expenses": "Expenses",
  "/income": "Income",
  "/accounts": "Accounts",
  "/loans": "Loans & Debt",
  "/budget": "Monthly Budget",
  "/savings": "Savings",
  "/payments": "Upcoming Payments",
  "/reports": "Reports & Analytics",
  "/family": "Family Members",
  "/profile": "My Profile",
  "/settings": "Settings",
};

function titleFor(pathname: string): string {
  if (titles[pathname]) return titles[pathname];
  const base = "/" + pathname.split("/")[1];
  if (titles[base]) {
    if (pathname.endsWith("/new")) return `Add ${titles[base].replace(/s$/, "")}`;
    if (pathname.includes("/edit")) return `Edit ${titles[base].replace(/s$/, "")}`;
    return titles[base];
  }
  return "Family Finance";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/dashboard";
  const { loading, profile } = useAuth();

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar title={titleFor(pathname)} />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:px-8 md:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
