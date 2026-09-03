import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDateShort, daysUntil } from "@/lib/format";
import type { RecurringPayment } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CalendarClock } from "lucide-react";
import Link from "next/link";

export function UpcomingList({ payments }: { payments: RecurringPayment[] }) {
  const upcoming = payments
    .filter((p) => p.status !== "Paid")
    .sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <Link href="/payments" className="text-xs font-semibold text-brand-600">View all</Link>
      </CardHeader>
      {upcoming.length === 0 ? (
        <EmptyState icon={CalendarClock} title="Nothing due soon" />
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {upcoming.map((p) => {
            const days = daysUntil(p.due_date);
            return (
              <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.payment_name}</p>
                  <p className="text-xs text-slate-400">{formatDateShort(p.due_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(p.amount)}</p>
                  <Badge tone={days < 0 ? "danger" : days <= 3 ? "warning" : "neutral"}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `in ${days}d`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
