-- Location: supabase/migrations/20251012210631_add_trading_account_balance_system.sql
-- Schema Analysis: Creating new trading account balance system (CORRECTED VERSION)
-- Integration Type: addition/new_module 
-- Dependencies: auth.users (existing Supabase auth), user_profiles (may exist)

-- 1. Types for trading account (only create if they don't exist)
DO $$
BEGIN
    CREATE TYPE public.account_type AS ENUM ('demo', 'live', 'paper');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type account_type already exists, skipping creation.';
END
$$;

DO $$
BEGIN
    CREATE TYPE public.currency_type AS ENUM ('EUR', 'USD', 'CHF');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type currency_type already exists, skipping creation.';
END
$$;

DO $$
BEGIN
    CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'trade_profit', 'trade_loss', 'fee', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type transaction_type already exists, skipping creation.';
END
$$;

-- 2. Core tables (only create if they don't exist)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'trader',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    account_type public.account_type DEFAULT 'demo'::public.account_type,
    balance DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
    currency public.currency_type DEFAULT 'EUR'::public.currency_type,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    transaction_type public.transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes (only create if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_active ON public.trading_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_balance_history_account_id ON public.balance_history(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_created_at ON public.balance_history(created_at);

-- 4. Functions (create or replace)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, username)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8))
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_trading_account()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_account_id UUID;
    existing_account_count INTEGER;
BEGIN
    -- Check if user already has a trading account
    SELECT COUNT(*) INTO existing_account_count
    FROM public.trading_accounts
    WHERE user_id = NEW.id;

    -- Only create if no accounts exist
    IF existing_account_count = 0 THEN
        INSERT INTO public.trading_accounts (user_id, account_type, balance, currency)
        VALUES (NEW.id, 'demo'::public.account_type, 10000.00, 'EUR'::public.currency_type)
        RETURNING id INTO new_account_id;
        
        INSERT INTO public.balance_history (account_id, transaction_type, amount, balance_before, balance_after, description)
        VALUES (new_account_id, 'deposit'::public.transaction_type, 10000.00, 0.00, 10000.00, 'Initial demo account funding');
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_trading_balance(
    account_uuid UUID,
    transaction_amount DECIMAL(15,2),
    trans_type public.transaction_type,
    trans_description TEXT DEFAULT NULL,
    ref_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance DECIMAL(15,2);
    new_balance DECIMAL(15,2);
BEGIN
    SELECT balance INTO current_balance 
    FROM public.trading_accounts 
    WHERE id = account_uuid AND user_id = auth.uid();
    
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    new_balance := current_balance + transaction_amount;
    
    IF new_balance < 0 THEN
        RETURN FALSE;
    END IF;
    
    UPDATE public.trading_accounts 
    SET balance = new_balance, updated_at = CURRENT_TIMESTAMP
    WHERE id = account_uuid AND user_id = auth.uid();
    
    INSERT INTO public.balance_history (
        account_id, transaction_type, amount, balance_before, balance_after, description, reference_id
    ) VALUES (
        account_uuid, trans_type, transaction_amount, current_balance, new_balance, trans_description, ref_id
    );
    
    RETURN TRUE;
END;
$$;

-- 5. RLS Setup (enable only if not already enabled)
DO $$
BEGIN
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS already enabled for user_profiles or other error: %', SQLERRM;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS already enabled for trading_accounts or other error: %', SQLERRM;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.balance_history ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS already enabled for balance_history or other error: %', SQLERRM;
END
$$;

-- 6. RLS Policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_manage_own_trading_accounts" ON public.trading_accounts;
DROP POLICY IF EXISTS "users_view_own_balance_history" ON public.balance_history;

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for trading accounts
CREATE POLICY "users_manage_own_trading_accounts"
ON public.trading_accounts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Balance history access through account ownership
CREATE POLICY "users_view_own_balance_history"
ON public.balance_history
FOR SELECT
TO authenticated
USING (
    account_id IN (
        SELECT id FROM public.trading_accounts WHERE user_id = auth.uid()
    )
);

-- 7. Triggers (drop existing ones first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_trading_account();

-- 8. Mock Data (only if demo user doesn't exist)
DO $$
DECLARE
    demo_user_id UUID;
    demo_account_id UUID;
    existing_user_count INTEGER;
BEGIN
    -- Check if demo user already exists
    SELECT COUNT(*) INTO existing_user_count
    FROM auth.users
    WHERE email = 'demo@trading-mvp.com';

    -- Only create demo user if it doesn't exist
    IF existing_user_count = 0 THEN
        demo_user_id := gen_random_uuid();
        demo_account_id := gen_random_uuid();

        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            demo_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'demo@trading-mvp.com', crypt('demo123', gen_salt('bf', 10)), now(), now(), now(),
            '{"full_name": "Demo Trader", "username": "demo_trader"}'::jsonb, 
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        );

        INSERT INTO public.user_profiles (id, email, full_name, username, role)
        VALUES (demo_user_id, 'demo@trading-mvp.com', 'Demo Trader', 'demo_trader', 'trader')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.trading_accounts (id, user_id, account_type, balance, currency)
        VALUES (demo_account_id, demo_user_id, 'demo'::public.account_type, 10000.00, 'EUR'::public.currency_type)
        ON CONFLICT DO NOTHING;

        INSERT INTO public.balance_history (account_id, transaction_type, amount, balance_before, balance_after, description)
        VALUES (demo_account_id, 'deposit'::public.transaction_type, 10000.00, 0.00, 10000.00, 'Initial demo account funding - 10,000€ trading capital')
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Demo user created successfully with email: demo@trading-mvp.com and password: demo123';
    ELSE
        RAISE NOTICE 'Demo user already exists, skipping creation.';
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;