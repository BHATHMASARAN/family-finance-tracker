import { AccountForm } from "@/components/accounts/AccountForm";
import { getFamilyMembers } from "@/lib/actions/family";

export const dynamic = "force-dynamic";

export default async function NewAccountPage() {
  const members = await getFamilyMembers();
  return <AccountForm members={members as any} />;
}
