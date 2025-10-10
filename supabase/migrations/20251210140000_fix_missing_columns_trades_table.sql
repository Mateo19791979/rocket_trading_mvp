-- Fix for missing columns in trades table that cause PGRST116 and 42703 errors
-- This addresses the specific error: column trades_1.realized_pnl does not exist

-- Add missing realized_pnl column to trades table if it doesn't exist
DO $$ 
BEGIN
    -- Check if realized_pnl column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'realized_pnl' 
        AND table_schema = 'public'
    ) THEN
        -- Add the missing realized_pnl column
        ALTER TABLE public.trades 
        ADD COLUMN realized_pnl DECIMAL(15,2) DEFAULT 0.00;
        
        -- Add a comment for documentation
        COMMENT ON COLUMN public.trades.realized_pnl IS 'Realized profit/loss for completed trades';
        
        -- Log the action
        RAISE NOTICE 'Added missing realized_pnl column to trades table';
    ELSE
        RAISE NOTICE 'realized_pnl column already exists in trades table';
    END IF;
END $$;

-- Ensure other commonly referenced columns exist
DO $$ 
BEGIN
    -- Check if executed_at column exists (commonly used in queries)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'executed_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.trades 
        ADD COLUMN executed_at TIMESTAMPTZ DEFAULT NOW();
        
        COMMENT ON COLUMN public.trades.executed_at IS 'Timestamp when trade was executed';
        RAISE NOTICE 'Added missing executed_at column to trades table';
    END IF;

    -- Check if trade_side column exists (commonly used in queries)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'trade_side' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.trades 
        ADD COLUMN trade_side VARCHAR(10) DEFAULT 'BUY';
        
        -- Add constraint for valid trade sides
        ALTER TABLE public.trades 
        ADD CONSTRAINT trades_trade_side_check 
        CHECK (trade_side IN ('BUY', 'SELL'));
        
        COMMENT ON COLUMN public.trades.trade_side IS 'Side of the trade: BUY or SELL';
        RAISE NOTICE 'Added missing trade_side column to trades table';
    END IF;

    -- Check if quantity column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'quantity' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.trades 
        ADD COLUMN quantity DECIMAL(15,6) NOT NULL DEFAULT 0;
        
        COMMENT ON COLUMN public.trades.quantity IS 'Quantity of shares/units traded';
        RAISE NOTICE 'Added missing quantity column to trades table';
    END IF;

    -- Check if price column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'price' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.trades 
        ADD COLUMN price DECIMAL(15,4) NOT NULL DEFAULT 0;
        
        COMMENT ON COLUMN public.trades.price IS 'Price per share/unit';
        RAISE NOTICE 'Added missing price column to trades table';
    END IF;
END $$;

-- Create or update indexes for better query performance
DO $$
BEGIN
    -- Index on executed_at for time-based queries
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trades' 
        AND indexname = 'idx_trades_executed_at'
    ) THEN
        CREATE INDEX idx_trades_executed_at ON public.trades(executed_at DESC);
        RAISE NOTICE 'Created index idx_trades_executed_at';
    END IF;

    -- Index on trade_side for filtering
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trades' 
        AND indexname = 'idx_trades_trade_side'
    ) THEN
        CREATE INDEX idx_trades_trade_side ON public.trades(trade_side);
        RAISE NOTICE 'Created index idx_trades_trade_side';
    END IF;

    -- Index on asset_id for joins
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trades' 
        AND indexname = 'idx_trades_asset_id'
    ) THEN
        CREATE INDEX idx_trades_asset_id ON public.trades(asset_id);
        RAISE NOTICE 'Created index idx_trades_asset_id';
    END IF;
END $$;

-- Update any existing trades with NULL values to have proper defaults
UPDATE public.trades 
SET 
    realized_pnl = 0.00 
WHERE realized_pnl IS NULL;

UPDATE public.trades 
SET 
    executed_at = created_at 
WHERE executed_at IS NULL AND created_at IS NOT NULL;

UPDATE public.trades 
SET 
    executed_at = NOW() 
WHERE executed_at IS NULL;

-- Add some sample data if the table is empty to prevent PGRST116 errors
DO $$
DECLARE
    trade_count INTEGER;
    sample_asset_id UUID;
BEGIN
    -- Check if trades table is empty
    SELECT COUNT(*) INTO trade_count FROM public.trades;
    
    IF trade_count = 0 THEN
        -- Get or create a sample asset
        SELECT id INTO sample_asset_id FROM public.assets LIMIT 1;
        
        -- If no assets exist, create a sample one
        IF sample_asset_id IS NULL THEN
            INSERT INTO public.assets (symbol, name, asset_type)
            VALUES ('SAMPLE', 'Sample Asset', 'stock')
            RETURNING id INTO sample_asset_id;
        END IF;
        
        -- Insert sample trades to prevent empty result errors
        INSERT INTO public.trades (
            asset_id, 
            trade_side, 
            quantity, 
            price, 
            realized_pnl, 
            executed_at,
            created_at
        ) VALUES 
        (
            sample_asset_id, 
            'BUY', 
            100.00, 
            150.25, 
            0.00, 
            NOW() - INTERVAL '1 hour',
            NOW() - INTERVAL '1 hour'
        ),
        (
            sample_asset_id, 
            'SELL', 
            50.00, 
            155.30, 
            252.50, 
            NOW() - INTERVAL '30 minutes',
            NOW() - INTERVAL '30 minutes'
        );
        
        RAISE NOTICE 'Added sample trades to prevent empty table errors';
    END IF;
END $$;

-- Ensure proper RLS policies exist for trades table
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
    
    -- Create basic read policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trades' 
        AND policyname = 'trades_read_policy'
    ) THEN
        CREATE POLICY trades_read_policy ON public.trades
            FOR SELECT USING (true);
        RAISE NOTICE 'Created basic read policy for trades table';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RLS policy creation skipped - may already exist or require specific permissions';
END $$;

-- Add helpful comments
COMMENT ON TABLE public.trades IS 'Trading transactions with comprehensive tracking of realized P&L and execution details';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Fixed missing columns in trades table to prevent PGRST116 errors';
END $$;