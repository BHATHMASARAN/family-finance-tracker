"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { savingsProgressPercent } from "@/lib/calculations";
import type { SavingsGoal } from "@/lib/types";
import { createSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from "@/lib/actions/savings";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { PiggyBank, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SavingsClient({ goals }: { goals: SavingsGoal[] }) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  const openNew = () => {
    setEditing(null);
    setName(""); setTarget(""); setCurrent("0"); setTargetDate("");
    setOpen(true);
  };
  const openEdit = (g: SavingsGoal) => {
    setEditing(g);
    setName(g.goal_name); setTarget(String(g.target_amount)); setCurrent(String(g.current_amount));
    setTargetDate(g.target_date ?? "");
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !name || !target) return;
    setSaving(true);
    const result = editing
      ? await updateSavingsGoal(editing.id, {
          goal_name: name, target_amount: Number(target), current_amount: Number(current) || 0, target_date: targetDate || undefined,
        })
      : await createSavingsGoal({
          family_id: profile.family_id, goal_name: name, target_amount: Number(target), current_amount: Number(current) || 0, target_date: targetDate || undefined,
        });
    setSaving(false);
    if (result?.error) { showToast(result.error, "error"); return; }
    showToast("Savings goal saved");
    setOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteSavingsGoal(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else { showToast("Goal deleted"); router.refresh(); }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-sky-600 text-white">
        <p className="text-sm font-medium text-sky-100">Total Savings</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(totalSaved)}</p>
        <p className="mt-1 text-xs text-sky-100">of {formatCurrency(totalTarget)} target across {goals.length} goals</p>
      </Card>

      <div className="flex justify-end">
        <Button onClick={openNew}><Plus size={18} /> Add Savings Goal</Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No savings goals yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {goals.map((g) => {
            const pct = savingsProgressPercent(Number(g.current_amount), Number(g.target_amount));
            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{g.goal_name}</p>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(g)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(g.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><Trash2 size={14} /></button>
                  </div>
                </div>
                {g.target_date && <p className="text-xs text-slate-400">Target: {formatDate(g.target_date)}</p>}
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={cn("h-full rounded-full bg-sky-500")} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(g.current_amount)}</span>
                  <span className="text-slate-400">of {formatCurrency(g.target_amount)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{pct}% complete · {formatCurrency(Number(g.target_amount) - Number(g.current_amount))} remaining</p>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Savings Goal" : "Add Savings Goal"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="Goal Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency Fund" />
          <Input label="Target Amount (₹)" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
          <Input label="Current Amount (₹)" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <Input label="Target Date (optional)" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <Button type="submit" loading={saving} className="w-full">Save Goal</Button>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently delete the savings goal." loading={deleting} />
    </div>
  );
}
