-- Location: supabase/migrations/20250101134000_add_project_management_cockpit.sql
-- Schema Analysis: Existing trading system with user_profiles, authentication setup
-- Integration Type: New module addition for project management
-- Dependencies: user_profiles (existing table)

-- 1. Create ENUM types for project management
CREATE TYPE public.task_status AS ENUM ('todo', 'partiel', 'termine');
CREATE TYPE public.task_priority AS ENUM ('haute', 'moyenne', 'basse');
CREATE TYPE public.project_phase AS ENUM (
    'dns_ssl', 
    'infrastructure', 
    'monitoring', 
    'deployment', 
    'testing', 
    'security', 
    'compliance',
    'documentation'
);

-- 2. Core project management tables
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.project_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    phase public.project_phase NOT NULL,
    task_name TEXT NOT NULL,
    responsible TEXT NOT NULL,
    status public.task_status DEFAULT 'todo'::public.task_status,
    priority public.task_priority DEFAULT 'moyenne'::public.task_priority,
    deadline_days INTEGER DEFAULT 1,
    due_date TIMESTAMPTZ,
    notes TEXT,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Statistics tracking table for performance
CREATE TABLE public.project_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    total_tasks INTEGER DEFAULT 0,
    todo_tasks INTEGER DEFAULT 0,
    partiel_tasks INTEGER DEFAULT 0,
    termine_tasks INTEGER DEFAULT 0,
    overdue_tasks INTEGER DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. CSV import logs for tracking
CREATE TABLE public.csv_import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    imported_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    records_imported INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    import_status TEXT DEFAULT 'completed',
    error_details JSONB,
    imported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Essential Indexes for performance
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_assigned_to ON public.project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);
CREATE INDEX idx_project_tasks_phase ON public.project_tasks(phase);
CREATE INDEX idx_project_tasks_priority ON public.project_tasks(priority);
CREATE INDEX idx_project_tasks_due_date ON public.project_tasks(due_date);
CREATE INDEX idx_project_stats_project_id ON public.project_stats(project_id);
CREATE INDEX idx_csv_import_logs_project_id ON public.csv_import_logs(project_id);

