-- =========================================================
-- HOTFIX SQL — Supabase (idempotent, safe)
-- Corrects error 42883 and broken views
-- =========================================================

-- 0) Context
CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- 1) Hotfix 42883 : replace gen_random_bytes -> gen_random_uuid (without extension)
UPDATE trading.orders 
SET client_order_id = COALESCE(client_order_id, replace(gen_random_uuid()::text, '-', '')) 
WHERE client_order_id IS NULL;

-- 2) Robust views (without JSON on record)
-- Last event per order (one line/order_id)
CREATE OR REPLACE VIEW trading.v_order_last_event AS
SELECT DISTINCT ON (oe.order_id)
       oe.order_id,
       oe.status      AS last_status,    -- ENUM trading.order_status
       oe.created_at  AS last_event_at
FROM trading.order_events oe
ORDER BY oe.order_id, oe.created_at DESC;

-- Current status = last_status if present, otherwise orders.status
CREATE OR REPLACE VIEW trading.v_orders_current_status AS
SELECT o.*,
       COALESCE(le.last_status, o.status) AS current_status,
       le.last_event_at
FROM trading.orders o
LEFT JOIN trading.v_order_last_event le ON le.order_id = o.id;

-- Useful index to accelerate the DISTINCT ON view
CREATE INDEX IF NOT EXISTS idx_order_events_order_created 
  ON trading.order_events(order_id, created_at DESC);

-- 3) Verifications (returns lines for visual control)
-- A. Verify that client_order_id column is non-null (at least on impacted lines)
SELECT COUNT(*) AS orders_with_missing_client_order_id
FROM trading.orders 
WHERE client_order_id IS NULL;

-- B. Verify the v_order_last_event view
SELECT * FROM trading.v_order_last_event 
ORDER BY last_event_at DESC NULLS LAST 
LIMIT 5;

-- C. Verify the v_orders_current_status view
SELECT id, client_order_id, symbol, side, otype, status, current_status, last_event_at
FROM trading.v_orders_current_status 
ORDER BY created_at DESC 
LIMIT 10;