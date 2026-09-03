"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ACCOUNT_TYPES, type Account, type Profile } from "@/lib/types";
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import { validateRequired } from "@/lib/validation";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export function AccountForm({ members, account }: { members: Profile[]; account?: Account }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { profile } = useAuth();

  const [name, setName] = useState(account?.account_name ?? "");
  const [type, setType] = useState<string>(account?.account_type ?? ACCOUNT_TYPES[0]);
  const [ownerId, setOwnerId] = useState(account?.owner_id ?? profile?.id ?? "");
  const [balance, setBalance] = useState(account?.opening_balance?.toString() ?? "0");
  const [notes, setNotes] = useState(account?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateRequired(name, "Account name");
    if (err) {
      setErrors({ name: err });
      return;
    }
    if (!profile) return;
    setLoading(true);

    const result = account
      ? await updateAccount(account.id, { account_name: name, account_type: type as any, owner_id: ownerId || null, notes })
      : await createAccount({
          family_id: profile.family_id,
          owner_id: ownerId || null,
          account_name: name,
          account_type: type as any,
          opening_balance: Number(balance) || 0,
          notes,
        });

    setLoading(false);
    if (result?.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(account ? "Account updated" : "Account created");
    router.push("/accounts");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Account Name" placeholder="e.g. HDFC Savings" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Select label="Account Type" value={type} onChange={(e) => setType(e.target.value)}>
        {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>
      <Select label="Owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
        {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
      </Select>
      {!account && (
        <Input label="Opening Balance (₹)" type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
      )}
      <Textarea label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>{account ? "Save Changes" : "Create Account"}</Button>
      </div>
    </form>
  );
}
