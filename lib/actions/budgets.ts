"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBudgets(month: number, year: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .eq("year", year);
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertBudget(input: {
  family_id: string;
  category: string;
  budget_amount: number;
  month: number;
  year: number;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("budgets")
    .upsert(input, { onConflict: "family_id,category,month,year" });
  if (error) return { error: error.message };
  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteBudget(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return { error: null };
}
