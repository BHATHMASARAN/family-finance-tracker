import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { BudgetProgress } from "@/lib/calculations";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function BudgetProgressList({ items }: { items: BudgetProgress[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
        <Link href="/budget" className="text-xs font-semibold text-brand-600">Manage</Link>
      </CardHeader>
      {items.length === 0 ? (
        <EmptyState icon={CreditCard} title="No budgets set" description="Create category budgets to track spending" />
      ) : (
        <div className="flex flex-col gap-4">
          {items.slice(0, 6).map((b) => (
            <div key={b.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{b.category}</span>
                <span className="text-slate-400">
                  {formatCurrency(b.spent)} / {formatCurrency(b.budget)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    b.level === "exceeded" ? "bg-red-500" : b.level === "warning" ? "bg-amber-500" : "bg-brand-500"
                  )}
                  style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                />
              </div>
              {b.level !== "ok" && (
                <p className={cn("mt-1 text-xs font-medium", b.level === "exceeded" ? "text-red-600" : "text-amber-600")}>
                  {b.level === "exceeded" ? "Budget exceeded" : "80% of budget used"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
