"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/format";
import { expensesByCategory, expensesByMember, totalOriginalDebt, totalPaidDebt, totalDebt, budgetProgress } from "@/lib/calculations";
import type { Account, Budget, Expense, Income, Loan, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";

const COLORS = ["#158f5c", "#e5484d", "#f5a524", "#6366f1", "#0ea5e9", "#ec4899", "#84cc16", "#a855f7", "#f97316", "#14b8a6"];

type RangeKey = "week" | "month" | "lastMonth" | "year" | "custom";

function getRange(key: RangeKey, from?: string, to?: string): { from: string; to: string } {
  const now = new Date();
  if (key === "custom" && from && to) return { from, to };
  if (key === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { from: start.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
  }
  if (key === "month") {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
    };
  }
  if (key === "lastMonth") {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10),
      to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10),
    };
  }
  // year
  return {
    from: new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10),
  };
}

export function ReportsClient({ members, loans, budgets }: { members: Profile[]; loans: Loan[]; budgets: Budget[] }) {
  const supabase = createClient();
  const [rangeKey, setRangeKey] = useState<RangeKey>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => getRange(rangeKey, customFrom, customTo), [rangeKey, customFrom, customTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("expenses").select("*").gte("expense_date", range.from).lte("expense_date", range.to),
      supabase.from("income").select("*").gte("income_date", range.from).lte("income_date", range.to),
    ]).then(([e, i]) => {
      if (cancelled) return;
      setExpenses((e.data ?? []) as any);
      setIncome((i.data ?? []) as any);
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const categoryData = expensesByCategory(expenses);
  const memberData = expensesByMember(expenses).map((m) => ({
    name: members.find((p) => p.id === m.userId)?.full_name.split(" ")[0] ?? "Unknown",
    spent: m.spent,
  }));
  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0);

  // Monthly trend within selected range, grouped by day-of-month bucket -> month
  const trendMap = new Map<string, number>();
  for (const e of expenses) {
    const key = new Date(e.expense_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    trendMap.set(key, (trendMap.get(key) ?? 0) + Number(e.amount));
  }
  const trendData = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }));

  const budgetItems = budgetProgress(budgets, expenses);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={rangeKey} onChange={(e) => setRangeKey(e.target.value as RangeKey)} className="max-w-[180px]">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </Select>
          {rangeKey === "custom" && (
            <>
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="max-w-[160px]" />
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="max-w-[160px]" />
            </>
          )}
        </div>
      </Card>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs font-medium text-slate-400">Income</p>
              <p className="mt-1 text-xl font-bold text-brand-600">{formatCurrency(totalIncome)}</p>
            </Card>
            <Card>
              <p className="text-xs font-medium text-slate-400">Expenses</p>
              <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Expense by Category</CardTitle></CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="spent" nameKey="category" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Monthly Expense Trend</CardTitle></CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} width={40} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="amount" stroke="#e5484d" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Member-wise Spending</CardTitle></CardHeader>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} width={40} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="spent" fill="#158f5c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Debt Progress</CardTitle></CardHeader>
              <div className="flex flex-col gap-3">
                <Row label="Original Debt" value={totalOriginalDebt(loans)} />
                <Row label="Paid Debt" value={totalPaidDebt(loans)} tone="text-brand-600" />
                <Row label="Remaining Debt" value={totalDebt(loans)} tone="text-amber-600" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Budget Analysis</CardTitle></CardHeader>
            <div className="flex flex-col gap-3">
              {budgetItems.length === 0 ? (
                <p className="text-sm text-slate-400">No budgets set for the current month.</p>
              ) : (
                budgetItems.map((b) => (
                  <div key={b.category} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{b.category}</span>
                    <span className="text-slate-400">
                      {formatCurrency(b.spent)} / {formatCurrency(b.budget)} ({formatCurrency(b.remaining)} left)
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`font-bold ${tone ?? "text-slate-800 dark:text-slate-100"}`}>{formatCurrency(value)}</span>
    </div>
  );
}
