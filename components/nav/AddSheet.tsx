"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Receipt, Wallet, Landmark, CalendarClock, WalletCards } from "lucide-react";

const options = [
  { href: "/expenses/new", label: "Add Expense", icon: Receipt, tone: "text-red-600 bg-red-50 dark:bg-red-950/40" },
  { href: "/income/new", label: "Add Income", icon: Wallet, tone: "text-brand-700 bg-brand-50 dark:bg-brand-950/40" },
  { href: "/accounts/new", label: "Add Account", icon: WalletCards, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
  { href: "/loans/new", label: "Add Loan", icon: Landmark, tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { href: "/payments", label: "Add Payment", icon: CalendarClock, tone: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
];

export function AddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  return (
    <Modal open={open} onClose={onClose} title="What would you like to add?">
      <div className="grid grid-cols-2 gap-3">
        {options.map(({ href, label, icon: Icon, tone }) => (
          <button
            key={href}
            onClick={() => {
              onClose();
              router.push(href);
            }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-4 text-center text-sm font-semibold text-slate-700 hover:border-brand-400 dark:border-slate-800 dark:text-slate-200"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={20} />
            </span>
            {label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
