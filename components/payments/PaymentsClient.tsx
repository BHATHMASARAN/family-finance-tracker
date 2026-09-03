"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, daysUntil, todayISO } from "@/lib/format";
import { summarizeUpcoming } from "@/lib/calculations";
import { EXPENSE_CATEGORIES, type Account, type RecurringPayment } from "@/lib/types";
import { createRecurringPayment, markPaymentPaid, deleteRecurringPayment } from "@/lib/actions/payments";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CalendarClock, Plus, Trash2, CheckCircle2 } from "lucide-react";

export function PaymentsClient({ payments, accounts }: { payments: RecurringPayment[]; accounts: Account[] }) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [dueDate, setDueDate] = useState(todayISO());
  const [frequency, setFrequency] = useState<"One Time" | "Monthly" | "Quarterly" | "Yearly">("Monthly");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const summary = summarizeUpcoming(payments);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !name || !amount) return;
    setSaving(true);
    const result = await createRecurringPayment({
      family_id: profile.family_id, payment_name: name, amount: Number(amount), category, due_date: dueDate, frequency, account_id: accountId || null,
    });
    setSaving(false);
    if (result?.error) { showToast(result.error, "error"); return; }
    showToast("Payment added");
    setOpen(false);
    setName(""); setAmount("");
    router.refresh();
  };

  const handleMarkPaid = async (p: RecurringPayment) => {
    const result = await markPaymentPaid(p.id, p.account_id, Number(p.amount), p.family_id);
    if (result?.error) showToast(result.error, "error");
    else { showToast("Marked as paid"); router.refresh(); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteRecurringPayment(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else { showToast("Payment removed"); router.refresh(); }
  };

  const sorted = [...payments].sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryTile label="Due Today" value={summary.dueToday.length} tone="danger" />
        <SummaryTile label="This Week" value={summary.dueThisWeek.length} tone="warning" />
        <SummaryTile label="This Month" value={summary.dueThisMonth.length} tone="neutral" />
        <SummaryTile label="Overdue" value={summary.overdue.length} tone="danger" />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus size={18} /> Add Payment</Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No upcoming payments" />
      ) : (
        <Card className="divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {sorted.map((p) => {
            const days = daysUntil(p.due_date);
            return (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{p.payment_name}</p>
                  <p className="text-xs text-slate-400">{p.category} · {p.frequency} · Due {formatDate(p.due_date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(p.amount)}</p>
                  <Badge tone={p.status === "Paid" ? "success" : days < 0 ? "danger" : days <= 3 ? "warning" : "neutral"}>
                    {p.status === "Paid" ? "Paid" : days < 0 ? "Overdue" : days === 0 ? "Due today" : `in ${days}d`}
                  </Badge>
                </div>
                <div className="flex shrink-0 gap-1">
                  {p.status !== "Paid" && (
                    <button onClick={() => handleMarkPaid(p)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40" aria-label="Mark paid">
                      <CheckCircle2 size={17} />
                    </button>
                  )}
                  <button onClick={() => setDeleteId(p.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Upcoming Payment">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Payment Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity Bill" />
          <Input label="Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Select label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
            <option>One Time</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option>
          </Select>
          <Select label="Pay From Account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
          </Select>
          <Button type="submit" loading={saving} className="w-full">Save Payment</Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently delete the upcoming payment." loading={deleting} />
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: "danger" | "warning" | "neutral" }) {
  const toneClasses = {
    danger: "text-red-600 bg-red-50 dark:bg-red-950/40",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    neutral: "text-slate-600 bg-slate-50 dark:bg-slate-800",
  };
  return (
    <Card className="text-center">
      <p className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-2 text-xs font-medium text-slate-400">{label}</p>
    </Card>
  );
}
