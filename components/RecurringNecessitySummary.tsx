'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiRepeat } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { ChartCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { GlassButton } from '@/components/ui/GlassButton';
import { formatCurrency } from '@/utils/formatCurrency';
import { CATEGORY_EMOJIS } from '@/types';

export function RecurringNecessitySummary() {
  const { recurringTransactions } = useFinanceStore();

  const stats = useMemo(() => {
    const activeExpenses = recurringTransactions.filter(
      (r) => r.type === 'expense' && r.is_active
    );
    const essential = activeExpenses.filter((r) => r.is_essential);
    const nonEssential = activeExpenses.filter((r) => !r.is_essential);

    const essentialTotal = essential.reduce((sum, r) => sum + r.value, 0);
    const nonEssentialTotal = nonEssential.reduce((sum, r) => sum + r.value, 0);
    const total = essentialTotal + nonEssentialTotal;

    const topNonEssential = [...nonEssential].sort((a, b) => b.value - a.value).slice(0, 5);

    return {
      essentialCount: essential.length,
      nonEssentialCount: nonEssential.length,
      essentialTotal,
      nonEssentialTotal,
      total,
      topNonEssential,
    };
  }, [recurringTransactions]);

  if (stats.essentialCount === 0 && stats.nonEssentialCount === 0) {
    return (
      <ChartCard
        title="Contas Recorrentes"
        icon={<FiRepeat />}
        action={
          <Link href="/recorrentes">
            <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={16} />} iconPosition="right">
              Gerenciar
            </GlassButton>
          </Link>
        }
      >
        <p className="text-center py-4 mb-0" style={{ color: 'var(--text-muted)' }}>
          Nenhuma conta recorrente ativa cadastrada.
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Contas Recorrentes"
      icon={<FiRepeat />}
      description={`${stats.essentialCount} essenciais • ${stats.nonEssentialCount} supérfluas`}
      action={
        <Link href="/recorrentes">
          <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={16} />} iconPosition="right">
            Gerenciar
          </GlassButton>
        </Link>
      }
    >
      <div className="d-flex flex-column gap-3 mb-3">
        <div>
          <div className="d-flex justify-content-between mb-1">
            <small style={{ color: 'var(--text-secondary)' }}>Essenciais</small>
            <small style={{ color: 'var(--text-muted)' }}>{formatCurrency(stats.essentialTotal)}</small>
          </div>
          <ProgressBar value={stats.essentialTotal} max={stats.total || 1} variant="success" size="sm" />
        </div>
        <div>
          <div className="d-flex justify-content-between mb-1">
            <small style={{ color: 'var(--text-secondary)' }}>Supérfluas</small>
            <small style={{ color: 'var(--text-muted)' }}>{formatCurrency(stats.nonEssentialTotal)}</small>
          </div>
          <ProgressBar value={stats.nonEssentialTotal} max={stats.total || 1} variant="warning" size="sm" />
        </div>
      </div>

      {stats.topNonEssential.length === 0 ? (
        <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
          Nenhuma conta marcada como supérflua. 🎉
        </p>
      ) : (
        <div className="d-flex flex-column gap-2">
          <small style={{ color: 'var(--text-hint)' }}>Candidatas a cortar</small>
          {stats.topNonEssential.map((r) => (
            <div key={r.id} className="d-flex align-items-center justify-content-between">
              <span className="d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                {CATEGORY_EMOJIS[r.category] || '📦'} {r.description}
                <Badge variant="warning" size="sm" pill>
                  Supérfluo
                </Badge>
              </span>
              <span style={{ color: 'var(--expense-color)' }}>{formatCurrency(r.value)}</span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}

export default RecurringNecessitySummary;
