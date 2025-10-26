-- Script SQL chirurgical adaptatif pour corriger colonnes manquantes IA trading
-- Contexte: Détecte automatiquement si les objets sont en public.* ou trading.*
-- Objectif: Ajouter positions.is_active, trades.unrealized_pnl, knowledge_blocks.description
-- Mode: Idempotent - ne supprime rien, s'adapte à l'existant

CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- === Helpers: détecter table vs vue (public) ===
-- relkind: 'r' = table, 'v' = view, 'm' = matview
-- On opérera prudemment selon l'existant.

-- 1) POSITIONS : assurer la structure et la colonne is_active
DO $$
DECLARE
  relkind_public char;
  relkind_trading char;
BEGIN
  -- Existe-t-il public.positions ?
  SELECT c.relkind INTO relkind_public
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='public' AND c.relname='positions'
  LIMIT 1;
  
  -- Existe-t-il trading.positions ?
  SELECT c.relkind INTO relkind_trading
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='trading' AND c.relname='positions'
  LIMIT 1;
  
  IF relkind_public = 'r' THEN
    -- Table physique en public : on complète sur place
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='positions' AND column_name='is_active'
    ) THEN
      EXECUTE 'ALTER TABLE public.positions ADD COLUMN is_active boolean NOT NULL DEFAULT true';
    END IF;
  
  ELSIF relkind_trading = 'r' THEN
    -- Table physique en trading : s'assurer de la colonne
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='trading' AND table_name='positions' AND column_name='is_active'
    ) THEN
      EXECUTE 'ALTER TABLE trading.positions ADD COLUMN is_active boolean NOT NULL DEFAULT true';
    END IF;
    
    -- Exposer une vue de compat en public (sans casser si table déjà présente)
    IF relkind_public IS NULL OR relkind_public='v' THEN
      EXECUTE 'CREATE OR REPLACE VIEW public.positions AS
               SELECT id, account_id, symbol, qty, avg_price, is_active, updated_at
               FROM trading.positions';
    END IF;
  
  ELSE
    -- Rien n'existe : on crée la table canonique en trading + vue compat en public
    EXECUTE $CT$
      CREATE TABLE trading.positions (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        account_id uuid,
        symbol     text NOT NULL,
        qty        numeric NOT NULL DEFAULT 0,
        avg_price  numeric,
        is_active  boolean NOT NULL DEFAULT true,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    $CT$;
    
    EXECUTE 'CREATE OR REPLACE VIEW public.positions AS
             SELECT id, account_id, symbol, qty, avg_price, is_active, updated_at
             FROM trading.positions';
  END IF;
END $$;

-- 2) TRADES : assurer la structure et la colonne unrealized_pnl
DO $$
DECLARE
  relkind_public char;
  relkind_trading char;
BEGIN
  SELECT c.relkind INTO relkind_public
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname='trades' LIMIT 1;
  
  SELECT c.relkind INTO relkind_trading
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='trading' AND c.relname='trades' LIMIT 1;
  
  IF relkind_public = 'r' THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trades' AND column_name='unrealized_pnl'
    ) THEN
      EXECUTE 'ALTER TABLE public.trades ADD COLUMN unrealized_pnl numeric';
    END IF;
  
  ELSIF relkind_trading = 'r' THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='trading' AND table_name='trades' AND column_name='unrealized_pnl'
    ) THEN
      EXECUTE 'ALTER TABLE trading.trades ADD COLUMN unrealized_pnl numeric';
    END IF;
    
    IF relkind_public IS NULL OR relkind_public='v' THEN
      EXECUTE 'CREATE OR REPLACE VIEW public.trades AS
               SELECT id, order_id, account_id, symbol, side, qty, price, fees,
                      realized_pnl, unrealized_pnl, ts
               FROM trading.trades';
    END IF;
  
  ELSE
    EXECUTE $CT$
      CREATE TABLE trading.trades (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id       uuid,
        account_id     uuid,
        symbol         text NOT NULL,
        side           text NOT NULL,
        qty            numeric NOT NULL,
        price          numeric NOT NULL,
        fees           numeric DEFAULT 0,
        realized_pnl   numeric DEFAULT 0,
        unrealized_pnl numeric,
        ts             timestamptz NOT NULL DEFAULT now()
      )
    $CT$;
    
    EXECUTE 'CREATE OR REPLACE VIEW public.trades AS
             SELECT id, order_id, account_id, symbol, side, qty, price, fees,
                    realized_pnl, unrealized_pnl, ts
             FROM trading.trades';
  END IF;
