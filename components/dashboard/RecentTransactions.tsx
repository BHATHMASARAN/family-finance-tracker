import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { Expense, Income, LoanPayment, Profile } from "@/lib/types";
import { ArrowDownCircle, ArrowUpCircle, Landmark } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Receipt } from "lucide-react";

type Row =
  | { kind: "expense"; date: string; item: Expense }
  | { kind: "income"; date: string; item: Income }
  | { kind: "payment"; date: string; item: LoanPayment };

export function RecentTransactions({
  expenses,
  income,
  payments,
  members,
}: {
  expenses: Expense[];
  income: Income[];
  payments: LoanPayment[];
  members: Profile[];
}) {
  const rows: Row[] = [
    ...expenses.map((e) => ({ kind: "expense" as const, date: e.expense_date, item: e })),
    ...income.map((i) => ({ kind: "income" as const, date: i.income_date, item: i })),
    ...payments.map((p) => ({ kind: "payment" as const, date: p.payment_date, item: p })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const memberName = (id: string) => members.find((m) => m.id === id)?.full_name ?? "Family";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      {rows.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" />
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((r, idx) => (
            <div key={idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
                  (r.kind === "income"
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-950/50"
                    : r.kind === "expense"
                    ? "bg-red-50 text-red-600 dark:bg-red-950/50"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/50")
                }
              >
                {r.kind === "income" ? (
                  <ArrowUpCircle size={18} />
                ) : r.kind === "expense" ? (
                  <ArrowDownCircle size={18} />
                ) : (
                  <Landmark size={18} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {r.kind === "expense" ? r.item.category : r.kind === "income" ? r.item.income_type : "Loan Payment"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {"user_id" in r.item ? memberName((r.item as Expense | Income).user_id) : "Family"} · {formatDateShort(r.date)}
                </p>
              </div>
              <p
                className={
                  "shrink-0 text-sm font-bold " +
                  (r.kind === "income" ? "text-brand-600" : "text-red-600")
                }
              >
                {r.kind === "income" ? "+" : "-"}
                {formatCurrency(r.item.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
