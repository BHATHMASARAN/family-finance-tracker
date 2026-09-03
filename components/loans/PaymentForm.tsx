"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { recordLoanPayment } from "@/lib/actions/loans";
import { validateAmount } from "@/lib/validation";
import { todayISO } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import type { Account, Loan } from "@/lib/types";
import { useRouter } from "next/navigation";

export function PaymentForm({
  open,
  onClose,
  loan,
  accounts,
  familyId,
}: {
  open: boolean;
  onClose: () => void;
  loan: Loan;
  accounts: Account[];
  familyId: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [amount, setAmount] = useState(loan.emi_amount?.toString() ?? "");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [paymentType, setPaymentType] = useState<"EMI" | "Partial" | "Full Settlement" | "Other">("EMI");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtErr = validateAmount(amount);
    if (amtErr) {
      setError(amtErr);
      return;
    }
    setLoading(true);
    const result = await recordLoanPayment({
      loan_id: loan.id,
      family_id: familyId,
      account_id: accountId || null,
      amount: Number(amount),
      payment_date: date,
      payment_type: paymentType,
    });
    setLoading(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast("Payment recorded");
    onClose();
    router.refresh();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Record Payment — ${loan.loan_name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} error={error} />
        <Select label="Pay From Account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
        </Select>
        <Select label="Payment Type" value={paymentType} onChange={(e) => setPaymentType(e.target.value as any)}>
          <option value="EMI">EMI</option>
          <option value="Partial">Partial</option>
          <option value="Full Settlement">Full Settlement</option>
          <option value="Other">Other</option>
        </Select>
        <Input label="Payment Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">Confirm Payment</Button>
      </form>
    </Modal>
  );
}
