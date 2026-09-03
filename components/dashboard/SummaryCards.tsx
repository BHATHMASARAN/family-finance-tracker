import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Landmark, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCard {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}

export function SummaryCards({
  available,
  income,
  expenses,
  remainingBudget,
  debt,
  savings,
}: {
  available: number;
  income: number;
  expenses: number;
  remainingBudget: number;
  debt: number;
  savings: number;
}) {
  const cards: SummaryCard[] = [
    { label: "Total Available Money", value: available, icon: Wallet, tone: "text-brand-600 bg-brand-50 dark:bg-brand-950/40" },
    { label: "This Month Income", value: income, icon: TrendingUp, tone: "text-brand-600 bg-brand-50 dark:bg-brand-950/40" },
    { label: "This Month Expenses", value: expenses, icon: TrendingDown, tone: "text-red-600 bg-red-50 dark:bg-red-950/40" },
    { label: "Remaining Budget", value: remainingBudget, icon: Wallet, tone: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
    { label: "Total Debt", value: debt, icon: Landmark, tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
    { label: "Total Savings", value: savings, icon: PiggyBank, tone: "text-sky-600 bg-sky-50 dark:bg-sky-950/40" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label} className="flex flex-col gap-2">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", c.tone)}>
            <c.icon size={18} />
          </span>
          <div>
            <p className="text-[11px] font-medium text-slate-400">{c.label}</p>
            <p className={cn("mt-0.5 text-lg font-bold text-slate-900 dark:text-white", c.value < 0 && "text-red-600")}>
              {formatCurrency(c.value)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
