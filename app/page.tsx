'use client';

import { Row, Col } from 'react-bootstrap';
import { FiPlus } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpensesByCategoryChart, IncomeVsExpenseChart } from '@/components/Charts';
import { GoalsOverview } from '@/components/Goals/GoalsOverview';
import { BudgetOverview } from '@/components/Budget/BudgetOverview';
import { RecentTransactions } from '@/components/RecentTransactions';
import { FloatingActionButton } from '@/components/ui/GlassButton';
import { useFinanceStore } from '@/store/financeStore';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useState } from 'react';
import { TransactionForm } from '@/components/TransactionForm';

export default function DashboardPage() {
  const { isLoaded } = useFinanceStore();
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  if (!isLoaded) {
    return (
      <PageLayout>
        <DashboardSkeleton />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Month Selector */}
      <MonthSelector />

      {/* Summary Cards */}
      <SummaryCards />

      {/* Goals and Budget Overview */}
      <Row className="g-4 mb-4">
        <Col xs={12} lg={6}>
          <GoalsOverview />
        </Col>
        <Col xs={12} lg={6}>
          <BudgetOverview />
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col xs={12} lg={6}>
          <ExpensesByCategoryChart />
        </Col>
        <Col xs={12} lg={6}>
          <IncomeVsExpenseChart />
        </Col>
      </Row>

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Floating Add Button */}
      <FloatingActionButton
        icon={<FiPlus size={24} />}
        onClick={() => setShowTransactionForm(true)}
        title="Nova Transação"
      />

      {/* Transaction Form Modal */}
      <TransactionForm
        show={showTransactionForm}
        onHide={() => setShowTransactionForm(false)}
      />
    </PageLayout>
  );
}
