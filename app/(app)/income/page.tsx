import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IncomeListClient } from "@/components/income/IncomeListClient";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const [accounts, members] = await Promise.all([getAccounts(), getFamilyMembers()]);
  return (
    <div className="flex flex-col gap-4">
      <div className="hidden items-center justify-end md:flex">
        <Link href="/income/new"><Button><Plus size={18} /> Add Income</Button></Link>
      </div>
      <IncomeListClient accounts={accounts as any} members={members as any} />
    </div>
  );
}
