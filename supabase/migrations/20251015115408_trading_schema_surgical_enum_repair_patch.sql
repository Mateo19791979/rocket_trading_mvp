-- =========================================================
-- PATCH UNIQUE – Réparation ENUM + Alignement complet trading
-- Idempotent, sans DROP destructif
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- ========== Déplacer public.orders vers trading si besoin ==========
DO $$ BEGIN
  IF to_regclass('trading.orders') IS NULL AND to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.orders SET SCHEMA trading';
  END IF;
END $$;

-- ========== Tables de base (création si absentes) ==========
CREATE TABLE IF NOT EXISTS accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker        text NOT NULL DEFAULT 'IBKR',
  account_code  text NOT NULL,
  mode          text NOT NULL DEFAULT 'paper',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (broker, account_code)
);

CREATE TABLE IF NOT EXISTS strategies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL,
  description   text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS risk_limits (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id         uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  max_pos_per_symbol numeric NOT NULL DEFAULT 1000,
  max_notional_per_symbol numeric NOT NULL DEFAULT 25000,
  max_leverage       numeric NOT NULL DEFAULT 2,
  daily_loss_stop    numeric NOT NULL DEFAULT -500,
  created_at         timestamptz NOT NULL DEFAULT now(),
  -- on ne force pas ici la colonne 'risk_default' pour rester compatible avec d'anciens schémas
  UNIQUE (account_id)
);

CREATE TABLE IF NOT EXISTS runtime_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  trading_enabled boolean NOT NULL DEFAULT true,
  read_only       boolean NOT NULL DEFAULT false,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id)
);

-- ========== S'assurer que trading.orders existe (sinon squelette) ==========
DO $$ BEGIN
  IF to_regclass('trading.orders') IS NULL THEN
    EXECUTE $CT$
      CREATE TABLE trading.orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz NOT NULL DEFAULT now()
      )
    $CT$;
  END IF;
END $$;

-- ========== Colonnes attendues (ajoute si absentes) ==========
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='client_order_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN client_order_id text';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='account_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN account_id uuid';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='strategy_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN strategy_id uuid';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='symbol') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN symbol text';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='sec_type') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN sec_type text';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='exchange') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN exchange text';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='currency') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN currency text';
  END IF;
  -- Colonnes ENUM (types déjà existants ou à réparer ci-dessous)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='side') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN side text'; -- conversion vers ENUM après réparation
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='otype') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN otype text'; -- conversion vers ENUM après réparation
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='qty') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN qty numeric';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='limit_price') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN limit_price numeric';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='tif') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN tif text'; -- conversion vers ENUM après réparation
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='risk') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN risk text'; -- conversion vers ENUM après réparation
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='notional_hint') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN notional_hint numeric';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='status') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN status text'; -- conversion vers ENUM après réparation
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='ib_order_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN ib_order_id bigint';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='trading' AND table_name='orders' AND column_name='meta') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN meta jsonb';
  END IF;
END $$;

-- ========== Réparation PROFONDE des ENUM réellement utilisés par les colonnes ==========
-- Le principe: détecter le type EFFECTIF de chaque colonne (si déjà ENUM), et y ajouter les valeurs manquantes.
-- Sinon, si c'est TEXT, on créera (si besoin) un ENUM standard dans trading, puis on convertira.

-- Helper: ajoute une étiquette à l'ENUM d'une colonne si absente
CREATE OR REPLACE FUNCTION trading._ensure_enum_label(p_table regclass, p_column text, p_label text) RETURNS void AS $$
DECLARE
  typ_oid oid;
  enum_typename text;
  exists_label boolean;
  typtype text;
BEGIN
  SELECT atttypid INTO typ_oid
  FROM pg_attribute
  WHERE attrelid = p_table AND attname = p_column AND attnum > 0 AND NOT attisdropped;
  
  IF typ_oid IS NULL THEN
    RAISE NOTICE '%.%: colonne introuvable', p_table::text, p_column;
    RETURN;
  END IF;
  
  SELECT t.typtype INTO typtype FROM pg_type t WHERE t.oid = typ_oid;
  
  IF typtype = 'e' THEN
    SELECT format('%I.%I', n.nspname, t.typname)
    INTO enum_typename
    FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.oid = typ_oid;
    
    SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumtypid = typ_oid AND enumlabel = p_label)
    INTO exists_label;
    
    IF NOT exists_label THEN
      EXECUTE 'ALTER TYPE ' || enum_typename || ' ADD VALUE IF NOT EXISTS ' || quote_literal(p_label);
    END IF;
  ELSE
    -- pas un ENUM, on ne fait rien ici (conversion plus bas)
    RETURN;
  END IF;
