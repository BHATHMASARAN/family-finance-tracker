"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { INCOME_TYPES, type Account, type Income, type Profile } from "@/lib/types";
import { createIncome, updateIncome } from "@/lib/actions/income";
import { validateAmount } from "@/lib/validation";
import { todayISO } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export function IncomeForm({
  accounts,
  members,
  income,
}: {
  accounts: Account[];
  members: Profile[];
  income?: Income;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [amount, setAmount] = useState(income?.amount?.toString() ?? "");
  const [incomeType, setIncomeType] = useState<string>(income?.income_type ?? INCOME_TYPES[0]);
  const [userId, setUserId] = useState(income?.user_id ?? profile?.id ?? "");
  const [accountId, setAccountId] = useState(income?.account_id ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(income?.income_date ?? todayISO());
  const [description, setDescription] = useState(income?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    const amtErr = validateAmount(amount);
    if (amtErr) errs.amount = amtErr;
    if (!accountId) errs.accountId = "Account is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !profile) return;
    setLoading(true);

    const result = income
      ? await updateIncome(income.id, {
          account_id: accountId,
          amount: Number(amount),
          income_type: incomeType as any,
          description,
          income_date: date,
        })
      : await createIncome({
          family_id: profile.family_id,
          user_id: userId,
          account_id: accountId,
          amount: Number(amount),
          income_type: incomeType as any,
          description,
          income_date: date,
        });

    setLoading(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(income ? "Income updated" : "Income added");
    router.push("/income");
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
      <Select label="Income Type" value={incomeType} onChange={(e) => setIncomeType(e.target.value)}>
        {INCOME_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>
      <Select label="Received By" value={userId} onChange={(e) => setUserId(e.target.value)}>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.full_name}</option>
        ))}
      </Select>
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <p className="text-sm font-medium">No accounts found</p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
            You need to create at least one account (e.g., Cash, Bank, GPay) before adding income.
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
            <option key={a.id} value={a.id}>{a.account_name} ({a.account_type})</option>
          ))}
        </Select>
      )}
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{income ? "Save Changes" : "Add Income"}</Button>
      </div>
    </form>
  );
}
