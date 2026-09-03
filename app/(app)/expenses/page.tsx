import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExpenseListClient } from "@/components/expenses/ExpenseListClient";
import { getAccounts } from "@/lib/actions/accounts";
import { getFamilyMembers } from "@/lib/actions/family";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [accounts, members] = await Promise.all([getAccounts(), getFamilyMembers()]);

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden items-center justify-end md:flex">
        <Link href="/expenses/new">
          <Button><Plus size={18} /> Add Expense</Button>
        </Link>
      </div>
      <ExpenseListClient accounts={accounts as any} members={members as any} />
    </div>
  );
}