END
$$ LANGUAGE plpgsql;

-- 1) STATUS: valeurs standard
SELECT trading._ensure_enum_label('trading.orders','status','planned');
SELECT trading._ensure_enum_label('trading.orders','status','submitted');
SELECT trading._ensure_enum_label('trading.orders','status','partially_filled');
SELECT trading._ensure_enum_label('trading.orders','status','filled');
SELECT trading._ensure_enum_label('trading.orders','status','cancelled');
SELECT trading._ensure_enum_label('trading.orders','status','rejected');
SELECT trading._ensure_enum_label('trading.orders','status','error');

-- 2) OTYPE (order type): valeurs standard
SELECT trading._ensure_enum_label('trading.orders','otype','MKT');
SELECT trading._ensure_enum_label('trading.orders','otype','LMT');
SELECT trading._ensure_enum_label('trading.orders','otype','STP');
SELECT trading._ensure_enum_label('trading.orders','otype','STP_LMT');
SELECT trading._ensure_enum_label('trading.orders','otype','BRACKET');

-- 3) SIDE: BUY/SELL
SELECT trading._ensure_enum_label('trading.orders','side','BUY');
SELECT trading._ensure_enum_label('trading.orders','side','SELL');

-- 4) TIF: DAY/GTC/IOC/FOK
SELECT trading._ensure_enum_label('trading.orders','tif','DAY');
SELECT trading._ensure_enum_label('trading.orders','tif','GTC');
SELECT trading._ensure_enum_label('trading.orders','tif','IOC');
SELECT trading._ensure_enum_label('trading.orders','tif','FOK');

-- 5) RISK LEVEL: low/medium/high/critical
SELECT trading._ensure_enum_label('trading.orders','risk','low');
SELECT trading._ensure_enum_label('trading.orders','risk','medium');
SELECT trading._ensure_enum_label('trading.orders','risk','high');
SELECT trading._ensure_enum_label('trading.orders','risk','critical');

-- ========== Si certaines colonnes sont encore en TEXT, créer ENUMS standard et convertir ==========
-- Création des ENUMs standard (si pas déjà là)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='order_status') THEN
    CREATE TYPE trading.order_status AS ENUM ('planned','submitted','partially_filled','filled','cancelled','rejected','error');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='order_type') THEN
    CREATE TYPE trading.order_type AS ENUM ('MKT','LMT','STP','STP_LMT','BRACKET');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='side_type') THEN
    CREATE TYPE trading.side_type AS ENUM ('BUY','SELL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='tif_type') THEN
    CREATE TYPE trading.tif_type AS ENUM ('DAY','GTC','IOC','FOK');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='risk_level') THEN
    CREATE TYPE trading.risk_level AS ENUM ('low','medium','high','critical');
  END IF;
END $$;

-- Convertir TEXT -> ENUM trading.* si la colonne n'est pas déjà ENUM
DO $$
DECLARE typtype text;
BEGIN
  -- status
  SELECT t.typtype INTO typtype FROM pg_attribute a JOIN pg_type t ON t.oid=a.atttypid 
   WHERE a.attrelid='trading.orders'::regclass AND a.attname='status';
  IF typtype <> 'e' THEN
    ALTER TABLE trading.orders
      ALTER COLUMN status TYPE trading.order_status
      USING lower(status)::trading.order_status;
  END IF;
  
  -- otype
  SELECT t.typtype INTO typtype FROM pg_attribute a JOIN pg_type t ON t.oid=a.atttypid 
   WHERE a.attrelid='trading.orders'::regclass AND a.attname='otype';
  IF typtype <> 'e' THEN
    ALTER TABLE trading.orders
      ALTER COLUMN otype TYPE trading.order_type
      USING upper(otype)::trading.order_type;
  END IF;
  
  -- side
  SELECT t.typtype INTO typtype FROM pg_attribute a JOIN pg_type t ON t.oid=a.atttypid 
   WHERE a.attrelid='trading.orders'::regclass AND a.attname='side';
  IF typtype <> 'e' THEN
    ALTER TABLE trading.orders
      ALTER COLUMN side TYPE trading.side_type
      USING upper(side)::trading.side_type;
  END IF;
  
  -- tif
  SELECT t.typtype INTO typtype FROM pg_attribute a JOIN pg_type t ON t.oid=a.atttypid 
   WHERE a.attrelid='trading.orders'::regclass AND a.attname='tif';
  IF typtype <> 'e' THEN
    ALTER TABLE trading.orders
      ALTER COLUMN tif TYPE trading.tif_type
      USING upper(tif)::trading.tif_type;
  END IF;
  
  -- risk
  SELECT t.typtype INTO typtype FROM pg_attribute a JOIN pg_type t ON t.oid=a.atttypid 
   WHERE a.attrelid='trading.orders'::regclass AND a.attname='risk';
  IF typtype <> 'e' THEN
    ALTER TABLE trading.orders
      ALTER COLUMN risk TYPE trading.risk_level
      USING lower(risk)::trading.risk_level;
  END IF;