END $$;

-- 3) MARKET TICKS CACHE (optionnel mais utile pour UI)
DO $$
DECLARE 
  relkind_public char; 
  relkind_trading char;
BEGIN
  SELECT c.relkind INTO relkind_public
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname='market_ticks_cache' LIMIT 1;
  
  SELECT c.relkind INTO relkind_trading
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='trading' AND c.relname='market_ticks_cache' LIMIT 1;
  
  IF relkind_public = 'r' THEN
    NULL; -- table déjà là, on ne touche pas
  ELSIF relkind_trading = 'r' THEN
    IF relkind_public IS NULL OR relkind_public='v' THEN
      EXECUTE 'CREATE OR REPLACE VIEW public.market_ticks_cache AS
               SELECT symbol, last, bid, ask, ts FROM trading.market_ticks_cache';
    END IF;
  ELSE
    EXECUTE 'CREATE TABLE trading.market_ticks_cache (
               symbol text PRIMARY KEY,
               last numeric, bid numeric, ask numeric,
               ts timestamptz NOT NULL DEFAULT now()
             )';
    EXECUTE 'CREATE OR REPLACE VIEW public.market_ticks_cache AS
             SELECT symbol, last, bid, ask, ts FROM trading.market_ticks_cache';
  END IF;
END $$;

-- 4) KNOWLEDGE_BLOCKS.description : ajouter où que soit la table
DO $$
DECLARE
  relkind_public char;
  relkind_trading char;
BEGIN
  SELECT c.relkind INTO relkind_public
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname='knowledge_blocks' LIMIT 1;
  
  SELECT c.relkind INTO relkind_trading
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='trading' AND c.relname='knowledge_blocks' LIMIT 1;
  
  IF relkind_public = 'r' THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='knowledge_blocks' AND column_name='description'
    ) THEN
      EXECUTE 'ALTER TABLE public.knowledge_blocks ADD COLUMN description text';
    END IF;
  
  ELSIF relkind_trading = 'r' THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='trading' AND table_name='knowledge_blocks' AND column_name='description'
    ) THEN
      EXECUTE 'ALTER TABLE trading.knowledge_blocks ADD COLUMN description text';
    END IF;
    
    -- Exposer vue compat en public si nécessaire
    IF to_regclass('public.knowledge_blocks') IS NULL OR relkind_public='v' THEN
      -- On crée une vue minimale si la table n'existe pas en public
      EXECUTE $VKB$
        CREATE OR REPLACE VIEW public.knowledge_blocks AS
        SELECT *
        FROM trading.knowledge_blocks
      $VKB$;
    END IF;
  
  ELSE
    -- Si la table n'existe nulle part, on crée une table minimale en public (souvent attendue côté app)
    EXECUTE $CKB$
      CREATE TABLE public.knowledge_blocks (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        description text,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    $CKB$;
  END IF;
END $$;

-- 5) Vérifications GO/NO-GO
SELECT 'positions.has_is_active' AS check_name,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema IN ('public','trading')
          AND table_name='positions' AND column_name='is_active') > 0 AS ok;

SELECT 'trades.has_unrealized_pnl' AS check_name,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema IN ('public','trading')
          AND table_name='trades' AND column_name='unrealized_pnl') > 0 AS ok;

SELECT 'knowledge_blocks.has_description' AS check_name,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema IN ('public','trading')
          AND table_name='knowledge_blocks' AND column_name='description') > 0 AS ok;

-- Vérifications des données (seulement si les tables existent)
DO $$
BEGIN
  IF to_regclass('public.positions') IS NOT NULL THEN
    RAISE NOTICE 'Table public.positions existe - échantillon disponible';
  END IF;
  
  IF to_regclass('public.trades') IS NOT NULL THEN
    RAISE NOTICE 'Table public.trades existe - échantillon disponible'; 
  END IF;
  
  IF to_regclass('public.market_ticks_cache') IS NOT NULL THEN
    RAISE NOTICE 'Table public.market_ticks_cache existe - échantillon disponible';
  END IF;
END $$;