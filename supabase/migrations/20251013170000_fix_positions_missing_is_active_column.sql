-- MIGRATION CRITIQUE : Fix positions.is_active manquante + position_status enum issue
-- Cette colonne est utilisée dans portfolioService.js et d'autres services
-- ERROR 55P04: unsafe use of new value "active" of enum type position_status
-- SOLUTION: Restructure to avoid using new enum values in same transaction

-- 1. Check if position_status enum exists and create/extend it
DO $$
BEGIN
  -- Check if position_status enum exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'position_status') THEN
    -- Add 'active' value to existing enum if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON t.oid = e.enumtypid 
      WHERE t.typname = 'position_status' AND e.enumlabel = 'active'
    ) THEN
      ALTER TYPE public.position_status ADD VALUE 'active';
    END IF;
    
    -- Add other values if missing
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON t.oid = e.enumtypid 
      WHERE t.typname = 'position_status' AND e.enumlabel = 'closed'
    ) THEN
      ALTER TYPE public.position_status ADD VALUE 'closed';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e 
      JOIN pg_type t ON t.oid = e.enumtypid 
      WHERE t.typname = 'position_status' AND e.enumlabel = 'pending'
    ) THEN
      ALTER TYPE public.position_status ADD VALUE 'pending';
    END IF;
  ELSE
    -- Create position_status enum if it doesn't exist
    CREATE TYPE public.position_status AS ENUM ('active', 'closed', 'pending');
  END IF;
END $$;

-- 2. Add missing columns first (without enum default values that might fail)
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS position_type TEXT DEFAULT 'long',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- 3. Handle position_status column carefully - add as TEXT first if enum fails
DO $$
BEGIN
  -- Check if position_status column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'position_status'
  ) THEN
    -- Column doesn't exist, add it as TEXT first to avoid enum issues
    ALTER TABLE public.positions 
    ADD COLUMN position_status TEXT DEFAULT 'active';
  END IF;
END $$;

-- 4. Convert position_status column to enum type if it's currently TEXT
DO $$
BEGIN
  -- Check if position_status column exists and is TEXT type (needs conversion)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'positions' 
    AND column_name = 'position_status'
    AND data_type = 'text'
  ) THEN
    -- Update any NULL values to 'active' before conversion
    UPDATE public.positions 
    SET position_status = 'active' 
    WHERE position_status IS NULL;
    
    -- Convert existing TEXT column to enum using safe casting
    ALTER TABLE public.positions 
    ALTER COLUMN position_status TYPE public.position_status 
    USING CASE 
      WHEN position_status = 'active' THEN 'active'::public.position_status
      WHEN position_status = 'closed' THEN 'closed'::public.position_status  
      WHEN position_status = 'pending' THEN 'pending'::public.position_status
      ELSE 'active'::public.position_status
    END;
  END IF;
END $$;

-- 5. Set proper defaults for enum column after conversion
ALTER TABLE public.positions 
ALTER COLUMN position_status SET DEFAULT 'active'::public.position_status;

-- 6. Create indexes for performance on frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_positions_is_active 
ON public.positions(is_active);

CREATE INDEX IF NOT EXISTS idx_positions_source_is_active 
ON public.positions(source, is_active) 
WHERE is_active = true;

-- 7. Update existing positions to have consistent values
UPDATE public.positions 
SET is_active = true 
WHERE is_active IS NULL;

-- 8. Add NOT NULL constraint after ensuring all values are set
ALTER TABLE public.positions 
ALTER COLUMN is_active SET NOT NULL;

-- 9. Create index for position_status (using text comparison to avoid enum issues)
CREATE INDEX IF NOT EXISTS idx_positions_status_active 
ON public.positions(position_status) 
WHERE position_status::text = 'active';

-- 10. Ensure position_status column has valid values
UPDATE public.positions 
SET position_status = 'active'::public.position_status 
WHERE position_status IS NULL;

-- 11. Add helpful comments explaining the columns
COMMENT ON COLUMN public.positions.is_active IS 'Indicates if position is currently active and should be included in portfolio calculations';
COMMENT ON COLUMN public.positions.position_status IS 'Status of the position using enum: active, closed, pending';
COMMENT ON COLUMN public.positions.position_type IS 'Type of position: long, short, etc.';
COMMENT ON COLUMN public.positions.source IS 'Source of position data: manual, ibkr, api, etc.';

-- source: api
-- user: 99566e02-0f29-4f09-bc25-39d802c96d65
-- date: 2025-10-13T16:51:30.611054