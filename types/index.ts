// ============================================
// PLANILHA FINANCEIRA V2 - TYPE DEFINITIONS
// ============================================

// === Transaction Types ===

export type TransactionType = 'income' | 'expense';

export type RecurrenceType = 'fixed' | 'installment' | 'variable' | 'variable_by_income';

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  type: TransactionType;
  category: string;
  value: number;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  recurring_id?: string;
  is_paid?: boolean;
  is_predicted?: boolean;
  current_installment?: number;
  total_installments?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  type: TransactionType;
  category: string;
  value: number;
  recurrence_type: RecurrenceType;
  start_date: string;
  end_date?: string;
  day_of_month: number;
  total_installments?: number;
  current_installment?: number;
  is_active: boolean;
  selected_income_id?: string;
  created_at?: string;
}

// === Category Types ===

export interface Category {
  id?: string;
  user_id: string;
  name: string;
  max_percentage?: number | null;
  max_value?: number | null;
  created_at?: string;
}

export interface CategoryLimit {
  maxPercentage?: number;
  maxValue?: number;
}

// === Goal Types (NEW) ===

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_value: number;
  current_value: number;
  deadline?: string;
  category?: string;
  color: string;
  icon: string;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export type GoalIcon =
  | 'target'
  | 'home'
  | 'car'
  | 'plane'
  | 'graduation'
  | 'heart'
  | 'gift'
  | 'piggy'
  | 'wallet'
  | 'chart'
  | 'star'
  | 'trophy';

// === Budget Types (NEW) ===

export interface CategoryBudget {
  id: string;
  user_id: string;
  category: string;
  month: string;
  budget_value: number;
  alert_threshold: number; // percentage (e.g., 80 for 80%)
  created_at?: string;
}

export interface BudgetStatus {
  category: string;
  budgetValue: number;
  spentValue: number;
  remainingValue: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

// === Dashboard Types (NEW) ===

export type WidgetType =
  | 'summary_cards'
  | 'balance_chart'
  | 'expenses_by_category'
  | 'income_vs_expense'
  | 'recurring_vs_variable'
  | 'future_projection'
  | 'financial_stats'
  | 'goals_overview'
  | 'budget_overview'
  | 'recent_transactions';

export interface DashboardWidget {
  id: string;
  user_id: string;
  widget_type: WidgetType;
  position: number;
  is_visible: boolean;
  config: Record<string, unknown>;
  created_at?: string;
}

export interface DashboardConfig {
  balance: boolean;
  monthlyIncome: boolean;
  monthlyExpense: boolean;
  periodCards: boolean;
  charts: boolean;
  recentTransactions: boolean;
  expensesByCategory: boolean;
  incomeVsExpense: boolean;
  recurringVsVariable: boolean;
  futureProjection: boolean;
  financialStats: boolean;
  goalsOverview: boolean;
  budgetOverview: boolean;
}

// === User Settings Types ===

export interface UserSettings {
  user_id: string;
  period_separation_enabled: boolean;
  period_1_end: number;
  period_2_start: number;
  dashboard_config: DashboardConfig;
  created_at?: string;
  updated_at?: string;
}

// === Store Types ===

export interface MonthData {
  transactions: Transaction[];
}

export interface FinanceData {
  transactions: Transaction[];
  categories: string[];
  categoryLimits: Record<string, CategoryLimit>;
  hiddenDefaultCategories: string[];
}

export interface FinanceStore extends FinanceData {
  // State
  isLoaded: boolean;
  currentMonth: string;
  monthsData: Record<string, MonthData>;
  recurringTransactions: RecurringTransaction[];
  excludedPredictedIds: string[];
  showMonthPicker: boolean;
  goals: FinancialGoal[];
  categoryBudgets: CategoryBudget[];
  dashboardWidgets: DashboardWidget[];
  userSettings: UserSettings | null;

  // Transaction Actions
  loadFromSupabase: (monthsToLoad?: number) => Promise<void>;
  setCurrentMonth: (month: string) => Promise<void>;
  createNewMonth: (month: string, copyFromPrevious?: boolean) => Promise<void>;
  getAvailableMonths: () => string[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'month'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string, isPredicted?: boolean) => Promise<void>;
  togglePaymentStatus: (id: string) => Promise<void>;
  convertPredictedToReal: (predictedId: string, updates?: Partial<Transaction>) => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;

  // Recurring Transaction Actions
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  loadRecurringTransactions: () => Promise<void>;
  generatePredictedTransactions: (monthsAhead?: number) => Transaction[];

  // Category Actions
  addCategory: (name: string, limits?: CategoryLimit) => Promise<void>;
  updateCategoryLimits: (category: string, limits: CategoryLimit) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  hideDefaultCategory: (name: string) => Promise<void>;
  showDefaultCategory: (name: string) => Promise<void>;

  // Goal Actions (NEW)
  loadGoals: () => Promise<void>;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addToGoal: (id: string, amount: number) => Promise<void>;

