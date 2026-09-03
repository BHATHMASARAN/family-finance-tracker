"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { IncomeType } from "@/lib/types";

export interface IncomeFilters {
  userId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export async function getIncome(filters: IncomeFilters = {}) {
  const supabase = createClient();
  let query = supabase.from("income").select("*").order("income_date", { ascending: false });

  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.from) query = query.gte("income_date", filters.from);
  if (filters.to) query = query.lte("income_date", filters.to);
  if (filters.search) query = query.ilike("description", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createIncome(input: {
  family_id: string;
  user_id: string;
  account_id: string;
  amount: number;
  income_type: IncomeType;
  description?: string;
  income_date: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.rpc("add_income", {
    p_family_id: input.family_id,
    p_user_id: input.user_id,
    p_account_id: input.account_id,
    p_amount: input.amount,
    p_income_type: input.income_type,
    p_description: input.description ?? null,
    p_income_date: input.income_date,
  });
  if (error) return { error: error.message };
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/reports");
  return { error: null };
}

export async function updateIncome(
  id: string,
  input: {
    account_id: string;
    amount: number;
    income_type: IncomeType;
    description?: string;
    income_date: string;
  }
) {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_income", {
    p_id: id,
    p_account_id: input.account_id,
    p_amount: input.amount,
    p_income_type: input.income_type,
    p_description: input.description ?? null,
    p_income_date: input.income_date,
  });
  if (error) return { error: error.message };
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/reports");
  return { error: null };
}

export async function deleteIncome(id: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_income", { p_id: id });
  if (error) return { error: error.message };
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/reports");
  return { error: null };
}
