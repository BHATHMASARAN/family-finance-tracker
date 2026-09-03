"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = ["#158f5c", "#e5484d", "#f5a524", "#6366f1", "#0ea5e9", "#ec4899", "#84cc16", "#a855f7", "#f97316", "#14b8a6"];

export function CategoryPieChart({ data }: { data: { category: string; spent: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense by Category</CardTitle>
      </CardHeader>
      {data.length === 0 ? (
        <EmptyState icon={PieIcon} title="No expenses yet" />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="spent" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
