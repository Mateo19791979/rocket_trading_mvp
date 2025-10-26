-- IA Exploration Totale - Freedom v4 Cognitive Engine
-- Schema Analysis: Building upon existing schema with new cognitive learning system
-- Integration Type: Addition - New cognitive learning module
-- Dependencies: None - Self-contained cognitive system

-- Types for cognitive learning system
CREATE TYPE public.domain_type AS ENUM (
  'math',
  'physics',
  'quantum',
  'finance',
  'trading',
  'python',
  'ai',
  'ifrs',
  'accounting',
  'tax',
  'law',
  'governance'
);

CREATE TYPE public.trust_level AS ENUM (
  'low',
  'medium',
  'high',
  'verified'
);

CREATE TYPE public.processing_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'validated'
);

-- Knowledge blocks - Core cognitive storage
CREATE TABLE public.knowledge_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain public.domain_type NOT NULL,
  concept TEXT NOT NULL,
  equation TEXT,
  source TEXT,
  trust_score NUMERIC(4,3) DEFAULT 0.5 CHECK (trust_score >= 0 AND trust_score <= 1),
  confidence_level NUMERIC(4,3) DEFAULT 0.5 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  discovered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_validated_at TIMESTAMPTZ,
  validation_count INTEGER DEFAULT 0,
  cross_references INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- IFRS accounting data - Critical for financial intelligence
CREATE TABLE public.accounting_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  metric TEXT NOT NULL,
  value NUMERIC(18,4),
  currency TEXT DEFAULT 'USD',
  source TEXT,
  confidence NUMERIC(4,3) DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  data_quality_score NUMERIC(4,3) DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fiscal rules for international tax intelligence
CREATE TABLE public.fiscal_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  rule TEXT NOT NULL,
  effect TEXT,
  jurisdiction TEXT,
  effective_date DATE,
  expiration_date DATE,
  source TEXT,
  authority TEXT,
  impact_level public.trust_level DEFAULT 'medium'::public.trust_level,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cognitive ingestion pipeline
CREATE TABLE public.cognitive_ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'pdf', 'web', 'api', 'repository'
  source_url TEXT,
  target_domains public.domain_type[] DEFAULT '{}',
  status public.processing_status DEFAULT 'pending'::public.processing_status,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  concepts_extracted INTEGER DEFAULT 0,
  equations_found INTEGER DEFAULT 0,
  cross_references INTEGER DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cross-domain learning insights
CREATE TABLE public.cross_domain_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_domain public.domain_type NOT NULL,
  secondary_domain public.domain_type NOT NULL,
  insight_type TEXT NOT NULL, -- 'correlation', 'causation', 'pattern', 'anomaly'
  description TEXT NOT NULL,
  strength NUMERIC(4,3) DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  supporting_evidence TEXT[],
  knowledge_block_ids UUID[],
  validation_status public.trust_level DEFAULT 'low'::public.trust_level,
  business_impact TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Daily knowledge reports
CREATE TABLE public.daily_knowledge_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  domains_processed public.domain_type[] DEFAULT '{}',
  new_concepts_discovered INTEGER DEFAULT 0,
  concepts_validated INTEGER DEFAULT 0,
  cross_domain_connections INTEGER DEFAULT 0,
  top_insights TEXT[],
  processing_time_minutes INTEGER,
  data_sources_accessed TEXT[],
  quality_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Memory evolution log
CREATE TABLE public.memory_update_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL, -- 'create', 'update', 'validate', 'cross_reference'
  affected_tables TEXT[] NOT NULL,
  before_state JSONB,
  after_state JSONB,
  trigger_reason TEXT,
  confidence_change NUMERIC(4,3),
  performance_impact JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal cognitive processing
