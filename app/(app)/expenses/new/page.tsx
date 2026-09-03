import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";

export const dynamic = "force-dynamic";

export default async function NewExpensePage() {
  const [accounts, members] = await Promise.all([getAccounts(), getFamilyMembers()]);
  return <ExpenseForm accounts={accounts as any} members={members as any} />;
}
