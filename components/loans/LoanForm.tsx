"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LOAN_TYPES, type Loan } from "@/lib/types";
import { createLoan, updateLoan } from "@/lib/actions/loans";
import { validateRequired } from "@/lib/validation";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export function LoanForm({ loan }: { loan?: Loan }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [name, setName] = useState(loan?.loan_name ?? "");
  const [type, setType] = useState<string>(loan?.loan_type ?? LOAN_TYPES[0]);
  const [lender, setLender] = useState(loan?.lender_name ?? "");
  const [originalAmount, setOriginalAmount] = useState(loan?.original_amount?.toString() ?? "");
  const [remainingAmount, setRemainingAmount] = useState(loan?.remaining_amount?.toString() ?? "");
  const [interestRate, setInterestRate] = useState(loan?.interest_rate?.toString() ?? "0");
  const [emi, setEmi] = useState(loan?.emi_amount?.toString() ?? "0");
  const [startDate, setStartDate] = useState(loan?.start_date ?? "");
  const [nextPayment, setNextPayment] = useState(loan?.next_payment_date ?? "");
  const [notes, setNotes] = useState(loan?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (validateRequired(name, "Loan name")) errs.name = "Loan name is required";
    if (!originalAmount || Number(originalAmount) <= 0) errs.originalAmount = "Enter a valid amount";
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !profile) return;

    setLoading(true);
    const result = loan
      ? await updateLoan(loan.id, {
          loan_name: name,
          loan_type: type as any,
          lender_name: lender,
          interest_rate: Number(interestRate) || 0,
          emi_amount: Number(emi) || 0,
          next_payment_date: nextPayment || undefined,
          notes,
        })
      : await createLoan({
          family_id: profile.family_id,
          loan_name: name,
          loan_type: type as any,
          lender_name: lender,
          original_amount: Number(originalAmount),
          remaining_amount: Number(remainingAmount || originalAmount),
          interest_rate: Number(interestRate) || 0,
          emi_amount: Number(emi) || 0,
          start_date: startDate || undefined,
          next_payment_date: nextPayment || undefined,
          notes,
        });

    setLoading(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(loan ? "Loan updated" : "Loan added");
    router.push("/loans");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Loan Name" placeholder="e.g. Home Loan" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Select label="Loan Type" value={type} onChange={(e) => setType(e.target.value)}>
        {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>
      <Input label="Lender Name" placeholder="e.g. HDFC Ltd" value={lender} onChange={(e) => setLender(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Original Amount (₹)"
          type="number"
          value={originalAmount}
          onChange={(e) => setOriginalAmount(e.target.value)}
          error={errors.originalAmount}
          disabled={!!loan}
        />
        <Input
          label="Remaining Amount (₹)"
          type="number"
          value={remainingAmount}
          onChange={(e) => setRemainingAmount(e.target.value)}
          disabled={!!loan}
          placeholder={originalAmount}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Interest Rate (%)" type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        <Input label="EMI Amount (₹)" type="number" value={emi} onChange={(e) => setEmi(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={!!loan} />
        <Input label="Next Payment Date" type="date" value={nextPayment} onChange={(e) => setNextPayment(e.target.value)} />
      </div>
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{loan ? "Save Changes" : "Add Loan"}</Button>
      </div>
    </form>
  );
}
