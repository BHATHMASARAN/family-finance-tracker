"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { loanProgressPercent } from "@/lib/calculations";
import type { Account, Loan, LoanPayment } from "@/lib/types";
import { PaymentForm } from "./PaymentForm";
import { deleteLoanPayment } from "@/lib/actions/loans";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { CalendarClock, Trash2, Receipt } from "lucide-react";

export function LoanDetailClient({
  loan,
  payments,
  accounts,
  familyId,
}: {
  loan: Loan;
  payments: LoanPayment[];
  accounts: Account[];
  familyId: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pct = loanProgressPercent(loan);
  const paidAmount = loan.original_amount - loan.remaining_amount;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteLoanPayment(deleteId, loan.id);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else {
      showToast("Payment removed");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{loan.loan_name}</h2>
            <p className="text-sm text-slate-400">{loan.lender_name} · {loan.loan_type}</p>
          </div>
          <Badge tone={loan.status === "Active" ? "warning" : loan.status === "Completed" ? "success" : "neutral"}>
            {loan.status}
          </Badge>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-slate-400">{pct}% paid off</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Original" value={formatCurrency(loan.original_amount)} />
          <Stat label="Remaining" value={formatCurrency(loan.remaining_amount)} />
          <Stat label="Paid" value={formatCurrency(paidAmount)} />
          <Stat label="Interest Rate" value={`${loan.interest_rate}%`} />
          <Stat label="EMI" value={formatCurrency(loan.emi_amount)} />
          <Stat label="Next Payment" value={loan.next_payment_date ? formatDate(loan.next_payment_date) : "—"} />
        </div>

        {loan.status === "Active" && (
          <Button className="mt-4 w-full" onClick={() => setPayOpen(true)}>
            <CalendarClock size={18} /> Record Payment
          </Button>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        {payments.length === 0 ? (
          <EmptyState icon={Receipt} title="No payments recorded yet" />
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.payment_type}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.payment_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(p.amount)}</p>
                  <button onClick={() => setDeleteId(p.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <PaymentForm open={payOpen} onClose={() => setPayOpen(false)} loan={loan} accounts={accounts} familyId={familyId} />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This reverses the payment: the loan balance and account balance will be restored."
        loading={deleting}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}
