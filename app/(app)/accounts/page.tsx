import { AccountListClient } from "@/components/accounts/AccountListClient";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const [accounts, members] = await Promise.all([getAccounts(), getFamilyMembers()]);
  return <AccountListClient accounts={accounts as any} members={members as any} />;
}