END $$;

-- ========== Defaults & backfill sûrs ==========
UPDATE trading.orders SET sec_type = COALESCE(sec_type,'STK');
UPDATE trading.orders SET exchange = COALESCE(exchange,'SMART');
UPDATE trading.orders SET currency = COALESCE(currency,'USD');
UPDATE trading.orders SET tif      = COALESCE(tif,'DAY'::trading.tif_type);
UPDATE trading.orders SET risk     = COALESCE(risk,'low'::trading.risk_level);
UPDATE trading.orders SET status   = COALESCE(status,'planned'::trading.order_status);
UPDATE trading.orders SET meta     = COALESCE(meta,'{}'::jsonb);

ALTER TABLE trading.orders ALTER COLUMN sec_type   SET DEFAULT 'STK';
ALTER TABLE trading.orders ALTER COLUMN exchange   SET DEFAULT 'SMART';
ALTER TABLE trading.orders ALTER COLUMN currency   SET DEFAULT 'USD';
ALTER TABLE trading.orders ALTER COLUMN tif        SET DEFAULT 'DAY'::trading.tif_type;
ALTER TABLE trading.orders ALTER COLUMN risk       SET DEFAULT 'low'::trading.risk_level;
ALTER TABLE trading.orders ALTER COLUMN status     SET DEFAULT 'planned'::trading.order_status;
ALTER TABLE trading.orders ALTER COLUMN created_at SET DEFAULT now();

-- FK (essayées, non bloquantes si legacy à nettoyer)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='orders_account_fk') THEN
    BEGIN
      EXECUTE 'ALTER TABLE trading.orders ADD CONSTRAINT orders_account_fk
               FOREIGN KEY (account_id) REFERENCES trading.accounts(id) ON DELETE RESTRICT';
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='orders_strategy_fk') THEN
    BEGIN
      EXECUTE 'ALTER TABLE trading.orders ADD CONSTRAINT orders_strategy_fk
               FOREIGN KEY (strategy_id) REFERENCES trading.strategies(id) ON DELETE SET NULL';
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;

-- Unicité + index
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='orders_client_order_id_key') THEN
    BEGIN
      EXECUTE 'ALTER TABLE trading.orders ADD CONSTRAINT orders_client_order_id_key UNIQUE (client_order_id)';
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;

