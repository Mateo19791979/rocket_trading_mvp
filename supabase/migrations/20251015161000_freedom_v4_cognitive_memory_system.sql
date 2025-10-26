-- Location: supabase/migrations/20251015161000_freedom_v4_cognitive_memory_system.sql
-- Schema Analysis: Creating Freedom v4 cognitive memory and cross-domain learning system
-- Integration Type: NEW MODULE - AI Cognitive Memory System
-- Dependencies: Basic user authentication if exists, otherwise standalone

-- 1. TYPES - Cognitive and Learning Domain Enums
CREATE TYPE public.domain_type AS ENUM (
    'math', 'physics', 'quantum', 'finance', 'trading', 'python', 'ai',
    'ifrs', 'accounting', 'tax', 'law', 'governance', 'computer_science',
    'statistics', 'machine_learning', 'economics', 'risk_management'
);

CREATE TYPE public.knowledge_extraction_status AS ENUM (
    'pending', 'processing', 'extracted', 'validated', 'integrated', 'failed'
);

CREATE TYPE public.trust_level AS ENUM (
    'very_low', 'low', 'medium', 'high', 'very_high', 'verified'
);

CREATE TYPE public.learning_stage AS ENUM (
    'ingestion', 'extraction', 'reconstruction', 'validation', 'storage', 'application'
);

-- 2. CORE TABLES - Knowledge Base and Cognitive Memory

-- Knowledge blocks - core concepts extracted from various sources
CREATE TABLE public.knowledge_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain public.domain_type NOT NULL,
    concept TEXT NOT NULL,
    equation TEXT,
    description TEXT,
    source TEXT,
    source_type TEXT DEFAULT 'document',
    trust_score NUMERIC DEFAULT 0.5 CHECK (trust_score >= 0 AND trust_score <= 1),
    trust_level public.trust_level DEFAULT 'medium',
    discovered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_validated_at TIMESTAMPTZ,
    validation_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cross-domain relationships between concepts
