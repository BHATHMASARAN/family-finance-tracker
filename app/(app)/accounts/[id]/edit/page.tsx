import { AccountForm } from "@/components/accounts/AccountForm";
import { getFamilyMembers } from "@/lib/actions/family";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditAccountPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [members, { data: account }] = await Promise.all([
    getFamilyMembers(),
    supabase.from("accounts").select("*").eq("id", params.id).single(),
  ]);
  if (!account) notFound();
  return <AccountForm members={members as any} account={account as any} />;
}
