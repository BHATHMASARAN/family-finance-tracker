"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { LoanType, LoanStatus } from "@/lib/types";

export async function getLoans() {
  const supabase = createClient();
  const { data, error } = await supabase.from("loans").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getLoan(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("loans").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getLoanPayments(loanId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loan_payments")
    .select("*")
    .eq("loan_id", loanId)
    .order("payment_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createLoan(input: {
  family_id: string;
  loan_name: string;
  loan_type: LoanType;
  lender_name?: string;
  original_amount: number;
  remaining_amount: number;
  interest_rate?: number;
  emi_amount?: number;
  start_date?: string;
  end_date?: string;
  next_payment_date?: string;
  notes?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("loans").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateLoan(
  id: string,
  input: Partial<{
    loan_name: string;
    loan_type: LoanType;
    lender_name: string;
    interest_rate: number;
    emi_amount: number;
    end_date: string;
    next_payment_date: string;
    status: LoanStatus;
    notes: string;
  }>
) {
  const supabase = createClient();
  const { error } = await supabase.from("loans").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteLoan(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("loans").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/loans");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function recordLoanPayment(input: {
  loan_id: string;
  family_id: string;
  account_id: string | null;
  amount: number;
  payment_date: string;
  payment_type: string;
  notes?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.rpc("add_loan_payment", {
    p_loan_id: input.loan_id,
    p_family_id: input.family_id,
    p_account_id: input.account_id,
    p_amount: input.amount,
    p_payment_date: input.payment_date,
    p_payment_type: input.payment_type,
    p_notes: input.notes ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath("/loans");
  revalidatePath(`/loans/${input.loan_id}`);
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { error: null };
}

export async function deleteLoanPayment(id: string, loanId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_loan_payment", { p_id: id });
  if (error) return { error: error.message };
  revalidatePath("/loans");
  revalidatePath(`/loans/${loanId}`);
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { error: null };
}