  // Budget Actions (NEW)
  loadBudgets: (month?: string) => Promise<void>;
  setBudget: (category: string, month: string, budgetValue: number, alertThreshold?: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetStatus: (category: string, month: string) => BudgetStatus | null;
  getAllBudgetStatuses: (month: string) => BudgetStatus[];

  // Dashboard Actions (NEW)
  loadDashboardWidgets: () => Promise<void>;
  updateWidgetPosition: (widgetId: string, newPosition: number) => Promise<void>;
  toggleWidgetVisibility: (widgetId: string) => Promise<void>;
  updateWidgetConfig: (widgetId: string, config: Record<string, unknown>) => Promise<void>;
  resetDashboardLayout: () => Promise<void>;

  // Settings Actions
  loadUserSettings: () => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // UI Actions
  toggleShowMonthPicker: () => void;

  // Data Actions
  importData: (data: { transactions?: Transaction[]; categories?: string[] }) => Promise<void>;
  clearAllData: () => Promise<void>;
}

// === Default Categories ===

export const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Contas',
  'Compras',
  'Assinaturas',
  'Imprevistos',
  'Investimentos',
  'Renda Extra',
  'Salário',
  'Outros',
] as const;

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];

// === Category Emojis ===

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Alimentação': '🍔',
  'Transporte': '🚗',
  'Moradia': '🏠',
  'Lazer': '🎬',
  'Saúde': '🏥',
  'Educação': '📚',
  'Contas': '📄',
  'Compras': '🛒',
  'Assinaturas': '📱',
  'Imprevistos': '⚠️',
  'Investimentos': '💰',
  'Renda Extra': '💵',
  'Salário': '💼',
  'Outros': '📦',
};

// === Goal Icons ===

export const GOAL_ICONS: Record<GoalIcon, string> = {
  'target': '🎯',
  'home': '🏠',
  'car': '🚗',
  'plane': '✈️',
  'graduation': '🎓',
  'heart': '❤️',
  'gift': '🎁',
  'piggy': '🐷',
  'wallet': '👛',
  'chart': '📈',
  'star': '⭐',
  'trophy': '🏆',
};

// === Goal Colors ===

export const GOAL_COLORS = [
  '#667eea', // Primary purple
  '#11998e', // Success green
  '#eb3349', // Danger red
  '#4facfe', // Info blue
  '#f5af19', // Gold
  '#f093fb', // Pink
  '#2193b0', // Ocean
  '#9d50bb', // Purple
] as const;

// === Supabase Database Types ===

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id'>>;
      };
      recurring_transactions: {
        Row: RecurringTransaction;
        Insert: Omit<RecurringTransaction, 'id' | 'created_at'>;
        Update: Partial<Omit<RecurringTransaction, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      hidden_categories: {
        Row: { id: string; user_id: string; category_name: string };
        Insert: { user_id: string; category_name: string };
        Update: { category_name?: string };
      };
      user_settings: {
        Row: UserSettings;
        Insert: UserSettings;
        Update: Partial<UserSettings>;
      };
      financial_goals: {
        Row: FinancialGoal;
        Insert: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FinancialGoal, 'id'>>;
      };
      category_budgets: {
        Row: CategoryBudget;
        Insert: Omit<CategoryBudget, 'id' | 'created_at'>;
        Update: Partial<Omit<CategoryBudget, 'id'>>;
      };
      dashboard_widgets: {
        Row: DashboardWidget;
        Insert: Omit<DashboardWidget, 'id' | 'created_at'>;
        Update: Partial<Omit<DashboardWidget, 'id'>>;
      };
    };
  };
}

// === Utility Types ===

export type TransactionFormData = {
  description: string;
  type: TransactionType;
  category: string;
  value: string;
  date: string;
  isRecurring: boolean;
  recurrence_type: RecurrenceType;
  day_of_month: string;
  total_installments: string;
  end_date: string;
  selected_income_id: string;
};

export type GoalFormData = {
  name: string;
  description: string;
  target_value: string;
  deadline: string;
  category: string;
  color: string;
  icon: GoalIcon;
};

export type BudgetFormData = {
  category: string;
  budget_value: string;
  alert_threshold: string;
};

// === Chart Data Types ===

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface IncomeExpenseChartData {
  month: string;
  Receitas: number;
  Despesas: number;
}

export interface BalanceChartData {
  month: string;
  balance: number;
}

export interface ProjectionChartData {
  month: string;
  saldoReal: number;
  saldoProjetado: number;
}

// === Period Types ===

export interface PeriodData {
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export interface MonthPeriods {
  period1: PeriodData;
  period2: PeriodData;
}

// === Stats Types ===

export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  averageIncome: number;
  averageExpense: number;
  highestIncome: Transaction | null;
  highestExpense: Transaction | null;
  topCategory: { name: string; value: number } | null;
  savingsRate: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

// === Filter Types ===

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  category: string;
  month: string;
  isPaid: boolean | 'all';
}

// === Sort Types ===

export type SortField = 'date' | 'value' | 'description' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
