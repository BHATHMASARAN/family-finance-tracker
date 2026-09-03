"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Frequency } from "@/lib/types";

export async function getRecurringPayments() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recurring_payments")
    .select("*")
    .order("due_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createRecurringPayment(input: {
  family_id: string;
  payment_name: string;
  amount: number;
  category: string;
  due_date: string;
  frequency: Frequency;
  account_id?: string | null;
  notes?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("recurring_payments").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateRecurringPayment(
  id: string,
  input: Partial<{
    payment_name: string;
    amount: number;
    category: string;
    due_date: string;
    frequency: Frequency;
    account_id: string | null;
    status: "Upcoming" | "Paid" | "Overdue";
    notes: string;
  }>
) {
  const supabase = createClient();
  const { error } = await supabase.from("recurring_payments").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function markPaymentPaid(id: string, accountId: string | null, amount: number, familyId: string) {
  const supabase = createClient();

  // Mark this bill paid.
  const { error: updateErr } = await supabase
    .from("recurring_payments")
    .update({ status: "Paid" })
    .eq("id", id);
  if (updateErr) return { error: updateErr.message };

  // Reflect the outflow as an expense so it counts in balances & reports.
  if (accountId) {
    const { data: payment } = await supabase.from("recurring_payments").select("*").eq("id", id).single();
    const { error: rpcErr } = await supabase.rpc("add_expense", {
      p_family_id: familyId,
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_account_id: accountId,
      p_amount: amount,
      p_category: "Other",
      p_description: payment ? `Bill: ${payment.payment_name}` : "Recurring bill payment",
      p_expense_date: new Date().toISOString().slice(0, 10),
    });
    if (rpcErr) return { error: rpcErr.message };
  }

  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  return { error: null };
}

export async function deleteRecurringPayment(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("recurring_payments").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { error: null };
}
