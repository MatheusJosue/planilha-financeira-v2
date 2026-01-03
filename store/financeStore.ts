import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabase-client';
import { showSuccessToast, showErrorToast } from '@/lib/sweetalert';
import type {
  FinanceStore,
  Transaction,
  RecurringTransaction,
  FinancialGoal,
  CategoryBudget,
  DashboardWidget,
  UserSettings,
  CategoryLimit,
  BudgetStatus,
  DEFAULT_CATEGORIES,
  DashboardConfig,
} from '@/types';

// Helper to get current month in YYYY-MM format
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Helper to load saved month from localStorage (SSR-safe)
const loadSavedMonth = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('currentMonth');
  } catch {
    return null;
  }
};

// Helper to save month to localStorage
const saveMonth = (month: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('currentMonth', month);
  } catch {
    // Ignore localStorage errors
  }
};

// Helper to load excluded predicted IDs
const loadExcludedPredictedIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('excludedPredictedIds');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Helper to save excluded predicted IDs
const saveExcludedPredictedIds = (ids: string[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('excludedPredictedIds', JSON.stringify(ids));
  } catch {
    // Ignore localStorage errors
  }
};

// Default dashboard config
const defaultDashboardConfig: DashboardConfig = {
  balance: true,
  monthlyIncome: true,
  monthlyExpense: true,
  periodCards: true,
  charts: true,
  recentTransactions: true,
  expensesByCategory: true,
  incomeVsExpense: true,
  recurringVsVariable: true,
  futureProjection: true,
  financialStats: true,
  goalsOverview: true,
  budgetOverview: true,
};

