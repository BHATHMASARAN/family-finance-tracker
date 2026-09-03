import { LoanListClient } from "@/components/loans/LoanListClient";
import { getLoans } from "@/lib/actions/loans";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const loans = await getLoans();
  return <LoanListClient loans={loans as any} />;
}
