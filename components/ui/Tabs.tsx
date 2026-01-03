'use client';

import { ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
}

interface GlassTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

export function GlassTabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
}: GlassTabsProps) {
  const baseClasses = 'flex gap-1 p-1 rounded-xl overflow-x-auto';

  const variantContainerClasses = {
    default: 'glass-card-static',
    pills: '',
    underline: 'border-b border-[var(--glass-border)]',
  };

  const getTabClasses = (isActive: boolean) => {
    const baseTabClasses = 'px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium transition-all duration-250 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0';

    if (variant === 'default') {
      return `${baseTabClasses} rounded-lg ${
        isActive
          ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'
      }`;
    }

    if (variant === 'pills') {
      return `${baseTabClasses} rounded-full ${
        isActive
          ? 'bg-[var(--glass-bg-strong)] text-[var(--text-primary)] border border-[var(--glass-border)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`;
    }

    if (variant === 'underline') {
      return `${baseTabClasses} border-b-2 -mb-px ${
        isActive
          ? 'border-[#667eea] text-[var(--text-primary)]'
          : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border)]'
      }`;
    }

    return baseTabClasses;
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantContainerClasses[variant]}
        ${fullWidth ? 'w-full' : 'inline-flex'}
        hide-scrollbar
        ${className}
      `}
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            ${getTabClasses(activeTab === tab.id)}
            ${fullWidth ? 'flex-1 justify-center' : ''}
          `}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span
              className={`
                px-1.5 py-0.5 text-xs rounded-full
                ${activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--text-muted)]'
                }
              `}
            >
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Tab Panels Component
interface TabPanelProps {
  children: ReactNode;
  value: string;
  activeValue: string;
  className?: string;
}

export function TabPanel({
  children,
  value,
  activeValue,
  className = '',
}: TabPanelProps) {
  if (value !== activeValue) return null;

  return (
    <div
      className={`animate-fadeIn ${className}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

// Controlled Tabs with Panels
interface TabsWithPanelsProps {
  tabs: Array<Tab & { content: ReactNode }>;
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
  panelClassName?: string;
}

export function TabsWithPanels({
  tabs,
  defaultTab,
  variant = 'default',
  fullWidth = false,
  className = '',
  panelClassName = '',
}: TabsWithPanelsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  return (
    <div className={className}>
      <GlassTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant={variant}
        fullWidth={fullWidth}
        className="mb-4"
      />
      {tabs.map((tab) => (
        <TabPanel
          key={tab.id}
          value={tab.id}
          activeValue={activeTab}
          className={panelClassName}
        >
          {tab.content}
        </TabPanel>
      ))}
    </div>
  );
}

export default GlassTabs;