CREATE TABLE public.concept_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_concept_id UUID REFERENCES public.knowledge_blocks(id) ON DELETE CASCADE,
    target_concept_id UUID REFERENCES public.knowledge_blocks(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'prerequisite', 'derived_from', 'applies_to', 'contradicts'
    strength NUMERIC DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
    discovered_by TEXT DEFAULT 'system',
    validation_score NUMERIC DEFAULT 0.5 CHECK (validation_score >= 0 AND validation_score <= 1),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- IFRS and accounting specific data
CREATE TABLE public.accounting_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity TEXT NOT NULL,
    year INTEGER,
    quarter INTEGER CHECK (quarter >= 1 AND quarter <= 4),
    metric TEXT NOT NULL,
    value NUMERIC,
    currency TEXT DEFAULT 'USD',
    source TEXT,
    confidence NUMERIC DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
    ifrs_standard TEXT, -- e.g., 'IFRS 9', 'IFRS 15'
    calculation_method TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- International fiscal rules and regulations
CREATE TABLE public.fiscal_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL,
    jurisdiction TEXT,
    rule_type TEXT NOT NULL, -- 'tax_rate', 'deduction', 'compliance', 'reporting'
    rule_name TEXT NOT NULL,
    description TEXT,
    effect TEXT,
    applicable_from DATE,
    applicable_until DATE,
    source TEXT,
    regulatory_body TEXT, -- 'OCDE', 'SEC', 'FINMA', etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cognitive learning pipeline tracking
CREATE TABLE public.learning_pipeline_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID DEFAULT gen_random_uuid(),
    stage public.learning_stage NOT NULL,
    source_type TEXT, -- 'pdf', 'web', 'api', 'database'
    source_identifier TEXT,
    processing_status public.knowledge_extraction_status DEFAULT 'pending',
    concepts_extracted INTEGER DEFAULT 0,
    relationships_discovered INTEGER DEFAULT 0,
    validation_score NUMERIC,
    error_message TEXT,
    processing_duration_ms INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Daily knowledge reports for AI evolution tracking
CREATE TABLE public.daily_knowledge_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_concepts INTEGER DEFAULT 0,
    new_concepts INTEGER DEFAULT 0,
    validated_concepts INTEGER DEFAULT 0,
    cross_domain_insights INTEGER DEFAULT 0,
    top_domains JSONB DEFAULT '[]'::jsonb, -- array of domain_type
    knowledge_quality_score NUMERIC DEFAULT 0.5,
    learning_velocity NUMERIC DEFAULT 0, -- concepts per day
    memory_consolidation_rate NUMERIC DEFAULT 0, -- validation rate
    meta_insights TEXT[],
    cognitive_milestones TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cross-domain insights tracking evolution of AI understanding
CREATE TABLE public.cross_domain_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type TEXT NOT NULL, -- 'correlation', 'application', 'synthesis', 'breakthrough'
    primary_domain public.domain_type NOT NULL,
    secondary_domain public.domain_type NOT NULL,
    insight_description TEXT NOT NULL,
    mathematical_expression TEXT,
    practical_application TEXT,
    confidence_score NUMERIC DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    validation_attempts INTEGER DEFAULT 0,
    successful_applications INTEGER DEFAULT 0,
    related_concepts UUID[], -- array of knowledge_blocks ids
    discovered_by TEXT DEFAULT 'autonomous_learning',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Memory update logs for tracking cognitive evolution
CREATE TABLE public.memory_update_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    update_type TEXT NOT NULL, -- 'concept_learned', 'relationship_discovered', 'validation_completed'
    affected_concept_id UUID REFERENCES public.knowledge_blocks(id) ON DELETE SET NULL,
    previous_state JSONB,
    new_state JSONB,
    cognitive_trigger TEXT, -- what caused this memory update
    learning_context TEXT,
    evolution_indicators JSONB DEFAULT '{}'::jsonb,
    meta_analysis TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES for performance optimization
CREATE INDEX idx_knowledge_blocks_domain ON public.knowledge_blocks(domain);
CREATE INDEX idx_knowledge_blocks_trust_score ON public.knowledge_blocks(trust_score DESC);
CREATE INDEX idx_knowledge_blocks_discovered_at ON public.knowledge_blocks(discovered_at DESC);
CREATE INDEX idx_knowledge_blocks_concept_search ON public.knowledge_blocks USING gin (to_tsvector('english', concept));

CREATE INDEX idx_concept_relationships_source ON public.concept_relationships(source_concept_id);
CREATE INDEX idx_concept_relationships_target ON public.concept_relationships(target_concept_id);
CREATE INDEX idx_concept_relationships_strength ON public.concept_relationships(strength DESC);

CREATE INDEX idx_accounting_data_entity_year ON public.accounting_data(entity, year DESC);
CREATE INDEX idx_accounting_data_metric ON public.accounting_data(metric);

CREATE INDEX idx_fiscal_rules_country ON public.fiscal_rules(country);
CREATE INDEX idx_fiscal_rules_rule_type ON public.fiscal_rules(rule_type);

CREATE INDEX idx_learning_pipeline_session ON public.learning_pipeline_logs(session_id);
CREATE INDEX idx_learning_pipeline_status ON public.learning_pipeline_logs(processing_status);

CREATE INDEX idx_daily_reports_date ON public.daily_knowledge_reports(report_date DESC);
CREATE INDEX idx_cross_domain_insights_domains ON public.cross_domain_insights(primary_domain, secondary_domain);

-- 4. FUNCTIONS for cognitive memory operations

-- Function to calculate knowledge trust score based on multiple factors
CREATE OR REPLACE FUNCTION public.calculate_knowledge_trust_score(
    concept_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $func$
DECLARE
    validation_weight NUMERIC := 0.4;
    source_weight NUMERIC := 0.3;
    application_weight NUMERIC := 0.2;
    cross_ref_weight NUMERIC := 0.1;
    
    validation_score NUMERIC := 0;
    application_score NUMERIC := 0;
    cross_ref_score NUMERIC := 0;
    source_score NUMERIC := 0;
    final_trust_score NUMERIC;
BEGIN
    -- Get concept data
    SELECT 
        COALESCE(validation_count::NUMERIC / NULLIF(GREATEST(validation_count + 1, 10), 0), 0),
        COALESCE(application_count::NUMERIC / NULLIF(GREATEST(application_count + 1, 5), 0), 0),
        CASE 
            WHEN source_type = 'peer_reviewed' THEN 1.0
            WHEN source_type = 'academic' THEN 0.8
            WHEN source_type = 'official' THEN 0.9
            WHEN source_type = 'industry' THEN 0.6
            ELSE 0.4
        END
    INTO validation_score, application_score, source_score
    FROM public.knowledge_blocks
    WHERE id = concept_id;
    
    -- Calculate cross-reference score
    SELECT COUNT(*)::NUMERIC / NULLIF(GREATEST(COUNT(*) + 1, 5), 0)
    INTO cross_ref_score
    FROM public.concept_relationships
    WHERE source_concept_id = concept_id OR target_concept_id = concept_id;
    
    -- Calculate weighted final score
    final_trust_score := (
        validation_score * validation_weight +
        application_score * application_weight +
        source_score * source_weight +
        cross_ref_score * cross_ref_weight
    );
    
    -- Update the concept's trust score
    UPDATE public.knowledge_blocks
    SET 
        trust_score = LEAST(final_trust_score, 1.0),
        trust_level = CASE
            WHEN final_trust_score >= 0.9 THEN 'verified'::public.trust_level
            WHEN final_trust_score >= 0.7 THEN 'very_high'::public.trust_level
            WHEN final_trust_score >= 0.5 THEN 'high'::public.trust_level
            WHEN final_trust_score >= 0.3 THEN 'medium'::public.trust_level
            WHEN final_trust_score >= 0.1 THEN 'low'::public.trust_level
            ELSE 'very_low'::public.trust_level
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = concept_id;
    
    RETURN LEAST(final_trust_score, 1.0);
END;
$func$;

-- Function to discover cross-domain relationships autonomously
CREATE OR REPLACE FUNCTION public.discover_cross_domain_relationships(
    source_domain public.domain_type,
    target_domain public.domain_type,
    similarity_threshold NUMERIC DEFAULT 0.3
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    relationship_count INTEGER := 0;
    source_concept RECORD;
    target_concept RECORD;
    similarity_score NUMERIC;
BEGIN
    -- Simple conceptual similarity discovery (in real implementation, this would use vector similarity)
    FOR source_concept IN 
        SELECT id, concept, description FROM public.knowledge_blocks 
        WHERE domain = source_domain AND trust_score > 0.5
    LOOP
        FOR target_concept IN 
            SELECT id, concept, description FROM public.knowledge_blocks 
            WHERE domain = target_domain AND trust_score > 0.5 AND id != source_concept.id
        LOOP
            -- Simplified similarity calculation (would be vector-based in production)
            similarity_score := CASE 
                WHEN source_concept.concept ILIKE '%' || split_part(target_concept.concept, ' ', 1) || '%' 
                     OR target_concept.concept ILIKE '%' || split_part(source_concept.concept, ' ', 1) || '%' 
                THEN 0.6
                WHEN source_concept.description ILIKE '%' || split_part(target_concept.concept, ' ', 1) || '%'
                THEN 0.4
                ELSE 0.1
            END;
            
            -- Create relationship if similarity exceeds threshold
            IF similarity_score >= similarity_threshold THEN
                INSERT INTO public.concept_relationships (
                    source_concept_id, target_concept_id, relationship_type, 
                    strength, discovered_by, validation_score
                ) VALUES (
                    source_concept.id, target_concept.id, 'cross_domain_correlation',
                    similarity_score, 'autonomous_discovery', similarity_score
                )
                ON CONFLICT DO NOTHING;
                
                relationship_count := relationship_count + 1;
            END IF;
        END LOOP;
    END LOOP;
    
    RETURN relationship_count;
END;
$func$;

-- Function to generate daily knowledge report
CREATE OR REPLACE FUNCTION public.generate_daily_knowledge_report(
    report_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    report_id UUID;
    total_concepts_count INTEGER;
    new_concepts_count INTEGER;
    validated_concepts_count INTEGER;
    insights_count INTEGER;
    quality_score NUMERIC;
    velocity NUMERIC;
    consolidation_rate NUMERIC;
BEGIN
    -- Calculate metrics
    SELECT COUNT(*) INTO total_concepts_count FROM public.knowledge_blocks;
    
    SELECT COUNT(*) INTO new_concepts_count 
    FROM public.knowledge_blocks 
    WHERE DATE(discovered_at) = report_date;
    
    SELECT COUNT(*) INTO validated_concepts_count
    FROM public.knowledge_blocks
    WHERE DATE(last_validated_at) = report_date;
    
    SELECT COUNT(*) INTO insights_count
    FROM public.cross_domain_insights
    WHERE DATE(created_at) = report_date;
    
    SELECT AVG(trust_score) INTO quality_score FROM public.knowledge_blocks;
    
    -- Calculate learning velocity (concepts per day over last 7 days)
    SELECT COUNT(*)::NUMERIC / 7 INTO velocity
    FROM public.knowledge_blocks
    WHERE discovered_at >= (report_date - INTERVAL '7 days');
    
    -- Calculate memory consolidation rate
    consolidation_rate := CASE 
        WHEN total_concepts_count > 0 
        THEN validated_concepts_count::NUMERIC / total_concepts_count::NUMERIC
        ELSE 0
    END;
    
    -- Insert report
    INSERT INTO public.daily_knowledge_reports (
        report_date, total_concepts, new_concepts, validated_concepts,
        cross_domain_insights, knowledge_quality_score, learning_velocity,
        memory_consolidation_rate
    ) VALUES (
        report_date, total_concepts_count, new_concepts_count, validated_concepts_count,
        insights_count, quality_score, velocity, consolidation_rate
    ) RETURNING id INTO report_id;
    
    RETURN report_id;
END;
$func$;

-- 5. RLS SETUP
ALTER TABLE public.knowledge_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_pipeline_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_knowledge_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_domain_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_update_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES - Public read access for cognitive system, authenticated write
CREATE POLICY "public_read_knowledge_blocks"
ON public.knowledge_blocks
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_read_concept_relationships"
ON public.concept_relationships
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_read_accounting_data"
ON public.accounting_data
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_read_fiscal_rules"
ON public.fiscal_rules
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_read_daily_reports"
ON public.daily_knowledge_reports
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_read_cross_domain_insights"
ON public.cross_domain_insights
FOR SELECT
TO public
USING (true);

-- Authenticated users can manage learning pipeline and memory updates
CREATE POLICY "authenticated_manage_learning_pipeline"
ON public.learning_pipeline_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_manage_memory_updates"
ON public.memory_update_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. VIEWS for easy data access
CREATE VIEW public.cognitive_memory_overview AS
SELECT 
    kb.domain,
    COUNT(*) as concept_count,
    AVG(kb.trust_score) as avg_trust_score,
    COUNT(CASE WHEN kb.trust_level IN ('high', 'very_high', 'verified') THEN 1 END) as high_trust_concepts,
    COUNT(cr.id) as relationship_count
FROM public.knowledge_blocks kb
LEFT JOIN public.concept_relationships cr ON (kb.id = cr.source_concept_id OR kb.id = cr.target_concept_id)
GROUP BY kb.domain
ORDER BY concept_count DESC;

CREATE VIEW public.cross_domain_learning_insights AS
SELECT 
    cdi.primary_domain,
    cdi.secondary_domain,
    COUNT(*) as insight_count,
    AVG(cdi.confidence_score) as avg_confidence,
    MAX(cdi.created_at) as latest_insight
FROM public.cross_domain_insights cdi
GROUP BY cdi.primary_domain, cdi.secondary_domain
ORDER BY insight_count DESC, avg_confidence DESC;

-- 8. MOCK DATA for demonstration
DO $$
DECLARE
    math_concept_id UUID := gen_random_uuid();
    physics_concept_id UUID := gen_random_uuid();
    finance_concept_id UUID := gen_random_uuid();
    ifrs_concept_id UUID := gen_random_uuid();
    ai_concept_id UUID := gen_random_uuid();
BEGIN
    -- Sample knowledge blocks across domains
    INSERT INTO public.knowledge_blocks (id, domain, concept, equation, description, source, trust_score, trust_level) VALUES
        (math_concept_id, 'math', 'Black-Scholes Model', 'C = S₀N(d₁) - Ke^(-rT)N(d₂)', 'Mathematical model for pricing European options', 'Fischer Black and Myron Scholes paper', 0.95, 'verified'),
        (physics_concept_id, 'physics', 'Brownian Motion', 'dX_t = μdt + σdW_t', 'Mathematical model of random particle movement', 'Einstein 1905 paper', 0.98, 'verified'),
        (finance_concept_id, 'finance', 'Value at Risk', 'VaR_α = inf{l ∈ ℝ : P(L > l) ≤ 1 - α}', 'Risk management measure of potential losses', 'JP Morgan RiskMetrics', 0.87, 'very_high'),
        (ifrs_concept_id, 'ifrs', 'Fair Value Measurement', 'FV = Present Value of Expected Cash Flows', 'IFRS 13 standard for asset valuation', 'IFRS Foundation', 0.92, 'verified'),
        (ai_concept_id, 'ai', 'Gradient Descent', 'θ = θ - α∇J(θ)', 'Optimization algorithm for machine learning', 'Multiple AI research papers', 0.89, 'very_high');

    -- Sample cross-domain relationships
    INSERT INTO public.concept_relationships (source_concept_id, target_concept_id, relationship_type, strength, discovered_by) VALUES
        (math_concept_id, finance_concept_id, 'applies_to', 0.95, 'mathematical_foundation'),
        (physics_concept_id, math_concept_id, 'mathematical_basis', 0.88, 'theoretical_physics'),
        (ai_concept_id, math_concept_id, 'uses_optimization', 0.82, 'machine_learning'),
        (ifrs_concept_id, finance_concept_id, 'regulatory_framework', 0.78, 'accounting_standards');

    -- Sample accounting data
    INSERT INTO public.accounting_data (entity, year, metric, value, currency, source, ifrs_standard) VALUES
        ('Sample Corp', 2024, 'Total Assets', 1500000000, 'USD', 'Annual Report', 'IFRS 9'),
        ('Sample Corp', 2024, 'Revenue', 850000000, 'USD', 'Annual Report', 'IFRS 15'),
        ('Sample Corp', 2024, 'Net Income', 120000000, 'USD', 'Annual Report', 'IAS 1'),
        ('Global Bank', 2024, 'Tier 1 Capital Ratio', 0.142, 'RATIO', 'Basel III Report', 'IFRS 9');

    -- Sample fiscal rules
    INSERT INTO public.fiscal_rules (country, jurisdiction, rule_type, rule_name, description, regulatory_body) VALUES
        ('Switzerland', 'Federal', 'tax_rate', 'Corporate Tax Rate', 'Federal corporate income tax rate', 'FTA'),
        ('United States', 'Federal', 'compliance', 'BEPS Action 15', 'Multinational information exchange', 'IRS'),
        ('European Union', 'EU', 'reporting', 'Country-by-Country Reporting', 'OECD BEPS reporting requirements', 'OECD'),
        ('Global', 'International', 'tax_rate', 'QDMTT Rate', 'Qualified Domestic Minimum Top-up Tax', 'OECD');

    -- Sample cross-domain insights
    INSERT INTO public.cross_domain_insights (primary_domain, secondary_domain, insight_description, confidence_score) VALUES
        ('math', 'finance', 'Stochastic calculus from physics directly enables derivative pricing models', 0.92),
        ('physics', 'ai', 'Energy minimization principles in physics mirror loss function optimization', 0.84),
        ('ifrs', 'ai', 'AI pattern recognition can automate IFRS compliance validation', 0.76),
        ('accounting', 'trading', 'Real-time P&L calculation requires integration of accounting principles with market data', 0.88);

    -- Generate initial daily report
    PERFORM public.generate_daily_knowledge_report(CURRENT_DATE);
    
END $$;

-- 9. TRIGGERS for automatic trust score updates
CREATE OR REPLACE FUNCTION public.update_knowledge_trust_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $trig$
BEGIN
    -- Update trust score when validation or application counts change
    IF TG_OP = 'UPDATE' AND (
        OLD.validation_count != NEW.validation_count OR 
        OLD.application_count != NEW.application_count
    ) THEN
        PERFORM public.calculate_knowledge_trust_score(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$trig$;

CREATE TRIGGER knowledge_trust_update_trigger
    AFTER UPDATE ON public.knowledge_blocks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_knowledge_trust_trigger();

-- 10. COMMENT DOCUMENTATION
COMMENT ON TABLE public.knowledge_blocks IS 'Core cognitive memory storage for AI learning system - Freedom v4';
COMMENT ON TABLE public.concept_relationships IS 'Cross-domain relationship mapping for autonomous learning';
COMMENT ON TABLE public.accounting_data IS 'IFRS and financial accounting data for cognitive understanding';
COMMENT ON TABLE public.fiscal_rules IS 'International fiscal and regulatory rules database';
COMMENT ON TABLE public.cross_domain_insights IS 'AI-discovered insights linking different knowledge domains';
COMMENT ON FUNCTION public.calculate_knowledge_trust_score IS 'Autonomous trust scoring for knowledge validation';
COMMENT ON FUNCTION public.discover_cross_domain_relationships IS 'AI system for discovering conceptual relationships across domains';