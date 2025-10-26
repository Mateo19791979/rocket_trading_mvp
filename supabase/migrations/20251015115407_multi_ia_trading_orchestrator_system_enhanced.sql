-- ========================================================= 
-- PATCH FULL ALIGNEMENT – trading.orders + dépendances
-- Idempotent, sans DROP destructif
-- Surgical improvements for Multi-IA Trading Orchestrator
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- ========== ENUMS requis (création si absents) ==========
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
    CREATE TYPE risk_level AS ENUM ('low','medium','high','critical');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('planned','submitted','partially_filled','filled','cancelled','rejected','error');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'side_type') THEN
    CREATE TYPE side_type AS ENUM ('BUY','SELL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_type') THEN
    CREATE TYPE order_type AS ENUM ('MKT','LMT','STP','STP_LMT','BRACKET');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tif_type') THEN
    CREATE TYPE tif_type AS ENUM ('DAY','GTC','IOC','FOK');
  END IF;
END $$;

-- ========== Déplacer une éventuelle table public.orders ==========
DO $$ BEGIN
  IF to_regclass('trading.orders') IS NULL AND to_regclass('public.orders') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.orders SET SCHEMA trading';
  END IF;
END $$;

-- ========== Tables dépendances minimales (si absentes) ==========
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
  risk_default       risk_level NOT NULL DEFAULT 'low',
  created_at         timestamptz NOT NULL DEFAULT now(),
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

-- ========== S'assurer que trading.orders existe ==========
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

-- ========== Ajout/alignement de toutes les colonnes attendues ==========
-- helper: ajoute colonne si absente
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='client_order_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN client_order_id text';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='account_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN account_id uuid';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='strategy_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN strategy_id uuid';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='symbol') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN symbol text';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='sec_type') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN sec_type text';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='exchange') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN exchange text';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='currency') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN currency text';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='side') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN side side_type';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='otype') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN otype order_type';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='qty') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN qty numeric';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='limit_price') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN limit_price numeric';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='tif') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN tif tif_type';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='risk') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN risk risk_level';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='notional_hint') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN notional_hint numeric';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='status') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN status order_status';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='ib_order_id') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN ib_order_id bigint';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='orders' AND column_name='meta') THEN
    EXECUTE 'ALTER TABLE trading.orders ADD COLUMN meta jsonb';
  END IF;
END $$;

