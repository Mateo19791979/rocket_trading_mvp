-- Location: supabase/migrations/20251001171530_add_shadow_price_anomaly_system.sql
-- Schema Analysis: Existing schema with assets, user_profiles, market_data tables
-- Integration Type: Addition - Shadow Price & Anomaly Detection System
-- Dependencies: assets(id), user_profiles(id)

-- Create detection types enum
CREATE TYPE public.detection_type AS ENUM ('price_spike', 'volume_anomaly', 'spread_deviation', 'latency_alert', 'data_quality');

-- Create provider status enum for shadow prices
CREATE TYPE public.shadow_price_status AS ENUM ('active', 'stale', 'degraded', 'offline');

-- 1. Shadow Prices Core Table
CREATE TABLE public.shadow_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    shadow_price DECIMAL(20,8) NOT NULL,
    vwap_60s DECIMAL(20,8),
    last_trade DECIMAL(20,8),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_stale BOOLEAN DEFAULT false,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Shadow Price Sources Table (for multi-provider aggregation)
CREATE TABLE public.shadow_price_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shadow_price_id UUID REFERENCES public.shadow_prices(id) ON DELETE CASCADE,
    source_provider TEXT NOT NULL,
    weight DECIMAL(5,4) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
    last_tick_time TIMESTAMPTZ,
    tick_count INTEGER DEFAULT 0,
    status public.shadow_price_status DEFAULT 'active'::public.shadow_price_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Anomaly Detection Results Table
CREATE TABLE public.anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    detection_type public.detection_type NOT NULL,
    provider_name TEXT,
    z_score DECIMAL(10,6),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    threshold_value DECIMAL(20,8),
    actual_value DECIMAL(20,8),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Anomaly Thresholds Configuration Table
CREATE TABLE public.anomaly_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    detection_type public.detection_type NOT NULL,
    threshold_value DECIMAL(20,8) NOT NULL,
    z_score_threshold DECIMAL(6,3) DEFAULT 2.5,
    confidence_threshold DECIMAL(5,4) DEFAULT 0.8,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(asset_id, detection_type)
);

-- 5. Essential Indexes
CREATE INDEX idx_shadow_prices_asset_id ON public.shadow_prices(asset_id);
CREATE INDEX idx_shadow_prices_updated_at ON public.shadow_prices(updated_at);
CREATE INDEX idx_shadow_prices_is_stale ON public.shadow_prices(is_stale);

CREATE INDEX idx_shadow_price_sources_shadow_price_id ON public.shadow_price_sources(shadow_price_id);
CREATE INDEX idx_shadow_price_sources_provider ON public.shadow_price_sources(source_provider);

CREATE INDEX idx_anomaly_detections_asset_id ON public.anomaly_detections(asset_id);
CREATE INDEX idx_anomaly_detections_type ON public.anomaly_detections(detection_type);
CREATE INDEX idx_anomaly_detections_provider ON public.anomaly_detections(provider_name);
CREATE INDEX idx_anomaly_detections_detected_at ON public.anomaly_detections(detected_at);
CREATE INDEX idx_anomaly_detections_is_resolved ON public.anomaly_detections(is_resolved);

CREATE INDEX idx_anomaly_thresholds_asset_type ON public.anomaly_thresholds(asset_id, detection_type);

-- 6. Enable RLS
ALTER TABLE public.shadow_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_price_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_thresholds ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies - Pattern 4 (Public Read, System Write)
-- Shadow prices are readable by all authenticated users for analysis
CREATE POLICY "public_can_read_shadow_prices"
ON public.shadow_prices
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "system_can_manage_shadow_prices"
ON public.shadow_prices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "public_can_read_shadow_price_sources"
ON public.shadow_price_sources
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "system_can_manage_shadow_price_sources"
ON public.shadow_price_sources
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anomaly detections - readable by authenticated users
CREATE POLICY "public_can_read_anomaly_detections"
ON public.anomaly_detections
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "system_can_manage_anomaly_detections"
ON public.anomaly_detections
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anomaly thresholds - admin configurable
CREATE POLICY "admins_can_manage_anomaly_thresholds"
ON public.anomaly_thresholds
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_can_read_anomaly_thresholds"
ON public.anomaly_thresholds
FOR SELECT
TO authenticated
USING (true);

