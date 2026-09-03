import { ReportsClient } from "@/components/reports/ReportsClient";
import { getFamilyMembers } from "@/lib/actions/family";
import { getLoans } from "@/lib/actions/loans";
import { getBudgets } from "@/lib/actions/budgets";
import { currentMonthYear } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { month, year } = currentMonthYear();
  const [members, loans, budgets] = await Promise.all([getFamilyMembers(), getLoans(), getBudgets(month, year)]);
  return <ReportsClient members={members as any} loans={loans as any} budgets={budgets as any} />;
}
