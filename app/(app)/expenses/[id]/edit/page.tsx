import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [accounts, members, { data: expense }] = await Promise.all([
    getAccounts(),
    getFamilyMembers(),
    supabase.from("expenses").select("*").eq("id", params.id).single(),
  ]);

  if (!expense) notFound();

  return <ExpenseForm accounts={accounts as any} members={members as any} expense={expense as any} />;
}
