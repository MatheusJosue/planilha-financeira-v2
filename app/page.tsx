'use client';

import { Row, Col } from 'react-bootstrap';
import { FiPlus, FiArrowUpRight } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { DashboardForecast } from '@/components/DashboardForecast';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpensesByCategoryChart, IncomeVsExpenseChart } from '@/components/Charts';
import { GoalsOverview } from '@/components/Goals/GoalsOverview';
import { BudgetOverview } from '@/components/Budget/BudgetOverview';
import { RecurringNecessitySummary } from '@/components/RecurringNecessitySummary';
import { RecentTransactions } from '@/components/RecentTransactions';
import { FloatingActionButton } from '@/components/ui/GlassButton';
import { useFinanceStore } from '@/store/financeStore';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useState } from 'react';
import { TransactionForm } from '@/components/TransactionForm';
import { GlassButton } from '@/components/ui/GlassButton';

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
    <PageLayout className="dashboard-page">
      <section className="dashboard-hero mb-4">
        <div className="dashboard-hero-copy">
          <span className="dashboard-kicker">Seu panorama financeiro</span>
          <h1>Visão geral</h1>
          <p>Acompanhe o mês, antecipe compromissos e tome decisões com clareza.</p>
        </div>
        <div className="dashboard-hero-actions">
          <div className="dashboard-month-selector">
            <MonthSelector />
          </div>
          <GlassButton
            variant="primary"
            icon={<FiPlus size={18} />}
            onClick={() => setShowTransactionForm(true)}
          >
            Nova transação
          </GlassButton>
        </div>
        <div className="dashboard-hero-orb dashboard-hero-orb-one" />
        <div className="dashboard-hero-orb dashboard-hero-orb-two" />
      </section>

      <SummaryCards />

      <div className="dashboard-section-heading">
        <div>
          <span>Análise</span>
          <h2>Movimento e projeção</h2>
        </div>
        <FiArrowUpRight />
      </div>

      <Row className="g-3 g-xxl-4 mb-5 dashboard-card-grid">
        <Col xs={12} md={6} xl={4}>
          <IncomeVsExpenseChart />
        </Col>
        <Col xs={12} md={6} xl={4}>
          <DashboardForecast />
        </Col>
        <Col xs={12} md={6} xl={4}>
          <ExpensesByCategoryChart />
        </Col>
      </Row>

      <div className="dashboard-section-heading">
        <div>
          <span>Planejamento</span>
          <h2>Transforme planos em progresso</h2>
        </div>
      </div>

      <Row className="g-3 g-xxl-4 mb-4 dashboard-card-grid">
        <Col xs={12} md={6} xl={4}>
          <RecurringNecessitySummary />
        </Col>
        <Col xs={12} md={6} xl={4}>
          <GoalsOverview />
        </Col>
        <Col xs={12} md={6} xl={4}>
          <BudgetOverview />
        </Col>
      </Row>

      <RecentTransactions onAdd={() => setShowTransactionForm(true)} />

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