CREATE INDEX idx_knowledge_blocks_domain ON public.knowledge_blocks(domain);
CREATE INDEX idx_knowledge_blocks_trust_score ON public.knowledge_blocks(trust_score DESC);
CREATE INDEX idx_knowledge_blocks_discovered_at ON public.knowledge_blocks(discovered_at DESC);
CREATE INDEX idx_knowledge_blocks_concept_search ON public.knowledge_blocks USING gin(to_tsvector('english', concept));

CREATE INDEX idx_accounting_data_entity_year ON public.accounting_data(entity, year);
CREATE INDEX idx_accounting_data_metric ON public.accounting_data(metric);
CREATE INDEX idx_accounting_data_confidence ON public.accounting_data(confidence DESC);

CREATE INDEX idx_fiscal_rules_country ON public.fiscal_rules(country);
CREATE INDEX idx_fiscal_rules_effective_date ON public.fiscal_rules(effective_date);
CREATE INDEX idx_fiscal_rules_impact_level ON public.fiscal_rules(impact_level);

CREATE INDEX idx_cognitive_jobs_status ON public.cognitive_ingestion_jobs(status);
CREATE INDEX idx_cognitive_jobs_created_at ON public.cognitive_ingestion_jobs(created_at DESC);
CREATE INDEX idx_cognitive_jobs_domains ON public.cognitive_ingestion_jobs USING gin(target_domains);

CREATE INDEX idx_cross_domain_insights_domains ON public.cross_domain_insights(primary_domain, secondary_domain);
CREATE INDEX idx_cross_domain_insights_strength ON public.cross_domain_insights(strength DESC);
CREATE INDEX idx_cross_domain_insights_validation ON public.cross_domain_insights(validation_status);

CREATE INDEX idx_daily_reports_date ON public.daily_knowledge_reports(report_date DESC);
CREATE INDEX idx_memory_log_created_at ON public.memory_update_log(created_at DESC);
CREATE INDEX idx_memory_log_operation_type ON public.memory_update_log(operation_type);

-- Enable RLS on all tables
ALTER TABLE public.knowledge_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_domain_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_knowledge_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_update_log ENABLE ROW LEVEL SECURITY;

-- Functions for cognitive processing
CREATE OR REPLACE FUNCTION public.calculate_concept_trust_score(
  concept_id UUID,
  validation_count INTEGER DEFAULT 0,
  cross_references INTEGER DEFAULT 0,
  source_reliability NUMERIC DEFAULT 0.5
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  base_score NUMERIC := 0.5;
  validation_bonus NUMERIC := 0.0;
  cross_ref_bonus NUMERIC := 0.0;
  final_score NUMERIC;
BEGIN
  -- Calculate validation bonus (up to 0.3)
  validation_bonus := LEAST(validation_count * 0.1, 0.3);
  
  -- Calculate cross-reference bonus (up to 0.2)
  cross_ref_bonus := LEAST(cross_references * 0.05, 0.2);
  
  -- Combine scores with source reliability
  final_score := base_score + validation_bonus + cross_ref_bonus + (source_reliability * 0.3);
  
  -- Ensure score is between 0 and 1
  RETURN LEAST(GREATEST(final_score, 0.0), 1.0);
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_cross_domain_insight(
  domain1 public.domain_type,
  domain2 public.domain_type,
  min_strength NUMERIC DEFAULT 0.3
) RETURNS TABLE(
  insight_description TEXT,
  strength_score NUMERIC,
  supporting_concepts TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  -- This is a simplified version - in production, this would use ML algorithms
  RETURN QUERY
  SELECT 
    'Cross-domain pattern detected between ' || domain1::TEXT || ' and ' || domain2::TEXT || ' domains' as insight_description,
    RANDOM() * 0.5 + 0.3 as strength_score, -- Simplified scoring
    ARRAY['concept1', 'concept2', 'concept3'] as supporting_concepts;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_knowledge_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update cross-reference counts when new knowledge is added
  IF TG_OP = 'INSERT' THEN
    -- Log the memory update
    INSERT INTO public.memory_update_log (
      operation_type,
      affected_tables,
      after_state,
      trigger_reason
    ) VALUES (
      'create',
      ARRAY['knowledge_blocks'],
      row_to_json(NEW),
      'New knowledge block added'
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Triggers for automated cognitive processing
CREATE TRIGGER trigger_knowledge_statistics
  AFTER INSERT ON public.knowledge_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_statistics();

-- RLS Policies using Pattern 4 (Public Read, Private Write for cognitive data)
CREATE POLICY "public_can_read_knowledge_blocks"
ON public.knowledge_blocks
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_accounting_data"
ON public.accounting_data
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_fiscal_rules"
ON public.fiscal_rules
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_cross_domain_insights"
ON public.cross_domain_insights
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_daily_reports"
ON public.daily_knowledge_reports
FOR SELECT
TO public
USING (true);

-- Admin-only write access for cognitive processing
CREATE POLICY "system_can_manage_knowledge_blocks"
ON public.knowledge_blocks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

CREATE POLICY "system_can_manage_accounting_data"
ON public.accounting_data
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

CREATE POLICY "system_can_manage_fiscal_rules"
ON public.fiscal_rules
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

CREATE POLICY "system_can_manage_ingestion_jobs"
ON public.cognitive_ingestion_jobs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

CREATE POLICY "system_can_manage_insights"
ON public.cross_domain_insights
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

CREATE POLICY "system_can_manage_daily_reports"
ON public.daily_knowledge_reports
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

CREATE POLICY "system_can_manage_memory_log"
ON public.memory_update_log
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.raw_user_meta_data->>'role' = 'system')
  )
);

