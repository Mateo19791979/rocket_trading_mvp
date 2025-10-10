-- Location: supabase/migrations/20250104091226_add_external_sources_state_table.sql
-- Schema Analysis: Complex trading platform with existing user management, market data, and provider systems
-- Integration Type: New module addition for external market intelligence tracking
-- Dependencies: None - standalone table for external source state management

-- Create external_sources_state table for CMV & Wilshire change detection
CREATE TABLE IF NOT EXISTS public.external_sources_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,          -- "cmv.buffett", "cmv.pe10", "wilshire.methodology"
    fingerprint TEXT NOT NULL,     -- hash du payload normalisé
    payload JSONB NOT NULL,        -- dernier contenu
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (source)
);

-- Add index for efficient source lookups
CREATE INDEX idx_external_sources_state_source ON public.external_sources_state(source);
CREATE INDEX idx_external_sources_state_updated_at ON public.external_sources_state(updated_at);

-- Enable RLS
ALTER TABLE public.external_sources_state ENABLE ROW LEVEL SECURITY;

-- Pattern 4: Public read access for external data monitoring
CREATE POLICY "public_can_read_external_sources_state"
ON public.external_sources_state
FOR SELECT
TO public
USING (true);

-- Admin management via auth metadata (Pattern 6A)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE POLICY "admin_manage_external_sources_state"
ON public.external_sources_state
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Mock data for testing
DO $$
DECLARE
    buffett_id UUID := gen_random_uuid();
    pe10_id UUID := gen_random_uuid();
    wilshire_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.external_sources_state (id, source, fingerprint, payload) VALUES
        (buffett_id, 'cmv.buffett', '1a2b3c4d', '{"model":"buffett","ratio_pct":217,"updated_at":"January 15, 2025","source":"CMV","url":"https://www.currentmarketvaluation.com/models/buffett-indicator.php"}'::jsonb),
        (pe10_id, 'cmv.pe10', '5e6f7g8h', '{"model":"pe10","cape":33.2,"zscore_sd":2.1,"stance":"Overvalued","source":"CMV","url":"https://www.currentmarketvaluation.com/models/price-earnings.php"}'::jsonb),
        (wilshire_id, 'wilshire.methodology', '9i0j1k2l', '{"page":"methodology_ft-w5000","title":"FT Wilshire 5000 Index Series","source":"Wilshire","url":"https://www.wilshireindexes.com/index-documents/ft-wilshire-5000-index-series"}'::jsonb);
END $$;