import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { MoneyNeededResult } from "@/lib/calculations";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MoneyNeededCard({ result, days }: { result: MoneyNeededResult; days: number }) {
  const sufficient = result.isSufficient;
  return (
    <Card
      className={cn(
        "border-2",
        sufficient
          ? "border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/30"
          : "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            sufficient ? "bg-brand-100 text-brand-700 dark:bg-brand-900" : "bg-red-100 text-red-700 dark:bg-red-900"
          )}
        >
          {sufficient ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Money Needed (next {days} days)
          </p>
          {sufficient ? (
            <p className="mt-0.5 text-xl font-bold text-brand-700 dark:text-brand-400">
              ✓ Current available money is sufficient
            </p>
          ) : (
            <p className="mt-0.5 text-xl font-bold text-red-600">
              ⚠ Shortage of {formatCurrency(result.shortage)}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <Stat label="Upcoming Bills" value={result.upcomingPaymentsTotal} />
            <Stat label="Upcoming EMI" value={result.upcomingEmiTotal} />
            <Stat label="Emergency Reserve" value={result.emergencyReserve} />
            <Stat label="Available" value={result.availableMoney} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/70 p-2 dark:bg-slate-900/40">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(value)}</p>
    </div>
  );
}
