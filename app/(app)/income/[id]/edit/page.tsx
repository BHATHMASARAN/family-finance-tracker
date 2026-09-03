import { IncomeForm } from "@/components/income/IncomeForm";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditIncomePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [accounts, members, { data: income }] = await Promise.all([
    getAccounts(),
    getFamilyMembers(),
    supabase.from("income").select("*").eq("id", params.id).single(),
  ]);
  if (!income) notFound();
  return <IncomeForm accounts={accounts as any} members={members as any} income={income as any} />;
}
