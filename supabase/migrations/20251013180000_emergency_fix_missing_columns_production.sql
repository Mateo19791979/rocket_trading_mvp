-- EMERGENCY FIX: Production-ready migration to handle missing columns
-- This fixes the "column positions.is_active does not exist" error
-- Implements safe column additions with comprehensive error handling

-- 1. Safely add missing columns to positions table
DO $$
BEGIN
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.positions 
    ADD COLUMN is_active BOOLEAN DEFAULT true;
    
    -- Update existing rows to have is_active = true
    UPDATE public.positions 
    SET is_active = true 
    WHERE is_active IS NULL;
    
    -- Add NOT NULL constraint after setting default values
    ALTER TABLE public.positions 
    ALTER COLUMN is_active SET NOT NULL;
    
    RAISE NOTICE 'Added is_active column to positions table';
  ELSE
    RAISE NOTICE 'Column is_active already exists in positions table';
  END IF;

  -- Add source column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.positions 
    ADD COLUMN source TEXT DEFAULT 'manual';
    
    -- Update existing rows
    UPDATE public.positions 
    SET source = 'manual' 
    WHERE source IS NULL;
    
    RAISE NOTICE 'Added source column to positions table';
  ELSE
    RAISE NOTICE 'Column source already exists in positions table';
  END IF;

  -- Add position_type column if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'position_type'
  ) THEN
    ALTER TABLE public.positions 
    ADD COLUMN position_type TEXT DEFAULT 'long';
    
    -- Update existing rows
    UPDATE public.positions 
    SET position_type = 'long' 
    WHERE position_type IS NULL;
    
    RAISE NOTICE 'Added position_type column to positions table';
  ELSE
    RAISE NOTICE 'Column position_type already exists in positions table';
  END IF;
END $$;

-- 2. Handle position_status enum and column safely
DO $$
BEGIN
  -- Check if position_status enum exists and create it if needed
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'position_status') THEN
    CREATE TYPE public.position_status AS ENUM ('active', 'closed', 'pending');
    RAISE NOTICE 'Created position_status enum';
  ELSE
    -- Add missing enum values if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON t.oid = e.enumtypid 
      WHERE t.typname = 'position_status' AND e.enumlabel = 'active'
    ) THEN
      ALTER TYPE public.position_status ADD VALUE 'active';
      RAISE NOTICE 'Added active value to position_status enum';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON t.oid = e.enumtypid 
      WHERE t.typname = 'position_status' AND e.enumlabel = 'closed'
    ) THEN
      ALTER TYPE public.position_status ADD VALUE 'closed';
      RAISE NOTICE 'Added closed value to position_status enum';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON t.oid = e.enumtypid 
      WHERE t.typname = 'position_status' AND e.enumlabel = 'pending'
    ) THEN
      ALTER TYPE public.position_status ADD VALUE 'pending';
      RAISE NOTICE 'Added pending value to position_status enum';
    END IF;
  END IF;

  -- Add position_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'position_status'
  ) THEN
    -- Add as TEXT first to avoid enum transaction issues
    ALTER TABLE public.positions 
    ADD COLUMN position_status TEXT DEFAULT 'active';
    
    -- Update any NULL values
    UPDATE public.positions 
    SET position_status = 'active' 
    WHERE position_status IS NULL;
    
    RAISE NOTICE 'Added position_status column as TEXT to positions table';
  END IF;
END $$;

-- 3. Convert position_status to enum type in separate transaction block
DO $$
BEGIN
  -- Check if position_status column exists and is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'position_status'
    AND data_type = 'text'
  ) THEN
    -- Convert TEXT column to enum type using safe casting
    ALTER TABLE public.positions 
    ALTER COLUMN position_status TYPE public.position_status 
    USING CASE 
      WHEN position_status = 'active' THEN 'active'::public.position_status
      WHEN position_status = 'closed' THEN 'closed'::public.position_status  
      WHEN position_status = 'pending' THEN 'pending'::public.position_status
      ELSE 'active'::public.position_status
    END;
    
    -- Set enum default
    ALTER TABLE public.positions 
    ALTER COLUMN position_status SET DEFAULT 'active'::public.position_status;
    
    RAISE NOTICE 'Converted position_status column to enum type';
  END IF;
END $$;

-- 4. Create performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_positions_is_active 
ON public.positions(is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_positions_source_is_active 
ON public.positions(source, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_positions_status_active 
ON public.positions(position_status) 
WHERE position_status = 'active';

CREATE INDEX IF NOT EXISTS idx_positions_user_active 
ON public.positions(user_id, is_active) 
WHERE is_active = true;

-- 5. Add helpful column comments for documentation
COMMENT ON COLUMN public.positions.is_active IS 'Indicates if position is currently active and should be included in portfolio calculations';
COMMENT ON COLUMN public.positions.position_status IS 'Status of the position using enum: active, closed, pending';
COMMENT ON COLUMN public.positions.position_type IS 'Type of position: long, short, etc.';
COMMENT ON COLUMN public.positions.source IS 'Source of position data: manual, ibkr, api, etc.';

-- 6. Ensure user_profiles has broker_settings and trading_preferences columns for broker flag functionality
DO $$
BEGIN
  -- Add broker_settings JSONB column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'broker_settings'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN broker_settings JSONB DEFAULT '{"ibkr_enabled": false, "live_trading_approved": false}';
    
    RAISE NOTICE 'Added broker_settings column to user_profiles table';
  END IF;

  -- Add trading_preferences JSONB column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'trading_preferences'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN trading_preferences JSONB DEFAULT '{"paper_mode": true, "risk_level": "moderate"}';
    
    RAISE NOTICE 'Added trading_preferences column to user_profiles table';
  END IF;
END $$;

-- 7. Update existing user profiles with default broker settings
UPDATE public.user_profiles 
SET 
  broker_settings = '{"ibkr_enabled": false, "live_trading_approved": false}',
  trading_preferences = '{"paper_mode": true, "risk_level": "moderate"}'
WHERE 
  broker_settings IS NULL 
  OR trading_preferences IS NULL;

-- Migration completed successfully
SELECT 
  'Emergency migration completed at ' || now() || 
  ' - Fixed missing columns: is_active, source, position_type, position_status, broker_settings, trading_preferences' 
AS migration_status;