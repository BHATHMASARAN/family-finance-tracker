"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSavingsGoals() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createSavingsGoal(input: {
  family_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("savings_goals").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateSavingsGoal(
  id: string,
  input: Partial<{
    goal_name: string;
    target_amount: number;
    current_amount: number;
    target_date: string;
    status: "Active" | "Completed" | "Cancelled";
  }>
) {
  const supabase = createClient();
  const { error } = await supabase.from("savings_goals").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteSavingsGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("savings_goals").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { error: null };
}
