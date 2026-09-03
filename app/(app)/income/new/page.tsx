import { IncomeForm } from "@/components/income/IncomeForm";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";

export const dynamic = "force-dynamic";

export default async function NewIncomePage() {
  const [accounts, members] = await Promise.all([getAccounts(), getFamilyMembers()]);
  return <IncomeForm accounts={accounts as any} members={members as any} />;
}
