'use client';

import { ReactNode } from 'react';
import { GlassButton } from './GlassButton';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        py-12 px-6
        ${className}
      `}
    >
      {icon && (
        <div
          className="text-5xl mb-4 opacity-50"
          style={{ color: 'var(--text-muted)' }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm mb-6 max-w-md"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <GlassButton
          variant="primary"
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </GlassButton>
      )}
    </div>
  );
}

// Specific empty states
export function NoTransactionsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon="📊"
      title="Nenhuma transação encontrada"
      description="Comece adicionando sua primeira transação para acompanhar suas finanças."
      action={{
        label: 'Adicionar Transação',
        onClick: onAdd,
      }}
    />
  );
}

export function NoGoalsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon="🎯"
      title="Nenhuma meta definida"
      description="Defina metas financeiras para acompanhar seu progresso e alcançar seus objetivos."
      action={{
        label: 'Criar Meta',
        onClick: onAdd,
      }}
    />
  );
}

export function NoBudgetsEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon="💰"
      title="Nenhum orçamento definido"
      description="Defina limites de gastos por categoria para manter suas finanças sob controle."
      action={{
        label: 'Definir Orçamento',
        onClick: onAdd,
      }}
    />
  );
}

export function NoDataEmpty() {
  return (
    <EmptyState
      icon="📈"
      title="Sem dados suficientes"
      description="Adicione mais transações para visualizar gráficos e estatísticas."
    />
  );
}

export default EmptyState;
