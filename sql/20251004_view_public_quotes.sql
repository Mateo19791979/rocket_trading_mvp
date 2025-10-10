-- Create safe public view for quotes data
CREATE OR REPLACE VIEW public.v_quotes_last AS
SELECT 
    symbol,
    'market' as provider, -- Generic provider name
    price,
    updated_at as ts,
    volume,
    change_percent,
    market_cap
FROM market_data 
WHERE updated_at > NOW() - INTERVAL '1 hour'  -- Only recent data
ORDER BY updated_at DESC;

-- Enable RLS on the view
ALTER TABLE public.v_quotes_last ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS v_quotes_last_select ON public.v_quotes_last;

-- Create public access policy for the view
CREATE POLICY v_quotes_last_select
ON public.v_quotes_last
FOR SELECT 
TO anon, authenticated
USING (true);

-- Grant access to the view
GRANT SELECT ON public.v_quotes_last TO anon, authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_v_quotes_last_symbol_ts 
ON market_data (symbol, updated_at DESC)
WHERE updated_at > NOW() - INTERVAL '1 hour';

-- Add helpful comment
COMMENT ON VIEW public.v_quotes_last IS 'Public-safe view of recent market quotes - no sensitive provider data exposed';