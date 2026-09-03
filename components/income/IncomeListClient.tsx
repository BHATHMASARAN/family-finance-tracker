"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/format";
import { INCOME_TYPES, type Account, type Income, type Profile } from "@/lib/types";
import { getIncome, deleteIncome, type IncomeFilters } from "@/lib/actions/income";
import { useToast } from "@/hooks/useToast";
import { Pencil, Trash2, Wallet } from "lucide-react";

export function IncomeListClient({ accounts, members }: { accounts: Account[]; members: Profile[] }) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IncomeFilters>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (f: IncomeFilters) => {
    setLoading(true);
    try {
      setRows((await getIncome(f)) as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.amount), 0), [rows]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteIncome(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else {
      showToast("Income deleted");
      load(filters);
    }
  };

  const memberName = (id: string) => members.find((m) => m.id === id)?.full_name ?? "—";
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.account_name ?? "—";

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select
            value={filters.userId ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value || undefined }))}
          >
            <option value="">All Members</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </Select>
          <Select
            value={filters.accountId ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, accountId: e.target.value || undefined }))}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_name}</option>)}
          </Select>
        </div>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">{rows.length} income records</p>
        <p className="text-sm font-bold text-brand-600">Total: {formatCurrency(total)}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState icon={Wallet} title="No income recorded yet" />
      ) : (
        <Card className="divide-y divide-slate-100 p-0 dark:divide-slate-800">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{r.income_type}</p>
                  <span className="text-xs text-slate-400">· {accountName(r.account_id)}</span>
                </div>
                {r.description && <p className="truncate text-sm text-slate-500">{r.description}</p>}
                <p className="text-xs text-slate-400">{memberName(r.user_id)} · {formatDate(r.income_date)}</p>
              </div>
              <p className="shrink-0 font-bold text-brand-600">+{formatCurrency(r.amount)}</p>
              <div className="flex shrink-0 gap-1">
                <Link href={`/income/${r.id}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Pencil size={16} />
                </Link>
                <button onClick={() => setDeleteId(r.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
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
        message="This will permanently delete the income record and reverse the amount from its account."
        loading={deleting}
      />
    </div>
  );
}
