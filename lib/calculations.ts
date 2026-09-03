import type { Account, Budget, Expense, Income, Loan, RecurringPayment } from "./types";
import { daysUntil } from "./format";

export function totalAvailableMoney(accounts: Account[]): number {
  return accounts.filter((a) => a.is_active).reduce((sum, a) => sum + Number(a.current_balance), 0);
}

export function totalDebt(loans: Loan[]): number {
  return loans
    .filter((l) => l.status === "Active")
    .reduce((sum, l) => sum + Number(l.remaining_amount), 0);
}

export function totalOriginalDebt(loans: Loan[]): number {
  return loans.reduce((sum, l) => sum + Number(l.original_amount), 0);
}

export function totalPaidDebt(loans: Loan[]): number {
  return loans.reduce((sum, l) => sum + (Number(l.original_amount) - Number(l.remaining_amount)), 0);
}

export function sumAmount<T extends { amount: number }>(rows: T[]): number {
  return rows.reduce((sum, r) => sum + Number(r.amount), 0);
}

export function filterThisMonth<T extends { [key: string]: any }>(
  rows: T[],
  dateField: string
): T[] {
  const now = new Date();
  return rows.filter((r) => {
    const d = new Date(r[dateField]);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

export interface CategorySpend {
  category: string;
  spent: number;
}

export function expensesByCategory(expenses: Expense[]): CategorySpend[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount));
  }
  return Array.from(map.entries())
    .map(([category, spent]) => ({ category, spent }))
    .sort((a, b) => b.spent - a.spent);
}

export interface MemberSpend {
  userId: string;
  spent: number;
}

export function expensesByMember(expenses: Expense[]): MemberSpend[] {
  const map = new Map<string, number>();
  for (const e of expenses) {
    map.set(e.user_id, (map.get(e.user_id) ?? 0) + Number(e.amount));
  }
  return Array.from(map.entries()).map(([userId, spent]) => ({ userId, spent }));
}

export interface BudgetProgress {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  level: "ok" | "warning" | "exceeded";
}

export function budgetProgress(budgets: Budget[], expenses: Expense[]): BudgetProgress[] {
  const spendByCategory = new Map<string, number>();
  for (const e of expenses) {
    spendByCategory.set(e.category, (spendByCategory.get(e.category) ?? 0) + Number(e.amount));
  }
  return budgets.map((b) => {
    const spent = spendByCategory.get(b.category) ?? 0;
    const percentUsed = b.budget_amount > 0 ? (spent / b.budget_amount) * 100 : 0;
    return {
      category: b.category,
      budget: Number(b.budget_amount),
      spent,
      remaining: Number(b.budget_amount) - spent,
      percentUsed,
      level: percentUsed >= 100 ? "exceeded" : percentUsed >= 80 ? "warning" : "ok",
    };
  });
}

export function remainingFamilyBudget(budgets: Budget[], expenses: Expense[]): number {
  const totalBudget = budgets.reduce((s, b) => s + Number(b.budget_amount), 0);
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  return totalBudget - totalSpent;
}

export interface UpcomingSummary {
  dueToday: RecurringPayment[];
  dueThisWeek: RecurringPayment[];
  dueThisMonth: RecurringPayment[];
  overdue: RecurringPayment[];
}

export function summarizeUpcoming(payments: RecurringPayment[]): UpcomingSummary {
  const dueToday: RecurringPayment[] = [];
  const dueThisWeek: RecurringPayment[] = [];
  const dueThisMonth: RecurringPayment[] = [];
  const overdue: RecurringPayment[] = [];

  for (const p of payments) {
    if (p.status === "Paid") continue;
    const days = daysUntil(p.due_date);
    if (days < 0) overdue.push(p);
    else if (days === 0) dueToday.push(p);
    else if (days <= 7) dueThisWeek.push(p);
    else if (days <= 31) dueThisMonth.push(p);
  }
  return { dueToday, dueThisWeek, dueThisMonth, overdue };
}

export interface MoneyNeededInput {
  availableMoney: number;
  upcomingDays: number;
  emergencyReserve: number;
  recurringPayments: RecurringPayment[];
  loans: Loan[];
}

export interface MoneyNeededResult {
  upcomingPaymentsTotal: number;
  upcomingEmiTotal: number;
  emergencyReserve: number;
  totalRequired: number;
  availableMoney: number;
  shortage: number; // positive = shortage, 0 or negative = surplus
  isSufficient: boolean;
}

export function calculateMoneyNeeded(input: MoneyNeededInput): MoneyNeededResult {
  const { availableMoney, upcomingDays, emergencyReserve, recurringPayments, loans } = input;

  const upcomingPaymentsTotal = recurringPayments
    .filter((p) => p.status !== "Paid" && daysUntil(p.due_date) <= upcomingDays)
    .reduce((s, p) => s + Number(p.amount), 0);

  const upcomingEmiTotal = loans
    .filter(
      (l) =>
        l.status === "Active" &&
        l.next_payment_date &&
        daysUntil(l.next_payment_date) <= upcomingDays
    )
    .reduce((s, l) => s + Number(l.emi_amount), 0);

  const totalRequired = upcomingPaymentsTotal + upcomingEmiTotal + emergencyReserve;
  const shortage = totalRequired - availableMoney;

  return {
    upcomingPaymentsTotal,
    upcomingEmiTotal,
    emergencyReserve,
    totalRequired,
    availableMoney,
    shortage,
    isSufficient: shortage <= 0,
  };
}

export function savingsProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function loanProgressPercent(loan: Loan): number {
  if (loan.original_amount <= 0) return 0;
  const paid = loan.original_amount - loan.remaining_amount;
  return Math.min(100, Math.round((paid / loan.original_amount) * 100));
}
