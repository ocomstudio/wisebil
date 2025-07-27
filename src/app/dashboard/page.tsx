import ExpenseManager from "@/components/dashboard/expense-manager";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Dashboard</h1>
      <ExpenseManager />
    </div>
  );
}
