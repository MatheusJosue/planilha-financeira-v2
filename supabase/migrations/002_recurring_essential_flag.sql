-- ============================================
-- ADD ESSENTIAL FLAG TO RECURRING TRANSACTIONS
-- ============================================

ALTER TABLE recurring_transactions
  ADD COLUMN IF NOT EXISTS is_essential BOOLEAN NOT NULL DEFAULT true;