-- 8. Utility Functions
CREATE OR REPLACE FUNCTION public.update_shadow_price_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER shadow_prices_updated_at
    BEFORE UPDATE ON public.shadow_prices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_shadow_price_timestamp();

CREATE OR REPLACE FUNCTION public.mark_stale_shadow_prices()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stale_count INTEGER := 0;
BEGIN
    -- Mark shadow prices as stale if not updated in last 5 minutes
    UPDATE public.shadow_prices
    SET is_stale = true
    WHERE updated_at < (CURRENT_TIMESTAMP - INTERVAL '5 minutes')
    AND is_stale = false;
    
    GET DIAGNOSTICS stale_count = ROW_COUNT;
    
    RETURN stale_count;
END;
$$;

-- 9. Sample Data for Testing
DO $$
DECLARE
    sample_asset_id UUID;
    shadow_price_id UUID;
BEGIN
    -- Get existing asset for testing
    SELECT id INTO sample_asset_id FROM public.assets LIMIT 1;
    
    IF sample_asset_id IS NOT NULL THEN
        -- Create sample shadow price
        INSERT INTO public.shadow_prices (
            id,
            asset_id, 
            shadow_price, 
            vwap_60s, 
            last_trade, 
            confidence_score,
            is_stale
        ) VALUES (
            gen_random_uuid(),
            sample_asset_id,
            150.25,
            149.80,
            150.10,
            0.95,
            false
        ) RETURNING id INTO shadow_price_id;
        
        -- Create sample shadow price sources
        INSERT INTO public.shadow_price_sources (
            shadow_price_id,
            source_provider,
            weight,
            last_tick_time,
            tick_count,
            status
        ) VALUES
            (shadow_price_id, 'finnhub', 0.4, CURRENT_TIMESTAMP, 125, 'active'::public.shadow_price_status),
            (shadow_price_id, 'alpha_vantage', 0.3, CURRENT_TIMESTAMP, 98, 'active'::public.shadow_price_status),
            (shadow_price_id, 'twelve_data', 0.3, CURRENT_TIMESTAMP, 87, 'active'::public.shadow_price_status);
        
        -- Create sample anomaly detection
        INSERT INTO public.anomaly_detections (
            asset_id,
            detection_type,
            provider_name,
            z_score,
            confidence_score,
            threshold_value,
            actual_value,
            is_resolved,
            details
        ) VALUES (
            sample_asset_id,
            'price_spike'::public.detection_type,
            'finnhub',
            3.2,
            0.88,
            2.5,
            152.75,
            false,
            '{"spike_duration": "15s", "baseline_price": 150.25}'::jsonb
        );
        
        -- Create sample anomaly thresholds
        INSERT INTO public.anomaly_thresholds (
            asset_id,
            detection_type,
            threshold_value,
            z_score_threshold,
            confidence_threshold,
            is_active
        ) VALUES
            (sample_asset_id, 'price_spike'::public.detection_type, 2.5, 2.5, 0.8, true),
            (sample_asset_id, 'volume_anomaly'::public.detection_type, 3.0, 3.0, 0.85, true),
            (sample_asset_id, 'spread_deviation'::public.detection_type, 2.0, 2.0, 0.75, true);
    ELSE
        RAISE NOTICE 'No existing assets found. Please ensure assets table has data before running shadow price system.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample shadow price data: %', SQLERRM;
END $$;

-- 10. Cleanup function for test data
CREATE OR REPLACE FUNCTION public.cleanup_shadow_price_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean up in dependency order
    DELETE FROM public.shadow_price_sources 
    WHERE source_provider IN ('finnhub', 'alpha_vantage', 'twelve_data');
    
    DELETE FROM public.anomaly_detections 
    WHERE provider_name IN ('finnhub', 'alpha_vantage', 'twelve_data')
    OR details->>'baseline_price' IS NOT NULL;
    
    DELETE FROM public.anomaly_thresholds 
    WHERE threshold_value IN (2.5, 3.0, 2.0);
    
    DELETE FROM public.shadow_prices 
    WHERE shadow_price = 150.25;
    
    RAISE NOTICE 'Shadow price test data cleaned up successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error cleaning shadow price test data: %', SQLERRM;
END $$;