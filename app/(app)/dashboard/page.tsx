import { getDashboardData } from "@/lib/actions/dashboard";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { MoneyNeededCard } from "@/components/dashboard/MoneyNeededCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { MemberChart } from "@/components/dashboard/MemberChart";
import { BudgetProgressList } from "@/components/dashboard/BudgetProgressList";
import { LoanProgressList } from "@/components/dashboard/LoanProgressList";
import { UpcomingList } from "@/components/dashboard/UpcomingList";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import {
  totalAvailableMoney,
  totalDebt,
  sumAmount,
  expensesByCategory,
  expensesByMember,
  budgetProgress,
  remainingFamilyBudget,
  calculateMoneyNeeded,
} from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const available = totalAvailableMoney(data.accounts);
  const monthIncome = sumAmount(data.income);
  const monthExpenses = sumAmount(data.expenses);
  const debt = totalDebt(data.loans);
  const savings = data.savings.reduce((s, g) => s + Number(g.current_amount), 0);
  const remainingBudget = remainingFamilyBudget(data.budgets as any, data.expenses as any);

  const categoryData = expensesByCategory(data.expenses as any);
  const memberSpend = expensesByMember(data.expenses as any).map((m) => ({
    name: data.members.find((p) => p.id === m.userId)?.full_name.split(" ")[0] ?? "Unknown",
    spent: m.spent,
  }));
  const budgetItems = budgetProgress(data.budgets as any, data.expenses as any);

  const moneyNeeded = calculateMoneyNeeded({
    availableMoney: available,
    upcomingDays: data.settings.upcoming_days,
    emergencyReserve: Number(data.settings.emergency_reserve),
    recurringPayments: data.recurring as any,
    loans: data.loans as any,
  });

  // Simple 6-month income vs expense trend using this-month data only (RLS
  // scoped) — for a fuller trend, Reports page pulls historical ranges.
  const chartData = [
    {
      name: new Date().toLocaleDateString("en-IN", { month: "short" }),
      income: monthIncome,
      expense: monthExpenses,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SummaryCards
        available={available}
        income={monthIncome}
        expenses={monthExpenses}
        remainingBudget={remainingBudget}
        debt={debt}
        savings={savings}
      />

      <MoneyNeededCard result={moneyNeeded} days={data.settings.upcoming_days} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <IncomeExpenseChart data={chartData} />
        <CategoryPieChart data={categoryData} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <MemberChart data={memberSpend} />
        <BudgetProgressList items={budgetItems} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LoanProgressList loans={data.loans as any} />
        <UpcomingList payments={data.recurring as any} />
      </div>

      <RecentTransactions
        expenses={data.recentExpenses as any}
        income={data.recentIncome as any}
        payments={data.recentPayments as any}
        members={data.members as any}
      />
    </div>
  );
}
