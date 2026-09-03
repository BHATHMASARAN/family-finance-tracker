"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/format";
import { EXPENSE_CATEGORIES, type Account, type Expense, type Profile } from "@/lib/types";
import { getExpenses, deleteExpense, type ExpenseFilters } from "@/lib/actions/expenses";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2, Receipt, Search } from "lucide-react";

export function ExpenseListClient({ accounts, members }: { accounts: Account[]; members: Profile[] }) {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (f: ExpenseFilters) => {
    setLoading(true);
    try {
      const data = await getExpenses(f);
      setExpenses(data as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = () => setFilters((f) => ({ ...f, search: search || undefined }));

  const total = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteExpense(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else {
      showToast("Expense deleted");
      load(filters);
    }
  };

  const memberName = (id: string) => members.find((m) => m.id === id)?.full_name ?? "—";
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.account_name ?? "—";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="col-span-2 flex gap-2 md:col-span-1">
            <Input
              placeholder="Search description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="secondary" onClick={handleSearch} aria-label="Search">
              <Search size={18} />
            </Button>
          </div>
          <Select
            value={filters.category ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select
            value={filters.userId ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value || undefined }))}
          >
            <option value="">All Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </Select>
          <Select
            value={filters.accountId ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, accountId: e.target.value || undefined }))}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.account_name}</option>
            ))}
          </Select>
          <Input
            type="date"
            value={filters.from ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
          />
          <Input
            type="date"
            value={filters.to ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">{expenses.length} expenses</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Total: {formatCurrency(total)}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : expenses.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses found" description="Try adjusting your filters" />
      ) : (
        <Card className="divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{e.category}</p>
                  <span className="text-xs text-slate-400">· {accountName(e.account_id)}</span>
                </div>
                {e.description && <p className="truncate text-sm text-slate-500">{e.description}</p>}
                <p className="text-xs text-slate-400">
                  {memberName(e.user_id)} · {formatDate(e.expense_date)}
                </p>
              </div>
              <p className="shrink-0 font-bold text-red-600">-{formatCurrency(e.amount)}</p>
              <div className="flex shrink-0 gap-1">
                <Link
                  href={`/expenses/${e.id}/edit`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => setDeleteId(e.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This will permanently delete the expense and restore the amount to its account. This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
