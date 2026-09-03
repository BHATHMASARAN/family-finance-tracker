import { SavingsClient } from "@/components/savings/SavingsClient";
import { getSavingsGoals } from "@/lib/actions/savings";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const goals = await getSavingsGoals();
  return <SavingsClient goals={goals as any} />;
}
