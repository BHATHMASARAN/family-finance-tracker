import { PaymentsClient } from "@/components/payments/PaymentsClient";
import { getRecurringPayments } from "@/lib/actions/payments";
import { getAccounts } from "@/lib/actions/accounts";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const [payments, accounts] = await Promise.all([getRecurringPayments(), getAccounts()]);
  return <PaymentsClient payments={payments as any} accounts={accounts as any} />;
}
