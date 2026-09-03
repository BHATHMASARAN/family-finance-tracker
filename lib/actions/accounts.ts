"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AccountType } from "@/lib/types";

export async function getAccounts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createAccount(input: {
  family_id: string;
  owner_id: string | null;
  account_name: string;
  account_type: AccountType;
  opening_balance: number;
  notes?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("accounts").insert({
    family_id: input.family_id,
    owner_id: input.owner_id,
    account_name: input.account_name,
    account_type: input.account_type,
    opening_balance: input.opening_balance,
    current_balance: input.opening_balance,
    notes: input.notes ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateAccount(
  id: string,
  input: Partial<{
    account_name: string;
    account_type: AccountType;
    owner_id: string | null;
    notes: string;
    is_active: boolean;
  }>
) {
  const supabase = createClient();
  const { error } = await supabase.from("accounts").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteAccount(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { error: null };
}
