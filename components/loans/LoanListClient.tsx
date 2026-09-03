"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { loanProgressPercent } from "@/lib/calculations";
import type { Loan } from "@/lib/types";
import { deleteLoan } from "@/lib/actions/loans";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Landmark, Plus, Trash2 } from "lucide-react";

export function LoanListClient({ loans }: { loans: Loan[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteLoan(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else {
      showToast("Loan deleted");
      router.refresh();
    }
  };

  const totalDebt = loans.filter((l) => l.status === "Active").reduce((s, l) => s + Number(l.remaining_amount), 0);

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-amber-600 text-white">
        <p className="text-sm font-medium text-amber-100">Total Debt</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(totalDebt)}</p>
        <p className="mt-1 text-xs text-amber-100">Across {loans.filter((l) => l.status === "Active").length} active loans</p>
      </Card>

      <div className="hidden justify-end md:flex">
        <Link href="/loans/new"><Button><Plus size={18} /> Add Loan</Button></Link>
      </div>

      {loans.length === 0 ? (
        <EmptyState icon={Landmark} title="No loans added yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {loans.map((l) => {
            const pct = loanProgressPercent(l);
            return (
              <Card key={l.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{l.loan_name}</p>
                    <p className="text-xs text-slate-400">{l.lender_name} · {l.loan_type}</p>
                  </div>
                  <Badge tone={l.status === "Active" ? "warning" : l.status === "Completed" ? "success" : "neutral"}>
                    {l.status}
                  </Badge>
                </div>

                <div className="mt-3 flex items-baseline justify-between text-sm">
                  <span className="text-slate-400">Remaining</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(l.remaining_amount)}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>{pct}% paid</span>
                  <span>of {formatCurrency(l.original_amount)}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                    <p className="text-slate-400">EMI</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(l.emi_amount)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                    <p className="text-slate-400">Next Due</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {l.next_payment_date ? formatDate(l.next_payment_date) : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link href={`/loans/${l.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">View Details</Button>
                  </Link>
                  <button
                    onClick={() => setDeleteId(l.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This deletes the loan and all its payment history permanently."
        loading={deleting}
      />
    </div>
  );
}
