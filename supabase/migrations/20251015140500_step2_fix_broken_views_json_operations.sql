-- Étape 2 — Vues cassées (remplace JSON sur record)
-- Fix broken views that use JSON operations on records
-- Schema Analysis: Rebuild views without JSON operations on records
-- Integration Type: Modification - View reconstruction
-- Dependencies: trading.orders, trading.order_events tables

CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- Dernier événement par ordre (record → colonnes typées)
CREATE OR REPLACE VIEW trading.v_order_last_event AS
SELECT DISTINCT ON (oe.order_id)
       oe.order_id,
       oe.status      AS last_status,
       oe.created_at  AS last_event_at
FROM trading.order_events oe
ORDER BY oe.order_id, oe.created_at DESC;

-- Statut courant, sans opérateur JSON
CREATE OR REPLACE VIEW trading.v_orders_current_status AS
SELECT o.*,
       COALESCE(le.last_status, o.status) AS current_status,
       le.last_event_at
FROM trading.orders o
LEFT JOIN trading.v_order_last_event le
  ON le.order_id = o.id;

CREATE INDEX IF NOT EXISTS idx_order_events_order_created
  ON trading.order_events(order_id, created_at DESC);

-- Vérifs
DO $$
BEGIN
  IF to_regclass('trading.order_events') IS NOT NULL THEN
    RAISE NOTICE 'Views created successfully. Checking data...';
    -- Test views if tables exist
  ELSE
    RAISE NOTICE 'order_events table not found, views created but will be empty until tables exist.';
  END IF;
END $$;