-- ========== Defaults/NOT NULL (sans casser l'existant) ==========
-- On met des valeurs par défaut raisonnables où c'est sûr (utilise COALESCE pour backfill)
UPDATE trading.orders SET sec_type   = COALESCE(sec_type, 'STK');
UPDATE trading.orders SET exchange   = COALESCE(exchange, 'SMART');
UPDATE trading.orders SET currency   = COALESCE(currency, 'USD');
UPDATE trading.orders SET tif        = COALESCE(tif, 'DAY');
UPDATE trading.orders SET risk       = COALESCE(risk, 'low');
UPDATE trading.orders SET status     = COALESCE(status, 'planned');
UPDATE trading.orders SET meta       = COALESCE(meta, '{}'::jsonb);

ALTER TABLE trading.orders ALTER COLUMN sec_type   SET DEFAULT 'STK';
ALTER TABLE trading.orders ALTER COLUMN exchange   SET DEFAULT 'SMART';
ALTER TABLE trading.orders ALTER COLUMN currency   SET DEFAULT 'USD';
ALTER TABLE trading.orders ALTER COLUMN tif        SET DEFAULT 'DAY';
ALTER TABLE trading.orders ALTER COLUMN risk       SET DEFAULT 'low';
ALTER TABLE trading.orders ALTER COLUMN status     SET DEFAULT 'planned';
ALTER TABLE trading.orders ALTER COLUMN created_at SET DEFAULT now();

-- On ne force pas immédiatement NOT NULL sur account_id/strategy_id si legacy, mais on assure les FK si possible
DO $$ BEGIN
  -- FK account_id → accounts(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_account_fk'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE trading.orders
               ADD CONSTRAINT orders_account_fk
               FOREIGN KEY (account_id) REFERENCES trading.accounts(id) ON DELETE RESTRICT';
    EXCEPTION WHEN others THEN
      -- si des NULL existent, on laisse passer; l'admin pourra corriger puis remettre la FK
      NULL;
    END;
  END IF;
  
  -- FK strategy_id → strategies(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_strategy_fk'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE trading.orders
               ADD CONSTRAINT orders_strategy_fk
               FOREIGN KEY (strategy_id) REFERENCES trading.strategies(id) ON DELETE SET NULL';
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

-- Unicité & index
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='orders_client_order_id_key'
  ) THEN
    BEGIN
      EXECUTE 'ALTER TABLE trading.orders ADD CONSTRAINT orders_client_order_id_key UNIQUE (client_order_id)';
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_client_order_id ON trading.orders(client_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_account_created  ON trading.orders(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_symbol           ON trading.orders(symbol);

-- ========== order_events & fills (si absents) ==========
CREATE TABLE IF NOT EXISTS order_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES trading.orders(id) ON DELETE CASCADE,
  status     order_status NOT NULL,
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

-- ========== Fonctions & triggers (idempotence / risque / auto-event) ==========
CREATE OR REPLACE FUNCTION enforce_idempotence() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM trading.orders WHERE client_order_id = NEW.client_order_id) THEN
    RAISE EXCEPTION 'duplicate client_order_id: %', NEW.client_order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_risk_before_insert() RETURNS trigger AS $$
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
  
  IF est_notional > rl.max_notional_per_symbol THEN
    RAISE EXCEPTION 'max_notional_per_symbol exceeded (% > %)', est_notional, rl.max_notional_per_symbol;
  END IF;
  
  IF NEW.qty > rl.max_pos_per_symbol THEN
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

CREATE OR REPLACE FUNCTION add_planned_event() RETURNS trigger AS $$
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
       COALESCE((le.last_event->>'status')::order_status, o.status) AS current_status,
       (le.last_event->>'created_at')::timestamptz AS last_event_at
FROM trading.orders o
LEFT JOIN trading.v_order_last_event le ON le.order_id = o.id;

-- ========== Helpers opérationnels ==========

-- Halt global pour un compte (kill-switch)
CREATE OR REPLACE FUNCTION set_trading_halt(p_account_code text, p_enabled boolean) RETURNS void AS $$
DECLARE aid uuid;
BEGIN
  SELECT id INTO aid FROM accounts WHERE account_code = p_account_code LIMIT 1;
  IF aid IS NULL THEN
    RAISE EXCEPTION 'account_code not found';
  END IF;
  
  UPDATE runtime_flags SET trading_enabled = p_enabled, updated_at = now()
  WHERE account_id = aid;
END;
$$ LANGUAGE plpgsql;

-- Read-only (dry-run forcé) pour un compte
CREATE OR REPLACE FUNCTION set_read_only(p_account_code text, p_ro boolean) RETURNS void AS $$
DECLARE aid uuid;
BEGIN
  SELECT id INTO aid FROM accounts WHERE account_code = p_account_code LIMIT 1;
  IF aid IS NULL THEN
    RAISE EXCEPTION 'account_code not found';
  END IF;
  
  UPDATE runtime_flags SET read_only = p_ro, updated_at = now()
  WHERE account_id = aid;
END;
$$ LANGUAGE plpgsql;

-- ========== Données par défaut sûres ==========
DO $$
DECLARE
  acc_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM trading.accounts WHERE broker='IBKR' AND account_code='DU766038') THEN
    INSERT INTO trading.accounts (broker, account_code, mode) VALUES ('IBKR','DU766038','paper');
  END IF;
  SELECT id INTO acc_id FROM trading.accounts WHERE broker='IBKR' AND account_code='DU766038';
  
  IF NOT EXISTS (SELECT 1 FROM trading.risk_limits WHERE account_id = acc_id) THEN
    INSERT INTO trading.risk_limits(account_id, max_pos_per_symbol, max_notional_per_symbol, max_leverage, daily_loss_stop, risk_default)
    VALUES (acc_id, 1000, 25000, 2, -500, 'low');
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
-- FIN DU PATCH
-- =========================================================