// Default categories
const DEFAULT_CATEGORIES_LIST = [
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
];

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  // Initial State
  isLoaded: false,
  currentMonth: getCurrentMonth(),
  transactions: [],
  categories: [...DEFAULT_CATEGORIES_LIST],
  categoryLimits: {},
  hiddenDefaultCategories: [],
  monthsData: {},
  recurringTransactions: [],
  excludedPredictedIds: [],
  showMonthPicker: false,
  goals: [],
  categoryBudgets: [],
  dashboardWidgets: [],
  userSettings: null,

  // ==========================================
  // DATA LOADING
  // ==========================================

  loadFromSupabase: async (monthsToLoad = 1) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      // Load saved month from localStorage
      const savedMonth = loadSavedMonth();
      const currentMonth = savedMonth || getCurrentMonth();

      // Calculate months to fetch
      const monthsToFetch: string[] = [currentMonth];
      if (monthsToLoad > 1) {
        const date = new Date(currentMonth + '-01');
        for (let i = 1; i < monthsToLoad; i++) {
          date.setMonth(date.getMonth() - 1);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthsToFetch.push(month);
        }
      }

      // Fetch transactions for the months
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('month', monthsToFetch)
        .order('date', { ascending: false }) as { data: Transaction[] | null; error: Error | null };

      if (transactionsError) throw transactionsError;

      // Fetch custom categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id) as { data: { name: string; max_percentage?: number; max_value?: number }[] | null; error: Error | null };

      if (categoriesError) throw categoriesError;

      // Fetch hidden categories
      const { data: hiddenData, error: hiddenError } = await supabase
        .from('hidden_categories')
        .select('*')
        .eq('user_id', user.id) as { data: { category_name: string }[] | null; error: Error | null };

      if (hiddenError) throw hiddenError;

      // Fetch recurring transactions
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true) as { data: RecurringTransaction[] | null; error: Error | null };

      if (recurringError) throw recurringError;

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: FinancialGoal[] | null; error: Error | null };

      if (goalsError) throw goalsError;

      // Fetch budgets for current month
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth) as { data: CategoryBudget[] | null; error: Error | null };

      if (budgetsError) throw budgetsError;

      // Fetch dashboard widgets
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true }) as { data: DashboardWidget[] | null; error: Error | null };

      if (widgetsError) throw widgetsError;

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: UserSettings | null; error: Error | null };

      // Settings might not exist yet, that's ok

      // Build months data
      const monthsData: Record<string, { transactions: Transaction[] }> = {};
      monthsToFetch.forEach((month) => {
        monthsData[month] = {
          transactions: (transactionsData || []).filter((t) => t.month === month),
        };
      });

      // Build custom categories list
      const customCategories = (categoriesData || []).map((c) => c.name);
      const hiddenCategories = (hiddenData || []).map((h) => h.category_name);
      const visibleDefaultCategories = DEFAULT_CATEGORIES_LIST.filter(
        (c) => !hiddenCategories.includes(c)
      );
      const allCategories = [...visibleDefaultCategories, ...customCategories];

      // Build category limits
      const categoryLimits: Record<string, CategoryLimit> = {};
      (categoriesData || []).forEach((c) => {
        if (c.max_percentage || c.max_value) {
          categoryLimits[c.name] = {
            maxPercentage: c.max_percentage ?? undefined,
            maxValue: c.max_value ?? undefined,
          };
        }
      });

      // Load excluded predicted IDs from localStorage
      const excludedPredictedIds = loadExcludedPredictedIds();

      // Update state
      set({
        isLoaded: true,
        currentMonth,
        transactions: monthsData[currentMonth]?.transactions || [],
        categories: allCategories,
        categoryLimits,
        hiddenDefaultCategories: hiddenCategories,
        monthsData,
        recurringTransactions: recurringData || [],
        excludedPredictedIds,
        goals: goalsData || [],
        categoryBudgets: budgetsData || [],
        dashboardWidgets: widgetsData || [],
        userSettings: settingsData || null,
      });

      // Generate predicted transactions
      const predicted = get().generatePredictedTransactions();
      const currentTransactions = monthsData[currentMonth]?.transactions || [];
      set({
        transactions: [...currentTransactions, ...predicted.filter((p) => p.month === currentMonth)],
      });
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      showErrorToast('Erro ao carregar dados');
    }
  },

  // ==========================================
  // MONTH MANAGEMENT
  // ==========================================

  setCurrentMonth: async (month: string) => {
    const { monthsData, recurringTransactions, excludedPredictedIds } = get();

    // Save to localStorage
    saveMonth(month);

    // Check if we have data for this month
    if (monthsData[month]) {
      const predicted = get().generatePredictedTransactions();
      set({
        currentMonth: month,
        transactions: [
          ...monthsData[month].transactions,
          ...predicted.filter((p) => p.month === month),
        ],
      });
    } else {
      // Fetch from database
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching month data:', error);
        return;
      }

      const newMonthsData = {
        ...monthsData,
        [month]: { transactions: data || [] },
      };

      const predicted = get().generatePredictedTransactions();

      set({
        currentMonth: month,
        monthsData: newMonthsData,
        transactions: [
          ...(data || []),
          ...predicted.filter((p) => p.month === month),
        ],
      });
    }
  },

  createNewMonth: async (month: string, copyFromPrevious = false) => {
    const { monthsData } = get();

    if (copyFromPrevious) {
      const previousDate = new Date(month + '-01');
      previousDate.setMonth(previousDate.getMonth() - 1);
      const previousMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;
      const previousTransactions = monthsData[previousMonth]?.transactions || [];

      // Copy non-predicted transactions
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const transactionsToInsert = previousTransactions
        .filter((t) => !t.is_predicted)
        .map((t) => ({
          ...t,
          id: undefined,
          month,
          date: t.date.replace(previousMonth, month),
          is_paid: false,
          created_at: undefined,
          updated_at: undefined,
        }));

      if (transactionsToInsert.length > 0) {
        const { error } = await supabase.from('transactions').insert(transactionsToInsert as any);
        if (error) {
          console.error('Error copying transactions:', error);
          showErrorToast('Erro ao copiar transações');
          return;
        }
      }
    }

    await get().setCurrentMonth(month);
  },

  getAvailableMonths: () => {
    const { monthsData, recurringTransactions } = get();
    const months = new Set(Object.keys(monthsData));

    // Add current month if not present
    months.add(getCurrentMonth());

    // Add months from recurring transactions
    recurringTransactions.forEach((rt) => {
      const startDate = new Date(rt.start_date);
      const endDate = rt.end_date ? new Date(rt.end_date) : new Date();
      endDate.setMonth(endDate.getMonth() + 12); // Project 12 months ahead

      let current = new Date(startDate);
      while (current <= endDate) {
        const month = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        months.add(month);
        current.setMonth(current.getMonth() + 1);
      }
    });

    return Array.from(months).sort().reverse();
  },

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  addTransaction: async (transaction) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showErrorToast('Usuário não autenticado');
      return;
    }

    const { currentMonth, monthsData } = get();
    const transactionMonth = transaction.date.substring(0, 7);

    const newTransaction = {
      ...transaction,
      user_id: user.id,
      month: transactionMonth,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction] as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      showErrorToast('Erro ao adicionar transação');
      return;
    }

    // Update local state
    const updatedMonthsData = { ...monthsData };
    if (!updatedMonthsData[transactionMonth]) {
      updatedMonthsData[transactionMonth] = { transactions: [] };
    }
    updatedMonthsData[transactionMonth].transactions = [
      data,
      ...updatedMonthsData[transactionMonth].transactions,
    ];

    set({ monthsData: updatedMonthsData });

    if (transactionMonth === currentMonth) {
      const predicted = get().generatePredictedTransactions();
      set({
        transactions: [
          ...updatedMonthsData[currentMonth].transactions,
          ...predicted.filter((p) => p.month === currentMonth),
        ],
      });
    }

    showSuccessToast('Transação adicionada!');
  },

  updateTransaction: async (id, updates) => {
    const supabase = getSupabaseClient();
    const { currentMonth, monthsData } = get();

    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      showErrorToast('Erro ao atualizar transação');
      return;
    }

    // Update local state
    const updatedMonthsData = { ...monthsData };
    Object.keys(updatedMonthsData).forEach((month) => {
      updatedMonthsData[month].transactions = updatedMonthsData[month].transactions.map((t) =>
        t.id === id ? data : t
      );
    });

    set({ monthsData: updatedMonthsData });

    if (data.month === currentMonth) {
      const predicted = get().generatePredictedTransactions();
      set({
        transactions: [
          ...updatedMonthsData[currentMonth].transactions,
          ...predicted.filter((p) => p.month === currentMonth),
        ],
      });
    }

    showSuccessToast('Transação atualizada!');
  },

  deleteTransaction: async (id, isPredicted = false) => {
    if (isPredicted) {
      // Add to excluded list
      const { excludedPredictedIds, currentMonth, monthsData } = get();
      const newExcluded = [...excludedPredictedIds, id];
      saveExcludedPredictedIds(newExcluded);

      const predicted = get().generatePredictedTransactions();
      set({
        excludedPredictedIds: newExcluded,
        transactions: [
          ...(monthsData[currentMonth]?.transactions || []),
          ...predicted.filter((p) => p.month === currentMonth && p.id !== id),
        ],
      });

      showSuccessToast('Previsão removida!');
      return;
    }

    const supabase = getSupabaseClient();
    const { currentMonth, monthsData } = get();

    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      showErrorToast('Erro ao excluir transação');
      return;
    }

    // Update local state
    const updatedMonthsData = { ...monthsData };
    Object.keys(updatedMonthsData).forEach((month) => {
      updatedMonthsData[month].transactions = updatedMonthsData[month].transactions.filter(
        (t) => t.id !== id
      );
    });

    set({ monthsData: updatedMonthsData });

    const predicted = get().generatePredictedTransactions();
    set({
      transactions: [
        ...(updatedMonthsData[currentMonth]?.transactions || []),
        ...predicted.filter((p) => p.month === currentMonth),
      ],
    });

    showSuccessToast('Transação excluída!');
  },

  togglePaymentStatus: async (id) => {
    const { transactions } = get();
    const transaction = transactions.find((t) => t.id === id);

    if (!transaction || transaction.is_predicted) return;

    await get().updateTransaction(id, { is_paid: !transaction.is_paid });
  },

  convertPredictedToReal: async (predictedId, updates = {}) => {
    const { transactions, excludedPredictedIds, currentMonth, monthsData } = get();
    const predicted = transactions.find((t) => t.id === predictedId && t.is_predicted);

    if (!predicted) return;

    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Create real transaction
    const newTransaction = {
      description: predicted.description,
      type: predicted.type,
      category: predicted.category,
      value: predicted.value,
      date: predicted.date,
      month: predicted.month,
      user_id: user.id,
      recurring_id: predicted.recurring_id,
      is_paid: true,
      current_installment: predicted.current_installment,
      total_installments: predicted.total_installments,
      ...updates,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction] as any)
      .select()
      .single();

    if (error) {
      console.error('Error converting transaction:', error);
      showErrorToast('Erro ao converter transação');
      return;
    }

    // Add predicted ID to excluded list
    const newExcluded = [...excludedPredictedIds, predictedId];
    saveExcludedPredictedIds(newExcluded);

    // Update local state
    const updatedMonthsData = { ...monthsData };
    if (!updatedMonthsData[data.month]) {
      updatedMonthsData[data.month] = { transactions: [] };
    }
    updatedMonthsData[data.month].transactions = [data, ...updatedMonthsData[data.month].transactions];

    set({
      monthsData: updatedMonthsData,
      excludedPredictedIds: newExcluded,
    });

    const newPredicted = get().generatePredictedTransactions();
    set({
      transactions: [
        ...(updatedMonthsData[currentMonth]?.transactions || []),
        ...newPredicted.filter((p) => p.month === currentMonth),
      ],
    });

    showSuccessToast('Transação confirmada!');
  },

  setTransactions: (transactions) => {
    set({ transactions });
  },

  // ==========================================
  // RECURRING TRANSACTIONS
  // ==========================================

  addRecurringTransaction: async (transaction) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showErrorToast('Usuário não autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([{ ...transaction, user_id: user.id }] as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding recurring transaction:', error);
      showErrorToast('Erro ao adicionar transação recorrente');
      return;
    }

    const { recurringTransactions, currentMonth, monthsData } = get();
    set({ recurringTransactions: [...recurringTransactions, data] });

    // Regenerate predictions
    const predicted = get().generatePredictedTransactions();
    set({
      transactions: [
        ...(monthsData[currentMonth]?.transactions || []),
        ...predicted.filter((p) => p.month === currentMonth),
      ],
    });

    showSuccessToast('Transação recorrente criada!');
  },

  updateRecurringTransaction: async (id, updates) => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recurring transaction:', error);
      showErrorToast('Erro ao atualizar transação recorrente');
      return;
    }

    const { recurringTransactions, currentMonth, monthsData } = get();
    set({
      recurringTransactions: recurringTransactions.map((rt) => (rt.id === id ? data : rt)),
    });

    // Regenerate predictions
    const predicted = get().generatePredictedTransactions();
    set({
      transactions: [
        ...(monthsData[currentMonth]?.transactions || []),
        ...predicted.filter((p) => p.month === currentMonth),
      ],
    });

    showSuccessToast('Transação recorrente atualizada!');
  },

  deleteRecurringTransaction: async (id) => {
    const supabase = getSupabaseClient();

    // Delete the recurring transaction
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting recurring transaction:', error);
      showErrorToast('Erro ao excluir transação recorrente');
      return;
    }

    // Also delete related real transactions
    await supabase.from('transactions').delete().eq('recurring_id', id);

    const { recurringTransactions, currentMonth, monthsData } = get();

    // Update monthsData to remove related transactions
    const updatedMonthsData = { ...monthsData };
    Object.keys(updatedMonthsData).forEach((month) => {
      updatedMonthsData[month].transactions = updatedMonthsData[month].transactions.filter(
        (t) => t.recurring_id !== id
      );
    });

    set({
      recurringTransactions: recurringTransactions.filter((rt) => rt.id !== id),
      monthsData: updatedMonthsData,
    });

    // Regenerate predictions
    const predicted = get().generatePredictedTransactions();
    set({
      transactions: [
        ...(updatedMonthsData[currentMonth]?.transactions || []),
        ...predicted.filter((p) => p.month === currentMonth),
      ],
    });

    showSuccessToast('Transação recorrente excluída!');
  },

  loadRecurringTransactions: async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error loading recurring transactions:', error);
      return;
    }

    set({ recurringTransactions: data || [] });
  },

  generatePredictedTransactions: (monthsAhead = 12) => {
    const { recurringTransactions, excludedPredictedIds, monthsData } = get();
    const predicted: Transaction[] = [];
    const now = new Date();
    const currentMonthStr = getCurrentMonth();

    recurringTransactions.forEach((rt) => {
      const startDate = new Date(rt.start_date);
      const endDate = rt.end_date ? new Date(rt.end_date) : null;

      // Calculate number of months to generate
      for (let i = 0; i <= monthsAhead; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() + i, rt.day_of_month);
        const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

        // Check if within valid range
        if (targetDate < startDate) continue;
        if (endDate && targetDate > endDate) continue;

        // Check for installments
        if (rt.recurrence_type === 'installment' && rt.total_installments) {
          const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
            (targetDate.getMonth() - startDate.getMonth());
          if (monthsDiff >= rt.total_installments) continue;
        }

        // Generate predicted ID
        const predictedId = `predicted-${rt.id}-${monthStr}`;

        // Skip if excluded
        if (excludedPredictedIds.includes(predictedId)) continue;

        // Skip if real transaction exists for this recurring in this month
        const realExists = Object.values(monthsData).some((md) =>
          md.transactions.some(
            (t) => t.recurring_id === rt.id && t.month === monthStr && !t.is_predicted
          )
        );
        if (realExists) continue;

        // Calculate value for variable types
        let value = rt.value;
        if (rt.recurrence_type === 'variable_by_income' && rt.selected_income_id) {
          // Find the selected income transaction
          const incomeTransaction = Object.values(monthsData)
            .flatMap((md) => md.transactions)
            .find((t) => t.id === rt.selected_income_id);
          if (incomeTransaction) {
            value = (incomeTransaction.value * rt.value) / 100;
          }
        }

        // Calculate installment number
        let currentInstallment: number | undefined;
        let totalInstallments: number | undefined;
        if (rt.recurrence_type === 'installment' && rt.total_installments) {
          const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
            (targetDate.getMonth() - startDate.getMonth());
          currentInstallment = monthsDiff + 1;
          totalInstallments = rt.total_installments;
        }

        predicted.push({
          id: predictedId,
          user_id: rt.user_id,
          description: rt.description,
          type: rt.type,
          category: rt.category,
          value,
          date: `${monthStr}-${String(rt.day_of_month).padStart(2, '0')}`,
          month: monthStr,
          recurring_id: rt.id,
          is_predicted: true,
          is_paid: false,
          current_installment: currentInstallment,
          total_installments: totalInstallments,
        });
      }
    });

    return predicted;
  },

  // ==========================================
  // CATEGORIES
  // ==========================================

  addCategory: async (name, limits) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showErrorToast('Usuário não autenticado');
      return;
    }

    const { categories, categoryLimits } = get();

    if (categories.includes(name)) {
      showErrorToast('Categoria já existe');
      return;
    }

    const { error } = await supabase.from('categories').insert([
      {
        user_id: user.id,
        name,
        max_percentage: limits?.maxPercentage || null,
        max_value: limits?.maxValue || null,
      },
    ] as any);

    if (error) {
      if (error.code === '23505') {
        showErrorToast('Categoria já existe');
      } else {
        console.error('Error adding category:', error);
        showErrorToast('Erro ao adicionar categoria');
      }
      return;
    }

    const newLimits = { ...categoryLimits };
    if (limits) {
      newLimits[name] = limits;
    }

    set({
      categories: [...categories, name],
      categoryLimits: newLimits,
    });

    showSuccessToast('Categoria adicionada!');
  },

  updateCategoryLimits: async (category, limits) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .update({
        max_percentage: limits.maxPercentage || null,
        max_value: limits.maxValue || null,
      } as any)
      .eq('user_id', user.id)
      .eq('name', category);

    if (error) {
      console.error('Error updating category limits:', error);
      showErrorToast('Erro ao atualizar limites');
      return;
    }

    const { categoryLimits } = get();
    set({
      categoryLimits: {
        ...categoryLimits,
        [category]: limits,
      },
    });

    showSuccessToast('Limites atualizados!');
  },

  deleteCategory: async (name) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Check if it's a default category
    if (DEFAULT_CATEGORIES_LIST.includes(name)) {
      await get().hideDefaultCategory(name);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('user_id', user.id)
      .eq('name', name);

    if (error) {
      console.error('Error deleting category:', error);
      showErrorToast('Erro ao excluir categoria');
      return;
    }

    const { categories, categoryLimits } = get();
    const newLimits = { ...categoryLimits };
    delete newLimits[name];

    set({
      categories: categories.filter((c) => c !== name),
      categoryLimits: newLimits,
    });

    showSuccessToast('Categoria excluída!');
  },

  hideDefaultCategory: async (name) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('hidden_categories')
      .insert([{ user_id: user.id, category_name: name }] as any);

    if (error) {
      console.error('Error hiding category:', error);
      showErrorToast('Erro ao ocultar categoria');
      return;
    }

    const { categories, hiddenDefaultCategories } = get();
    set({
      categories: categories.filter((c) => c !== name),
      hiddenDefaultCategories: [...hiddenDefaultCategories, name],
    });

    showSuccessToast('Categoria ocultada!');
  },

  showDefaultCategory: async (name) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('hidden_categories')
      .delete()
      .eq('user_id', user.id)
      .eq('category_name', name);

    if (error) {
      console.error('Error showing category:', error);
      showErrorToast('Erro ao exibir categoria');
      return;
    }

    const { categories, hiddenDefaultCategories } = get();
    set({
      categories: [...categories, name],
      hiddenDefaultCategories: hiddenDefaultCategories.filter((c) => c !== name),
    });

    showSuccessToast('Categoria restaurada!');
  },

  // ==========================================
  // GOALS
  // ==========================================

  loadGoals: async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    set({ goals: data || [] });
  },

  addGoal: async (goal) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showErrorToast('Usuário não autenticado');
      return;
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .insert([{ ...goal, user_id: user.id }] as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      showErrorToast('Erro ao criar meta');
      return;
    }

    const { goals } = get();
    set({ goals: [data, ...goals] });

    showSuccessToast('Meta criada!');
  },

  updateGoal: async (id, updates) => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('financial_goals')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      showErrorToast('Erro ao atualizar meta');
      return;
    }

    const { goals } = get();
    set({ goals: goals.map((g) => (g.id === id ? data : g)) });

    showSuccessToast('Meta atualizada!');
  },

  deleteGoal: async (id) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('financial_goals').delete().eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      showErrorToast('Erro ao excluir meta');
      return;
    }

    const { goals } = get();
    set({ goals: goals.filter((g) => g.id !== id) });

    showSuccessToast('Meta excluída!');
  },

  addToGoal: async (id, amount) => {
    const { goals } = get();
    const goal = goals.find((g) => g.id === id);

    if (!goal) return;

    const newCurrentValue = goal.current_value + amount;
    const isCompleted = newCurrentValue >= goal.target_value;

    await get().updateGoal(id, {
      current_value: newCurrentValue,
      is_completed: isCompleted,
    });

    if (isCompleted) {
      showSuccessToast('Parabéns! Meta alcançada! 🎉');
    }
  },

  // ==========================================
  // BUDGETS
  // ==========================================

  loadBudgets: async (month) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const targetMonth = month || get().currentMonth;

    const { data, error } = await supabase
      .from('category_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', targetMonth);

    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }

    set({ categoryBudgets: data || [] });
  },

  setBudget: async (category, month, budgetValue, alertThreshold = 80) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showErrorToast('Usuário não autenticado');
      return;
    }

    const { categoryBudgets } = get();
    const existingBudget = categoryBudgets.find(
      (b) => b.category === category && b.month === month
    );

    if (existingBudget) {
      // Update existing budget
      const { data, error } = await supabase
        .from('category_budgets')
        .update({ budget_value: budgetValue, alert_threshold: alertThreshold } as any)
        .eq('id', existingBudget.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget:', error);
        showErrorToast('Erro ao atualizar orçamento');
        return;
      }

      set({
        categoryBudgets: categoryBudgets.map((b) => (b.id === existingBudget.id ? data : b)),
      });
    } else {
      // Create new budget
      const { data, error } = await supabase
        .from('category_budgets')
        .insert([
          {
            user_id: user.id,
            category,
            month,
            budget_value: budgetValue,
            alert_threshold: alertThreshold,
          },
        ] as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating budget:', error);
        showErrorToast('Erro ao criar orçamento');
        return;
      }

      set({ categoryBudgets: [...categoryBudgets, data] });
    }

    showSuccessToast('Orçamento definido!');
  },

  deleteBudget: async (id) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('category_budgets').delete().eq('id', id);

    if (error) {
      console.error('Error deleting budget:', error);
      showErrorToast('Erro ao excluir orçamento');
      return;
    }

    const { categoryBudgets } = get();
    set({ categoryBudgets: categoryBudgets.filter((b) => b.id !== id) });

    showSuccessToast('Orçamento excluído!');
  },

  getBudgetStatus: (category, month) => {
    const { categoryBudgets, monthsData } = get();
    const budget = categoryBudgets.find((b) => b.category === category && b.month === month);

    if (!budget) return null;

    const transactions = monthsData[month]?.transactions || [];
    const spentValue = transactions
      .filter((t) => t.category === category && t.type === 'expense' && !t.is_predicted)
      .reduce((sum, t) => sum + t.value, 0);

    const remainingValue = budget.budget_value - spentValue;
    const percentageUsed = (spentValue / budget.budget_value) * 100;

    return {
      category,
      budgetValue: budget.budget_value,
      spentValue,
      remainingValue,
      percentageUsed,
      isOverBudget: percentageUsed > 100,
      isNearLimit: percentageUsed >= budget.alert_threshold && percentageUsed <= 100,
    };
  },

  getAllBudgetStatuses: (month) => {
    const { categoryBudgets } = get();
    const statuses: BudgetStatus[] = [];

    categoryBudgets
      .filter((b) => b.month === month)
      .forEach((budget) => {
        const status = get().getBudgetStatus(budget.category, month);
        if (status) {
          statuses.push(status);
        }
      });

    return statuses;
  },

  // ==========================================
  // DASHBOARD WIDGETS
  // ==========================================

  loadDashboardWidgets: async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error loading widgets:', error);
      return;
    }

    set({ dashboardWidgets: data || [] });
  },

  updateWidgetPosition: async (widgetId, newPosition) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('dashboard_widgets')
      .update({ position: newPosition } as any)
      .eq('id', widgetId);

    if (error) {
      console.error('Error updating widget position:', error);
      return;
    }

    const { dashboardWidgets } = get();
    set({
      dashboardWidgets: dashboardWidgets
        .map((w) => (w.id === widgetId ? { ...w, position: newPosition } : w))
        .sort((a, b) => a.position - b.position),
    });
  },

  toggleWidgetVisibility: async (widgetId) => {
    const supabase = getSupabaseClient();
    const { dashboardWidgets } = get();
    const widget = dashboardWidgets.find((w) => w.id === widgetId);

    if (!widget) return;

    const { error } = await supabase
      .from('dashboard_widgets')
      .update({ is_visible: !widget.is_visible } as any)
      .eq('id', widgetId);

    if (error) {
      console.error('Error toggling widget visibility:', error);
      return;
    }

    set({
      dashboardWidgets: dashboardWidgets.map((w) =>
        w.id === widgetId ? { ...w, is_visible: !w.is_visible } : w
      ),
    });
  },

  updateWidgetConfig: async (widgetId, config) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('dashboard_widgets')
      .update({ config } as any)
      .eq('id', widgetId);

    if (error) {
      console.error('Error updating widget config:', error);
      return;
    }

    const { dashboardWidgets } = get();
    set({
      dashboardWidgets: dashboardWidgets.map((w) =>
        w.id === widgetId ? { ...w, config } : w
      ),
    });
  },

  resetDashboardLayout: async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // Delete all existing widgets
    await supabase.from('dashboard_widgets').delete().eq('user_id', user.id);

    // Create default widgets
    const defaultWidgets = [
      { widget_type: 'summary_cards', position: 0 },
      { widget_type: 'goals_overview', position: 1 },
      { widget_type: 'budget_overview', position: 2 },
      { widget_type: 'expenses_by_category', position: 3 },
      { widget_type: 'income_vs_expense', position: 4 },
      { widget_type: 'recurring_vs_variable', position: 5 },
      { widget_type: 'future_projection', position: 6 },
      { widget_type: 'financial_stats', position: 7 },
      { widget_type: 'recent_transactions', position: 8 },
    ];

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert(defaultWidgets.map((w) => ({ ...w, user_id: user.id, is_visible: true, config: {} })) as any)
      .select();

    if (error) {
      console.error('Error resetting dashboard:', error);
      showErrorToast('Erro ao resetar dashboard');
      return;
    }

    set({ dashboardWidgets: data || [] });
    showSuccessToast('Dashboard resetado!');
  },

  // ==========================================
  // USER SETTINGS
  // ==========================================

  loadUserSettings: async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user settings:', error);
      return;
    }

    set({ userSettings: data || null });
  },

  updateUserSettings: async (settings) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { userSettings } = get();

    if (userSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({ ...settings, updated_at: new Date().toISOString() } as any)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        showErrorToast('Erro ao atualizar configurações');
        return;
      }

      set({ userSettings: data });
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert([
          {
            user_id: user.id,
            dashboard_config: defaultDashboardConfig,
            ...settings,
          },
        ] as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating user settings:', error);
        showErrorToast('Erro ao criar configurações');
        return;
      }

      set({ userSettings: data });
    }

    showSuccessToast('Configurações salvas!');
  },

  // ==========================================
  // UI ACTIONS
  // ==========================================

  toggleShowMonthPicker: () => {
    set((state) => ({ showMonthPicker: !state.showMonthPicker }));
  },

  // ==========================================
  // DATA ACTIONS
  // ==========================================

  importData: async (data) => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showErrorToast('Usuário não autenticado');
      return;
    }

    try {
      if (data.transactions && data.transactions.length > 0) {
        const transactionsToInsert = data.transactions.map((t) => ({
          ...t,
          id: undefined,
          user_id: user.id,
          created_at: undefined,
          updated_at: undefined,
        }));

        const { error } = await supabase.from('transactions').insert(transactionsToInsert as any);
        if (error) throw error;
      }

      if (data.categories && data.categories.length > 0) {
        const categoriesToInsert = data.categories
          .filter((c) => !DEFAULT_CATEGORIES_LIST.includes(c))
          .map((name) => ({ user_id: user.id, name }));

        if (categoriesToInsert.length > 0) {
          const { error } = await supabase.from('categories').insert(categoriesToInsert as any);
          if (error && error.code !== '23505') throw error;
        }
      }

      // Reload data
      await get().loadFromSupabase(3);
      showSuccessToast('Dados importados com sucesso!');
    } catch (error) {
      console.error('Error importing data:', error);
      showErrorToast('Erro ao importar dados');
    }
  },

  clearAllData: async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    try {
      // Delete all user data
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', user.id),
        supabase.from('recurring_transactions').delete().eq('user_id', user.id),
        supabase.from('categories').delete().eq('user_id', user.id),
        supabase.from('hidden_categories').delete().eq('user_id', user.id),
        supabase.from('financial_goals').delete().eq('user_id', user.id),
        supabase.from('category_budgets').delete().eq('user_id', user.id),
      ]);

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentMonth');
        localStorage.removeItem('excludedPredictedIds');
      }

      // Reset state
      set({
        transactions: [],
        categories: [...DEFAULT_CATEGORIES_LIST],
        categoryLimits: {},
        hiddenDefaultCategories: [],
        monthsData: {},
        recurringTransactions: [],
        excludedPredictedIds: [],
        goals: [],
        categoryBudgets: [],
      });

      showSuccessToast('Dados excluídos com sucesso!');
    } catch (error) {
      console.error('Error clearing data:', error);
      showErrorToast('Erro ao limpar dados');
    }
  },
}));
