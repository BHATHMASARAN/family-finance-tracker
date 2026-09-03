"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EXPENSE_CATEGORIES, type Account, type Expense, type Profile } from "@/lib/types";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { validateAmount, validateRequired } from "@/lib/validation";
import { todayISO } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export function ExpenseForm({
  accounts,
  members,
  expense,
}: {
  accounts: Account[];
  members: Profile[];
  expense?: Expense;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [category, setCategory] = useState<string>(expense?.category ?? EXPENSE_CATEGORIES[0]);
  const [userId, setUserId] = useState(expense?.user_id ?? profile?.id ?? "");
  const [accountId, setAccountId] = useState(expense?.account_id ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(expense?.expense_date ?? todayISO());
  const [description, setDescription] = useState(expense?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    const amtErr = validateAmount(amount);
    if (amtErr) errs.amount = amtErr;
    if (validateRequired(accountId, "Account")) errs.accountId = "Account is required";
    if (validateRequired(date, "Date")) errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !profile) return;
    setLoading(true);

    const result = expense
      ? await updateExpense(expense.id, {
          account_id: accountId,
          amount: Number(amount),
          category: category as any,
          description,
          expense_date: date,
        })
      : await createExpense({
          family_id: profile.family_id,
          user_id: userId,
          account_id: accountId,
          amount: Number(amount),
          category: category as any,
          description,
          expense_date: date,
        });

    setLoading(false);

    if (result?.error) {
      showToast(result.error, "error");
      return;
    }

    showToast(expense ? "Expense updated" : "Expense added");
    router.push("/expenses");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Amount (₹)"
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
      />

      <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Select label="Paid By" value={userId} onChange={(e) => setUserId(e.target.value)}>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.full_name}
          </option>
        ))}
      </Select>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <p className="text-sm font-medium">No accounts found</p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            You need to create at least one account (e.g., Cash, Bank, GPay) before adding an expense.
          </p>
          <Button
            type="button"
            className="mt-3 text-xs"
            onClick={() => router.push("/accounts/new")}
          >
            + Create Account First
          </Button>
        </div>
      ) : (
        <Select label="Account" value={accountId} onChange={(e) => setAccountId(e.target.value)} error={errors.accountId}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.account_name} ({a.account_type})
            </option>
          ))}
        </Select>
      )}

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />

      <Textarea
        label="Description (optional)"
        placeholder="e.g. Weekly groceries"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {expense ? "Save Changes" : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
