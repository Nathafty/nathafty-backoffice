import { PageHeader } from "@/components/admin/page-header";
import { ExpensesView } from "@/components/admin/expenses/expenses-view";
import { expenseOptions, listExpenses } from "@/core/actions/admin/expenses";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [{ items, total, tableMissing }, options] = await Promise.all([
    listExpenses(),
    expenseOptions(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Dépenses" description="Suivi des dépenses de l'entreprise (carburant, salaires, maintenance…)." />
      <ExpensesView items={items} total={total} options={options} tableMissing={tableMissing} />
    </div>
  );
}
