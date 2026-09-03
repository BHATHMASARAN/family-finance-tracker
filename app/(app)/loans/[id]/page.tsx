import { LoanDetailClient } from "@/components/loans/LoanDetailClient";
import { getLoan, getLoanPayments } from "@/lib/actions/loans";
import { getAccounts } from "@/lib/actions/accounts";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoanDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  const [loan, payments, accounts] = await Promise.all([
    getLoan(params.id).catch(() => null),
    getLoanPayments(params.id),
    getAccounts(),
  ]);

  if (!loan) notFound();

  return (
    <LoanDetailClient
      loan={loan as any}
      payments={payments as any}
      accounts={accounts as any}
      familyId={profile!.family_id}
    />
  );
}
