"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { updateMemberRole } from "@/lib/actions/family";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { Shield, User } from "lucide-react";

export function FamilyClient({ members }: { members: Profile[] }) {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const isAdmin = profile?.role === "admin";

  const toggleRole = async (m: Profile) => {
    if (!isAdmin || m.id === profile?.id) return;
    setBusyId(m.id);
    const result = await updateMemberRole(m.id, m.role === "admin" ? "member" : "admin");
    setBusyId(null);
    if (result?.error) showToast(result.error, "error");
    else { showToast("Role updated"); router.refresh(); }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-brand-600 text-white">
        <p className="text-sm font-medium text-brand-100">Family Members</p>
        <p className="mt-1 text-3xl font-bold">{members.length}</p>
        <p className="mt-1 text-xs text-brand-100">Private access — no public sign-up</p>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {members.map((m) => (
          <Card key={m.id} className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {m.full_name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{m.full_name}</p>
              <p className="truncate text-xs text-slate-400">{m.email}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge tone={m.role === "admin" ? "success" : "neutral"}>
                {m.role === "admin" ? <Shield size={12} className="mr-1 inline" /> : <User size={12} className="mr-1 inline" />}
                {m.role}
              </Badge>
              {isAdmin && m.id !== profile?.id && (
                <Button size="sm" variant="ghost" onClick={() => toggleRole(m)} loading={busyId === m.id}>
                  Make {m.role === "admin" ? "Member" : "Admin"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          New family members are added by an admin directly in Supabase (Authentication → Users), then linked
          via a <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">profiles</code> row.
          There is intentionally no public registration page.
        </p>
      </Card>
    </div>
  );
}
