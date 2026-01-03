-- ============================================
-- PLANILHA FINANCEIRA V2 - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL CHECK (value >= 0),
  date DATE NOT NULL,
  month TEXT NOT NULL,
  recurring_id UUID,
  is_paid BOOLEAN DEFAULT false,
  current_installment INTEGER,
  total_installments INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_month ON transactions(month);
CREATE INDEX idx_transactions_user_month ON transactions(user_id, month);
CREATE INDEX idx_transactions_recurring_id ON transactions(recurring_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- ============================================
-- RECURRING TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  value DECIMAL(12,2) NOT NULL CHECK (value >= 0),
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('fixed', 'installment', 'variable', 'variable_by_income')),
  start_date DATE NOT NULL,
  end_date DATE,
  day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  total_installments INTEGER,
  current_installment INTEGER,
  is_active BOOLEAN DEFAULT true,
  selected_income_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for recurring_id after both tables exist
ALTER TABLE transactions
  ADD CONSTRAINT fk_recurring_transaction
  FOREIGN KEY (recurring_id)
  REFERENCES recurring_transactions(id)
  ON DELETE SET NULL;

-- Indexes for recurring_transactions
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_is_active ON recurring_transactions(is_active);
CREATE INDEX idx_recurring_user_active ON recurring_transactions(user_id, is_active);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_percentage DECIMAL(5,2) CHECK (max_percentage >= 0 AND max_percentage <= 100),
  max_value DECIMAL(12,2) CHECK (max_value >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Indexes for categories
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- ============================================
-- HIDDEN CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hidden_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_name)
);

-- Indexes for hidden_categories
CREATE INDEX idx_hidden_categories_user_id ON hidden_categories(user_id);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  period_separation_enabled BOOLEAN DEFAULT false,
  period_1_end INTEGER DEFAULT 15 CHECK (period_1_end BETWEEN 1 AND 31),
  period_2_start INTEGER DEFAULT 16 CHECK (period_2_start BETWEEN 1 AND 31),
  dashboard_config JSONB DEFAULT '{
    "balance": true,
    "monthlyIncome": true,
    "monthlyExpense": true,
    "periodCards": true,
    "charts": true,
    "recentTransactions": true,
    "expensesByCategory": true,
    "incomeVsExpense": true,
    "recurringVsVariable": true,
    "futureProjection": true,
    "financialStats": true,
    "goalsOverview": true,
    "budgetOverview": true
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCIAL GOALS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(12,2) NOT NULL CHECK (target_value > 0),
  current_value DECIMAL(12,2) DEFAULT 0 CHECK (current_value >= 0),
  deadline DATE,
  category TEXT,
  color TEXT DEFAULT '#667eea',
  icon TEXT DEFAULT 'target',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for financial_goals
CREATE INDEX idx_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_goals_is_completed ON financial_goals(is_completed);
CREATE INDEX idx_goals_user_completed ON financial_goals(user_id, is_completed);

-- ============================================
-- CATEGORY BUDGETS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS category_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  month TEXT NOT NULL,
  budget_value DECIMAL(12,2) NOT NULL CHECK (budget_value > 0),
  alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, month)
);

-- Indexes for category_budgets
CREATE INDEX idx_budgets_user_id ON category_budgets(user_id);
CREATE INDEX idx_budgets_month ON category_budgets(month);
CREATE INDEX idx_budgets_user_month ON category_budgets(user_id, month);

-- ============================================
-- DASHBOARD WIDGETS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  is_visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard_widgets
CREATE INDEX idx_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX idx_widgets_user_position ON dashboard_widgets(user_id, position);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Recurring transactions policies
CREATE POLICY "Users can view own recurring transactions" ON recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions" ON recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions" ON recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions" ON recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Hidden categories policies
CREATE POLICY "Users can view own hidden categories" ON hidden_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hidden categories" ON hidden_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hidden categories" ON hidden_categories
  FOR DELETE USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Financial goals policies
CREATE POLICY "Users can view own goals" ON financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Category budgets policies
CREATE POLICY "Users can view own budgets" ON category_budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON category_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON category_budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON category_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Dashboard widgets policies
CREATE POLICY "Users can view own widgets" ON dashboard_widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widgets" ON dashboard_widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets" ON dashboard_widgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets" ON dashboard_widgets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO INITIALIZE DEFAULT WIDGETS
-- ============================================

CREATE OR REPLACE FUNCTION create_default_widgets()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dashboard_widgets (user_id, widget_type, position, is_visible) VALUES
    (NEW.id, 'summary_cards', 0, true),
    (NEW.id, 'goals_overview', 1, true),
    (NEW.id, 'budget_overview', 2, true),
    (NEW.id, 'expenses_by_category', 3, true),
    (NEW.id, 'income_vs_expense', 4, true),
    (NEW.id, 'recurring_vs_variable', 5, true),
    (NEW.id, 'future_projection', 6, true),
    (NEW.id, 'financial_stats', 7, true),
    (NEW.id, 'recent_transactions', 8, true);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new users (commented out - use if you want auto-creation)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_default_widgets();
