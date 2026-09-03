"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { budgetProgress, remainingFamilyBudget } from "@/lib/calculations";
import { EXPENSE_CATEGORIES, type Budget, type Expense } from "@/lib/types";
import { upsertBudget } from "@/lib/actions/budgets";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function BudgetClient({
  budgets,
  expenses,
  month,
  year,
}: {
  budgets: Budget[];
  expenses: Expense[];
  month: number;
  year: number;
}) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const progress = useMemo(() => budgetProgress(budgets, expenses), [budgets, expenses]);
  const remaining = useMemo(() => remainingFamilyBudget(budgets, expenses), [budgets, expenses]);
  const totalBudget = budgets.reduce((s, b) => s + Number(b.budget_amount), 0);

  const openEdit = (cat: string, amt?: number) => {
    setCategory(cat);
    setAmount(amt ? String(amt) : "");
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !amount) return;
    setSaving(true);
    const result = await upsertBudget({
      family_id: profile.family_id,
      category,
      budget_amount: Number(amount),
      month,
      year,
    });
    setSaving(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast("Budget saved");
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-medium text-slate-400">Total Budget — {formatMonthYear(month, year)}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-slate-400">Remaining Family Budget</p>
          <p className={cn("mt-1 text-2xl font-bold", remaining < 0 ? "text-red-600" : "text-brand-600")}>
            {formatCurrency(remaining)}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <Button size="sm" onClick={() => openEdit(EXPENSE_CATEGORIES[0])}>
            <Plus size={16} /> Set Budget
          </Button>
        </CardHeader>
        <div className="flex flex-col gap-4">
          {EXPENSE_CATEGORIES.map((cat) => {
            const item = progress.find((p) => p.category === cat);
            if (!item) return null;
            return (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <button onClick={() => openEdit(cat, item.budget)} className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                    {cat} <Pencil size={12} className="text-slate-400" />
                  </button>
                  <span className="text-slate-400">{formatCurrency(item.spent)} / {formatCurrency(item.budget)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      item.level === "exceeded" ? "bg-red-500" : item.level === "warning" ? "bg-amber-500" : "bg-brand-500"
                    )}
                    style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-slate-400">{Math.round(item.percentUsed)}% used</p>
                  {item.level === "exceeded" && <p className="text-xs font-semibold text-red-600">⚠ Budget exceeded</p>}
                  {item.level === "warning" && <p className="text-xs font-semibold text-amber-600">⚠ 80% used</p>}
                </div>
              </div>
            );
          })}
          {budgets.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">No budgets set for this month yet. Tap "Set Budget" to start.</p>
          )}
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Set Category Budget">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Budget Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" loading={saving} className="w-full">Save Budget</Button>
        </form>
      </Modal>
    </div>
  );
}
