import { FamilyClient } from "@/components/family/FamilyClient";
import { getFamilyMembers } from "@/lib/actions/family";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const members = await getFamilyMembers();
  return <FamilyClient members={members as any} />;
}
