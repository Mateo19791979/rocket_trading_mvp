-- Add 'volatility_correlation' to extraction_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'extraction_type' AND e.enumlabel = 'volatility_correlation'
    ) THEN
        ALTER TYPE extraction_type ADD VALUE 'volatility_correlation';
    END IF;
END $$;

-- Add 'volatility_correlation' to extraction_type enum if it doesn't exist (alternative approach)
-- This ensures compatibility with the Node.js pipeline code that uses this extraction type
ALTER TYPE extraction_type ADD VALUE IF NOT EXISTS 'volatility_correlation';