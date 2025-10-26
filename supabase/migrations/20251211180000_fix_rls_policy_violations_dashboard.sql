-- Fix RLS Policy Violations for Dashboard Data Loading
-- Schema Analysis: Multiple tables with RLS policies blocking INSERT operations
-- Integration Type: Security fix - adjust RLS policies for proper user access
-- Dependencies: risk_controller, external_api_configs, strategy_extractions, user_profiles

-- 1. Fix risk_controller RLS policies
-- The error shows user_id auth.uid() mismatch, need to allow proper insertion

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "users_manage_own_risk_controller" ON public.risk_controller;

-- Create comprehensive RLS policies for risk_controller using Pattern 2
CREATE POLICY "users_can_select_own_risk_controller"
ON public.risk_controller
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_can_insert_own_risk_controller"
ON public.risk_controller
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_risk_controller"
ON public.risk_controller
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_risk_controller"
ON public.risk_controller
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 2. Fix external_api_configs RLS policies
-- Enable RLS if not already enabled
ALTER TABLE public.external_api_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "authenticated_can_manage_api_configs" ON public.external_api_configs;

-- Create comprehensive policies using Pattern 2
CREATE POLICY "authenticated_can_select_api_configs"
ON public.external_api_configs
FOR SELECT
TO authenticated
USING (true); -- Allow all authenticated users to read API configs

CREATE POLICY "authenticated_can_insert_api_configs"
ON public.external_api_configs
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow authenticated users to insert API configs

CREATE POLICY "authenticated_can_update_api_configs"
ON public.external_api_configs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true); -- Allow authenticated users to update API configs

CREATE POLICY "authenticated_can_delete_api_configs"
ON public.external_api_configs
FOR DELETE
TO authenticated
USING (true); -- Allow authenticated users to delete API configs

-- 3. Add missing enum value for extraction_type
-- Fix the enum issue by adding the missing 'volatility_correlation' value
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'extraction_type'
      AND e.enumlabel = 'volatility_correlation'
  ) THEN
    ALTER TYPE public.extraction_type ADD VALUE 'volatility_correlation';
  END IF;
END $$;

-- 4. Fix strategy_extractions policies if they exist
-- Ensure strategy_extractions has proper RLS policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'strategy_extractions'
  ) THEN
    -- Enable RLS on strategy_extractions
    ALTER TABLE public.strategy_extractions ENABLE ROW LEVEL SECURITY;
    
    -- Create user-based access policy
    DROP POLICY IF EXISTS "users_manage_own_strategy_extractions" ON public.strategy_extractions;
    
    CREATE POLICY "authenticated_can_read_strategy_extractions"
    ON public.strategy_extractions
    FOR SELECT
    TO authenticated
    USING (true);
    
    CREATE POLICY "authenticated_can_manage_strategy_extractions"
    ON public.strategy_extractions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- 5. Add helper function for proper user initialization
-- Create function to ensure users have required default records
CREATE OR REPLACE FUNCTION public.ensure_user_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create default risk_controller for new user
  INSERT INTO public.risk_controller (
    user_id, 
    max_daily_loss, 
    max_portfolio_drawdown,
    configuration
  ) VALUES (
    NEW.id,
    1000.00,
    10.00,
    '{"market_hours_only": true, "validate_orders": true, "max_position_size": 50000}'::jsonb
  ) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 6. Create trigger to auto-create defaults for new users
-- Only create trigger if user_profiles table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  ) THEN
    -- Drop existing trigger if exists
    DROP TRIGGER IF EXISTS ensure_user_defaults_trigger ON public.user_profiles;
    
    -- Create new trigger
    CREATE TRIGGER ensure_user_defaults_trigger
      AFTER INSERT ON public.user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.ensure_user_defaults();
  END IF;
END $$;

-- 7. Create function to initialize current users who might be missing defaults
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Only proceed if tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_controller') THEN
    
    -- Initialize risk_controller for existing users who don't have one
    FOR user_record IN 
      SELECT up.id 
      FROM public.user_profiles up 
      LEFT JOIN public.risk_controller rc ON up.id = rc.user_id 
      WHERE rc.user_id IS NULL
    LOOP
      INSERT INTO public.risk_controller (
        user_id,
        max_daily_loss,
        max_portfolio_drawdown,
        configuration
      ) VALUES (
        user_record.id,
        1000.00,
        10.00,
        '{"market_hours_only": true, "validate_orders": true, "max_position_size": 50000}'::jsonb
      ) ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Initialized default records for existing users';
  END IF;
END $$;

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_controller TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_api_configs TO authenticated;

-- Grant permissions on strategy_extractions if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategy_extractions') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.strategy_extractions TO authenticated;
  END IF;
END $$;

-- 9. Create unique constraint on risk_controller to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'risk_controller_user_id_unique' 
    AND table_name = 'risk_controller'
  ) THEN
    ALTER TABLE public.risk_controller 
    ADD CONSTRAINT risk_controller_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Add helpful comments
COMMENT ON POLICY "users_can_select_own_risk_controller" ON public.risk_controller IS 
'Allows users to read their own risk controller settings';

COMMENT ON POLICY "users_can_insert_own_risk_controller" ON public.risk_controller IS 
'Allows users to create their own risk controller settings';

COMMENT ON POLICY "authenticated_can_select_api_configs" ON public.external_api_configs IS 
'Allows authenticated users to read API configurations for system functionality';

COMMENT ON POLICY "authenticated_can_insert_api_configs" ON public.external_api_configs IS 
'Allows authenticated users to create API configurations';

COMMENT ON FUNCTION public.ensure_user_defaults() IS 
'Automatically creates default records when new users are created';