-- 6. Functions for business logic
CREATE OR REPLACE FUNCTION public.calculate_due_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    IF NEW.deadline_days IS NOT NULL THEN
        NEW.due_date = CURRENT_TIMESTAMP + (NEW.deadline_days || ' days')::INTERVAL;
    END IF;
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_project_stats(project_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    total_count INTEGER;
    todo_count INTEGER;
    partiel_count INTEGER;
    termine_count INTEGER;
    overdue_count INTEGER;
BEGIN
    -- Calculate task counts
    SELECT COUNT(*) INTO total_count
    FROM public.project_tasks pt
    WHERE pt.project_id = project_uuid;
    
    SELECT COUNT(*) INTO todo_count
    FROM public.project_tasks pt
    WHERE pt.project_id = project_uuid AND pt.status = 'todo'::public.task_status;
    
    SELECT COUNT(*) INTO partiel_count
    FROM public.project_tasks pt
    WHERE pt.project_id = project_uuid AND pt.status = 'partiel'::public.task_status;
    
    SELECT COUNT(*) INTO termine_count
    FROM public.project_tasks pt
    WHERE pt.project_id = project_uuid AND pt.status = 'termine'::public.task_status;
    
    SELECT COUNT(*) INTO overdue_count
    FROM public.project_tasks pt
    WHERE pt.project_id = project_uuid 
    AND pt.due_date < CURRENT_TIMESTAMP 
    AND pt.status != 'termine'::public.task_status;
    
    -- Insert or update stats
    INSERT INTO public.project_stats (
        project_id, total_tasks, todo_tasks, partiel_tasks, 
        termine_tasks, overdue_tasks
    )
    VALUES (
        project_uuid, total_count, todo_count, partiel_count,
        termine_count, overdue_count
    )
    ON CONFLICT (project_id) 
    DO UPDATE SET
        total_tasks = EXCLUDED.total_tasks,
        todo_tasks = EXCLUDED.todo_tasks,
        partiel_tasks = EXCLUDED.partiel_tasks,
        termine_tasks = EXCLUDED.termine_tasks,
        overdue_tasks = EXCLUDED.overdue_tasks,
        calculated_at = CURRENT_TIMESTAMP;
END;
$func$;

-- 7. Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_import_logs ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_projects"
ON public.projects
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "users_manage_project_tasks"
ON public.project_tasks
FOR ALL
TO authenticated
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
)
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "users_view_project_stats"
ON public.project_stats
FOR SELECT
TO authenticated
USING (
    project_id IN (
        SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "users_manage_csv_imports"
ON public.csv_import_logs
FOR ALL
TO authenticated
USING (imported_by = auth.uid())
WITH CHECK (imported_by = auth.uid());

-- 9. Triggers
CREATE TRIGGER calculate_due_date_trigger
    BEFORE INSERT OR UPDATE ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION public.calculate_due_date();

CREATE TRIGGER update_project_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_updated_at
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Mock data with CSV content from user attachment
DO $$
DECLARE
    project_id UUID := gen_random_uuid();
    existing_user_id UUID;
    matthieu_user_id UUID;
BEGIN
    -- Get existing user ID (admin user for project ownership)
    SELECT id INTO existing_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    END IF;

    -- Create project
    INSERT INTO public.projects (id, name, description, owner_id)
    VALUES (
        project_id,
        'MVP Trading Bot — Deployment',
        'Complete deployment plan for MVP Trading Bot with DNS, infrastructure, monitoring, and security setup',
        existing_user_id
    );

    -- Insert tasks from CSV data provided by user
    INSERT INTO public.project_tasks (
        project_id, phase, task_name, responsible, status, priority, deadline_days, notes
    ) VALUES
        (project_id, 'dns_ssl', 'Configurer DNS trading.mvp.com + api.trading.mvp.com (A/CNAME) + SSL auto', 'Infra/DevOps', 'todo', 'haute', 2, 'Infomaniak/Registrar + Vercel/Netlify + Rocketnew'),
        (project_id, 'infrastructure', 'Déployer Redis manage (cache/bus) + sauvegardes quotidiennes', 'Infra/DevOps', 'todo', 'haute', 3, 'Redis >= v6, auth activée'),
        (project_id, 'infrastructure', 'Déployer PostgreSQL manage + sauvegardes quotidiennes', 'Infra/DevOps', 'todo', 'haute', 3, 'Extensions possible'),
        (project_id, 'monitoring', 'Brancher Sentry DSN (front+back) + alertes email', 'Ops', 'partiel', 'haute', 2, 'Mettre DSN dans .env'),
        (project_id, 'infrastructure', 'Configurer reverse proxy Traefik + certificats SSL auto', 'Infra/DevOps', 'todo', 'haute', 2, 'Docker Compose + labels'),
        (project_id, 'security', 'Activer CORS strict sur domaine + rate limit 60/min', 'Backend', 'todo', 'haute', 1, 'Middleware Express'),
        (project_id, 'deployment', 'Build Docker images (frontend + backend + worker)', 'DevOps', 'partiel', 'haute', 2, 'Multi-stage builds'),
        (project_id, 'testing', 'Tests API complets (auth + orders + market)', 'QA/Backend', 'todo', 'moyenne', 3, 'Jest + Supertest'),
        (project_id, 'monitoring', 'Dashboard Grafana + métriques Prometheus', 'Ops', 'todo', 'moyenne', 4, 'Containers séparés'),
        (project_id, 'security', 'Scan vulnérabilités + audit sécurité', 'Security', 'todo', 'haute', 2, 'OWASP + npm audit'),
        (project_id, 'deployment', 'Script déploiement automatisé (CI/CD)', 'DevOps', 'partiel', 'moyenne', 3, 'GitHub Actions'),
        (project_id, 'compliance', 'Documentation conformité + backup plan', 'Compliance', 'todo', 'moyenne', 5, 'RGPD + archivage'),
        (project_id, 'testing', 'Load testing 100 users simultanés', 'QA', 'todo', 'basse', 4, 'K6 ou Artillery'),
        (project_id, 'monitoring', 'Logs centralisés ELK/Fluentd', 'Ops', 'todo', 'basse', 5, 'Structure JSON'),
        (project_id, 'security', 'Pentest externe + rapport', 'Security', 'todo', 'moyenne', 7, 'Prestataire qualifié'),
        (project_id, 'compliance', 'Validation finale + mise en production', 'Matthieu', 'todo', 'haute', 1, 'Go/NoGo decision'),
        (project_id, 'documentation', 'Guide opérationnel + runbook', 'DevOps', 'todo', 'moyenne', 3, 'Procédures de maintenance');

    -- Update project stats
    PERFORM public.update_project_stats(project_id);
    
    -- Log the initial data import
    INSERT INTO public.csv_import_logs (
        project_id, imported_by, filename, records_imported, records_failed
    ) VALUES (
        project_id, existing_user_id, 'plan_deploiement_mvp.csv', 17, 0
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation error: %', SQLERRM;
END $$;

-- 11. Unique constraint on project stats to prevent duplicates
ALTER TABLE public.project_stats ADD CONSTRAINT unique_project_stats UNIQUE (project_id);