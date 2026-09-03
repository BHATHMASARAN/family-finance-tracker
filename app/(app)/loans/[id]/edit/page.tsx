import { LoanForm } from "@/components/loans/LoanForm";
import { getLoan } from "@/lib/actions/loans";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditLoanPage({ params }: { params: { id: string } }) {
  const loan = await getLoan(params.id).catch(() => null);
  if (!loan) notFound();
  return <LoanForm loan={loan as any} />;
}
