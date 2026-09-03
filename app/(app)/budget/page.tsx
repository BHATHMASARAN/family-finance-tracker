import { BudgetClient } from "@/components/budget/BudgetClient";
import { getBudgets } from "@/lib/actions/budgets";
import { createClient } from "@/lib/supabase/server";
import { currentMonthYear } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const { month, year } = currentMonthYear();
  const supabase = createClient();
  const monthStart = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);

  const [budgets, { data: expenses }] = await Promise.all([
    getBudgets(month, year),
    supabase.from("expenses").select("*").gte("expense_date", monthStart).lte("expense_date", monthEnd),
  ]);

  return <BudgetClient budgets={budgets as any} expenses={(expenses ?? []) as any} month={month} year={year} />;
}
