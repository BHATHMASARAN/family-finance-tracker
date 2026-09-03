"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ExpenseCategory } from "@/lib/types";

export interface ExpenseFilters {
  category?: string;
  userId?: string;
  accountId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export async function getExpenses(filters: ExpenseFilters = {}) {
  const supabase = createClient();
  let query = supabase.from("expenses").select("*").order("expense_date", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.from) query = query.gte("expense_date", filters.from);
  if (filters.to) query = query.lte("expense_date", filters.to);
  if (filters.search) query = query.ilike("description", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createExpense(input: {
  family_id: string;
  user_id: string;
  account_id: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expense_date: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.rpc("add_expense", {
    p_family_id: input.family_id,
    p_user_id: input.user_id,
    p_account_id: input.account_id,
    p_amount: input.amount,
    p_category: input.category,
    p_description: input.description ?? null,
    p_expense_date: input.expense_date,
  });
  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/budget");
  revalidatePath("/reports");
  return { error: null };
}

export async function updateExpense(
  id: string,
  input: {
    account_id: string;
    amount: number;
    category: ExpenseCategory;
    description?: string;
    expense_date: string;
  }
) {
  const supabase = createClient();
  const { error } = await supabase.rpc("update_expense", {
    p_id: id,
    p_account_id: input.account_id,
    p_amount: input.amount,
    p_category: input.category,
    p_description: input.description ?? null,
    p_expense_date: input.expense_date,
  });
  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/budget");
  revalidatePath("/reports");
  return { error: null };
}

export async function deleteExpense(id: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("delete_expense", { p_id: id });
  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/budget");
  revalidatePath("/reports");
  return { error: null };
}