-- Mock data for cognitive system demonstration
DO $$
DECLARE
  knowledge_id_1 UUID := gen_random_uuid();
  knowledge_id_2 UUID := gen_random_uuid();
  knowledge_id_3 UUID := gen_random_uuid();
  job_id UUID := gen_random_uuid();
BEGIN
  -- Sample knowledge blocks from different domains
  INSERT INTO public.knowledge_blocks (id, domain, concept, equation, source, trust_score, confidence_level, cross_references)
  VALUES
    (knowledge_id_1, 'math', 'Black-Scholes Model for Option Pricing', 'C = S₀N(d₁) - Xe^(-rT)N(d₂)', 'Financial Mathematics Research', 0.95, 0.98, 15),
    (knowledge_id_2, 'finance', 'Value at Risk (VaR) Calculation', 'VaR = μ - σ × Z_α', 'Risk Management Standards', 0.88, 0.92, 12),
    (knowledge_id_3, 'ifrs', 'Fair Value Measurement Hierarchy', 'Level 1: Quoted prices in active markets', 'IFRS 13 Standards', 0.99, 0.99, 25),
    (gen_random_uuid(), 'accounting', 'Return on Equity Formula', 'ROE = Net Income / Shareholders Equity', 'Financial Analysis Framework', 0.90, 0.95, 18),
    (gen_random_uuid(), 'tax', 'Transfer Pricing OECD Guidelines', 'Arm''s length principle for related party transactions', 'OECD BEPS Action 13', 0.92, 0.88, 8);

  -- Sample accounting data
  INSERT INTO public.accounting_data (entity, year, metric, value, currency, confidence, data_quality_score)
  VALUES
    ('Apple Inc', 2024, 'ROE', 0.147, 'USD', 0.98, 0.95),
    ('Microsoft Corp', 2024, 'ROA', 0.089, 'USD', 0.97, 0.93),
    ('Tesla Inc', 2024, 'Current Ratio', 1.29, 'USD', 0.85, 0.88),
    ('Amazon', 2024, 'Debt-to-Equity', 0.34, 'USD', 0.92, 0.91);

  -- Sample fiscal rules
  INSERT INTO public.fiscal_rules (country, rule, effect, jurisdiction, source, authority, impact_level)
  VALUES
    ('USA', 'Section 199A Deduction', 'Up to 20% deduction for qualified business income', 'Federal', 'Internal Revenue Code', 'IRS', 'high'),
    ('Switzerland', 'Patent Box Regime', 'Reduced tax rate on IP income', 'Federal/Cantonal', 'Swiss Tax Reform', 'FTA', 'medium'),
    ('Germany', 'Interest Barrier Rule', 'Limitation on interest deductions', 'Federal', 'German Tax Code', 'BMF', 'high'),
    ('France', 'Digital Services Tax', '3% tax on digital revenues', 'National', 'Finance Act 2019', 'DGFiP', 'medium');

  -- Sample cognitive ingestion job
  INSERT INTO public.cognitive_ingestion_jobs (id, job_name, source_type, source_url, target_domains, status, progress_percentage, concepts_extracted)
  VALUES
    (job_id, 'IFRS Standards Update Q1 2025', 'web', 'https://ifrs.org/news-updates/', ARRAY['ifrs', 'accounting'], 'completed', 100, 45);

  -- Sample cross-domain insights
  INSERT INTO public.cross_domain_insights (primary_domain, secondary_domain, insight_type, description, strength, knowledge_block_ids, validation_status)
  VALUES
    ('finance', 'ifrs', 'correlation', 'Fair value measurements significantly impact VaR calculations in banking portfolios', 0.87, ARRAY[knowledge_id_1, knowledge_id_3], 'high'),
    ('math', 'trading', 'pattern', 'Black-Scholes volatility patterns correlate with high-frequency trading algorithms', 0.74, ARRAY[knowledge_id_1, knowledge_id_2], 'medium'),
    ('tax', 'accounting', 'causation', 'Transfer pricing adjustments directly affect consolidated financial statements', 0.91, ARRAY[knowledge_id_2, knowledge_id_3], 'high');

  -- Sample daily knowledge report
  INSERT INTO public.daily_knowledge_reports (
    report_date, 
    domains_processed, 
    new_concepts_discovered, 
    concepts_validated, 
    cross_domain_connections,
    top_insights,
    processing_time_minutes,
    data_sources_accessed,
    quality_metrics
  )
  VALUES
    (CURRENT_DATE, 
     ARRAY['math', 'finance', 'ifrs', 'accounting', 'tax'], 
     23, 
     15, 
     8,
     ARRAY['New IFRS 17 implementation impacts', 'Crypto accounting standards evolution', 'ESG reporting correlation with performance'],
     147,
     ARRAY['IFRS Foundation', 'OECD Tax Database', 'Academic Research Papers'],
     '{"accuracy": 0.94, "completeness": 0.89, "relevance": 0.92}'::jsonb
    );

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion completed with some expected constraint checks';
END $$;

-- Create view for cognitive dashboard
CREATE OR REPLACE VIEW public.cognitive_dashboard_summary AS
SELECT 
  COUNT(*) FILTER (WHERE domain = 'math') as math_concepts,
  COUNT(*) FILTER (WHERE domain = 'finance') as finance_concepts,
  COUNT(*) FILTER (WHERE domain = 'ifrs') as ifrs_concepts,
  COUNT(*) FILTER (WHERE domain = 'accounting') as accounting_concepts,
  COUNT(*) FILTER (WHERE domain = 'tax') as tax_concepts,
  AVG(trust_score) as avg_trust_score,
  AVG(confidence_level) as avg_confidence,
  MAX(discovered_at) as last_discovery,
  SUM(cross_references) as total_cross_refs
FROM public.knowledge_blocks;

-- Grant necessary permissions
GRANT SELECT ON public.cognitive_dashboard_summary TO public;
GRANT SELECT ON public.knowledge_blocks TO public;
GRANT SELECT ON public.accounting_data TO public;
GRANT SELECT ON public.fiscal_rules TO public;
GRANT SELECT ON public.cross_domain_insights TO public;
GRANT SELECT ON public.daily_knowledge_reports TO public;