-- backfill d'un client_order_id si NULL pour respecter l'unicité
UPDATE trading.orders SET client_order_id = COALESCE(client_order_id, encode(gen_random_bytes(12),'hex'))
WHERE client_order_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_client_order_id ON trading.orders(client_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_account_created  ON trading.orders(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_symbol           ON trading.orders(symbol);

-- ========== Journaux et fills ==========
CREATE TABLE IF NOT EXISTS order_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES trading.orders(id) ON DELETE CASCADE,
  status     trading.order_status NOT NULL,
  message    text,
  payload    jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_order_created ON order_events(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS fills (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES trading.orders(id) ON DELETE CASCADE,
  fill_price numeric NOT NULL,
  fill_qty   numeric NOT NULL CHECK (fill_qty > 0),
  commission numeric DEFAULT 0,
  ts         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fills_order_ts ON fills(order_id, ts DESC);

-- ========== Fonctions & triggers ==========
CREATE OR REPLACE FUNCTION trading.enforce_idempotence() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM trading.orders WHERE client_order_id = NEW.client_order_id) THEN
    RAISE EXCEPTION 'duplicate client_order_id: %', NEW.client_order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trading.check_risk_before_insert() RETURNS trigger AS $$
DECLARE
  rl trading.risk_limits;
  rf trading.runtime_flags;
  est_notional numeric;
BEGIN
  SELECT * INTO rl FROM trading.risk_limits WHERE account_id = NEW.account_id;
  IF rl IS NULL THEN
    RAISE EXCEPTION 'risk_limits missing for account %', NEW.account_id;
  END IF;
  
  SELECT * INTO rf FROM trading.runtime_flags WHERE account_id = NEW.account_id;
  IF rf IS NULL THEN
    RAISE EXCEPTION 'runtime_flags missing for account %', NEW.account_id;
  END IF;
  
  IF rf.trading_enabled = false THEN
    RAISE EXCEPTION 'trading disabled by runtime flag';
  END IF;
  
  est_notional := COALESCE(NEW.notional_hint,
                           CASE WHEN NEW.limit_price IS NOT NULL THEN NEW.qty * NEW.limit_price
                                ELSE NEW.qty * 100::numeric END);
  
  IF rl.max_notional_per_symbol IS NOT NULL AND est_notional > rl.max_notional_per_symbol THEN
    RAISE EXCEPTION 'max_notional_per_symbol exceeded (% > %)', est_notional, rl.max_notional_per_symbol;
  END IF;
  
  IF rl.max_pos_per_symbol IS NOT NULL AND NEW.qty > rl.max_pos_per_symbol THEN
    RAISE EXCEPTION 'max_pos_per_symbol exceeded (% > %)', NEW.qty, rl.max_pos_per_symbol;
  END IF;
  
  IF rl.max_leverage IS NOT NULL AND rl.max_leverage > 0 THEN
    IF (NEW.meta ? 'portfolio_equity') THEN
      IF est_notional / NULLIF((NEW.meta->>'portfolio_equity')::numeric,0) > rl.max_leverage THEN
        RAISE EXCEPTION 'max_leverage exceeded';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trading.add_planned_event() RETURNS trigger AS $$
BEGIN
  INSERT INTO trading.order_events(order_id, status, message, payload)
  VALUES (NEW.id, 'planned', 'order planned',
          jsonb_build_object('symbol', NEW.symbol, 'side', NEW.side));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_idempotence') THEN
    CREATE TRIGGER trg_orders_idempotence
    BEFORE INSERT ON trading.orders
    FOR EACH ROW EXECUTE FUNCTION trading.enforce_idempotence();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_risk') THEN
    CREATE TRIGGER trg_orders_risk
    BEFORE INSERT ON trading.orders
    FOR EACH ROW EXECUTE FUNCTION trading.check_risk_before_insert();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_planned_event') THEN
    CREATE TRIGGER trg_orders_planned_event
    AFTER INSERT ON trading.orders
    FOR EACH ROW EXECUTE FUNCTION trading.add_planned_event();
  END IF;
END $$;

-- ========== Vues pratiques ==========
CREATE OR REPLACE VIEW v_order_last_event AS
SELECT oe.order_id,
       (ARRAY_AGG(oe ORDER BY oe.created_at DESC))[1] AS last_event
FROM trading.order_events oe
GROUP BY oe.order_id;

CREATE OR REPLACE VIEW v_orders_current_status AS
SELECT o.*,
       COALESCE((le.last_event->>'status')::trading.order_status, o.status) AS current_status,
       (le.last_event->>'created_at')::timestamptz AS last_event_at
FROM trading.orders o
LEFT JOIN trading.v_order_last_event le ON le.order_id = o.id;

-- ========== Données par défaut (sécurisées) ==========
DO $$
DECLARE acc_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM trading.accounts WHERE broker='IBKR' AND account_code='DUN766038') THEN
    INSERT INTO trading.accounts (broker, account_code, mode) VALUES ('IBKR','DUN766038','paper');
  END IF;
  SELECT id INTO acc_id FROM trading.accounts WHERE broker='IBKR' AND account_code='DUN766038';
  
  IF NOT EXISTS (SELECT 1 FROM trading.risk_limits WHERE account_id = acc_id) THEN
    INSERT INTO trading.risk_limits(account_id, max_pos_per_symbol, max_notional_per_symbol, max_leverage, daily_loss_stop)
    VALUES (acc_id, 1000, 25000, 2, -500);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM trading.runtime_flags WHERE account_id = acc_id) THEN
    INSERT INTO trading.runtime_flags(account_id, trading_enabled, read_only)
    VALUES (acc_id, true, false);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM trading.strategies WHERE code='momentum_v1') THEN
    INSERT INTO trading.strategies(code, description) VALUES ('momentum_v1','Momentum simple multi-actifs');
  END IF;
END $$;

-- =========================================================
-- FIN DU PATCH UNIQUE
-- =========================================================