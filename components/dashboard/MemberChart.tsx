"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function MemberChart({ data }: { data: { name: string; spent: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member-wise Expenses</CardTitle>
      </CardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="spent" fill="#158f5c" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
