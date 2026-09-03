"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) throw new Error("Profile not found");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [accounts, expenses, income, loans, budgets, recurring, savings, members, settings] =
    await Promise.all([
      supabase.from("accounts").select("*").then((r) => r.data ?? []),
      supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", monthStart)
        .lte("expense_date", monthEnd)
        .then((r) => r.data ?? []),
      supabase
        .from("income")
        .select("*")
        .gte("income_date", monthStart)
        .lte("income_date", monthEnd)
        .then((r) => r.data ?? []),
      supabase.from("loans").select("*").then((r) => r.data ?? []),
      supabase
        .from("budgets")
        .select("*")
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .then((r) => r.data ?? []),
      supabase.from("recurring_payments").select("*").then((r) => r.data ?? []),
      supabase.from("savings_goals").select("*").then((r) => r.data ?? []),
      supabase.from("profiles").select("*").then((r) => r.data ?? []),
      supabase
        .from("family_settings")
        .select("*")
        .eq("family_id", profile.family_id)
        .maybeSingle()
        .then((r) => r.data ?? { family_id: profile.family_id, upcoming_days: 30, emergency_reserve: 0 }),
    ]);

  const [recentExpenses, recentIncome, recentPayments] = await Promise.all([
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(8).then((r) => r.data ?? []),
    supabase.from("income").select("*").order("income_date", { ascending: false }).limit(8).then((r) => r.data ?? []),
    supabase.from("loan_payments").select("*").order("payment_date", { ascending: false }).limit(8).then((r) => r.data ?? []),
  ]);

  return {
    profile,
    accounts,
    expenses,
    income,
    loans,
    budgets,
    recurring,
    savings,
    members,
    settings,
    recentExpenses,
    recentIncome,
    recentPayments,
  };
}
