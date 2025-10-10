-- Update portfolio balances to 10,000
-- This migration updates existing portfolio total_value, cash_balance and user account balances

-- Update portfolios table - set portfolio values to 10,000
UPDATE public.portfolios SET 
  total_value = 10000.00,
  cash_balance = 5000.00,
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  '8ab3868f-aa6a-4329-9259-fe7867f2dc1a',
  '83d6f82e-90e9-4e43-b89d-3f5cc98ec6ad'
);

-- Update user_profiles table - set account balances to 10,000
UPDATE public.user_profiles SET
  account_balance = 10000.00,
  available_balance = 8000.00,
  buying_power = 10000.00,
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  'f7b7dbed-d459-4d2c-a21d-0fce13ee257c',
  '145d705c-d690-4aa6-9716-6c4ce8981ffe'
);

-- Verify the updates
SELECT 
  p.id,
  p.name,
  p.total_value,
  p.cash_balance,
  u.full_name,
  u.account_balance,
  u.available_balance,
  u.buying_power
FROM public.portfolios p
JOIN public.user_profiles u ON p.user_id = u.id
WHERE p.is_default = true;