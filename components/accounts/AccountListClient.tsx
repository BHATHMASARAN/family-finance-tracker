"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import type { Account, Profile } from "@/lib/types";
import { deleteAccount, updateAccount } from "@/lib/actions/accounts";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Wallet, WalletCards, Landmark, Smartphone, PiggyBank, Plus } from "lucide-react";

const icons: Record<string, any> = {
  Cash: Wallet, Bank: Landmark, Savings: PiggyBank, UPI: Smartphone, Wallet: WalletCards, Other: WalletCards,
};

export function AccountListClient({ accounts, members }: { accounts: Account[]; members: Profile[] }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const total = accounts.filter((a) => a.is_active).reduce((s, a) => s + Number(a.current_balance), 0);
  const ownerName = (id: string | null) => members.find((m) => m.id === id)?.full_name ?? "Unassigned";

  const toggleActive = async (a: Account) => {
    const result = await updateAccount(a.id, { is_active: !a.is_active });
    if (result?.error) showToast(result.error, "error");
    else {
      showToast(a.is_active ? "Account deactivated" : "Account activated");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteAccount(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (result?.error) showToast(result.error, "error");
    else {
      showToast("Account deleted");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-brand-600 text-white">
        <p className="text-sm font-medium text-brand-100">Total Available Money</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(total)}</p>
        <p className="mt-1 text-xs text-brand-100">Across {accounts.filter((a) => a.is_active).length} active accounts</p>
      </Card>

      <div className="flex justify-end">
        <Link href="/accounts/new"><Button><Plus size={18} /> Add Account</Button></Link>
      </div>

      {accounts.length === 0 ? (
        <EmptyState icon={WalletCards} title="No accounts yet" description="Add your first bank, cash, or UPI account" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const Icon = icons[a.account_type] ?? WalletCards;
            return (
              <Card key={a.id} className={!a.is_active ? "opacity-50" : ""}>
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
                    <Icon size={20} />
                  </span>
                  <div className="flex gap-1">
                    <Link href={`/accounts/${a.id}/edit`} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => setDeleteId(a.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 font-semibold text-slate-800 dark:text-slate-100">{a.account_name}</p>
                <p className="text-xs text-slate-400">{ownerName(a.owner_id)}</p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(a.current_balance)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone="neutral">{a.account_type}</Badge>
                  <button onClick={() => toggleActive(a)} className="text-xs font-medium text-brand-600">
                    {a.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Deleting an account is only possible if it has no linked transactions. Consider deactivating it instead."
        loading={deleting}
      />
    </div>
  );
}
