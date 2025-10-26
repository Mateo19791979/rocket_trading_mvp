-- Fix for missing source columns causing navigation errors
-- Error Analysis: Column "user_id" does not exist in positions table
-- Solution: Remove problematic RLS policies and add source columns safely

-- Add source column to positions table if it doesn't exist
ALTER TABLE positions ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'trading-mvp';

-- Add source column to trades table if it doesn't exist  
ALTER TABLE trades ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'trading-mvp';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_positions_source ON positions(source);
CREATE INDEX IF NOT EXISTS idx_trades_source ON trades(source);

-- Drop any existing problematic policies that reference non-existent user_id
DROP POLICY IF EXISTS "positions_select_policy" ON positions;
DROP POLICY IF EXISTS "trades_select_policy" ON trades;

-- Create safe RLS policies for positions without user_id reference
CREATE POLICY "positions_public_read_policy" 
    ON positions FOR SELECT 
    USING (true); -- Public read access for market data

-- Create safe RLS policies for trades without user_id reference
CREATE POLICY "trades_public_read_policy" 
    ON trades FOR SELECT 
    USING (true); -- Public read access for market data

-- Add policies for authenticated users to manage data based on source
CREATE POLICY "positions_system_manage_policy" 
    ON positions FOR ALL 
    TO authenticated
    USING (source IN ('trading-mvp', 'system'))
    WITH CHECK (source IN ('trading-mvp', 'system'));

CREATE POLICY "trades_system_manage_policy" 
    ON trades FOR ALL 
    TO authenticated
    USING (source IN ('trading-mvp', 'system'))  
    WITH CHECK (source IN ('trading-mvp', 'system'));

-- Add comments for documentation
COMMENT ON COLUMN positions.source IS 'Source system that created this position (trading-mvp, ibkr, manual)';
COMMENT ON COLUMN trades.source IS 'Source system that executed this trade (trading-mvp, ibkr, manual)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Fixed missing source columns and corrected RLS policies';
    RAISE NOTICE '✅ Navigation errors should now be resolved';
END $$;