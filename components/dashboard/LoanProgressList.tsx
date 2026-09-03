import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { Loan } from "@/lib/types";
import { loanProgressPercent } from "@/lib/calculations";
import { EmptyState } from "@/components/ui/EmptyState";
import { Landmark } from "lucide-react";
import Link from "next/link";

export function LoanProgressList({ loans }: { loans: Loan[] }) {
  const active = loans.filter((l) => l.status === "Active");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan / Debt Progress</CardTitle>
        <Link href="/loans" className="text-xs font-semibold text-brand-600">View all</Link>
      </CardHeader>
      {active.length === 0 ? (
        <EmptyState icon={Landmark} title="No active loans" />
      ) : (
        <div className="flex flex-col gap-4">
          {active.slice(0, 4).map((l) => {
            const pct = loanProgressPercent(l);
            return (
              <div key={l.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{l.loan_name}</span>
                  <span className="text-slate-400">{formatCurrency(l.remaining_amount)} left</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{pct}% paid off</p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
