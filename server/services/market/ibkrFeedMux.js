/* eslint-disable */
import EventEmitter from 'events';
import { upsertTick } from './cacheRepo.js';

/**
 * IBKR Feed Multiplexer with watchdog and cache integration
 * 
 * NOTE IMPORTANTE
 * ---------------
 * This mux expects IBKR service functions to be provided:
 *   - connectFn() / disconnectFn()
 *   - subscribeFn(symbols: string[], onTick: function)
 *   - onTick callback receives: { symbol, bid, ask, last, volume }
 * If these don't exist yet, this mux is ready to be connected.
 */
export class IbkrFeedMux extends EventEmitter {
  constructor({ connectFn, disconnectFn, subscribeFn }) {
    super();
    this.connectFn = connectFn;
    this.disconnectFn = disconnectFn;
    this.subscribeFn = subscribeFn;
    this._connected = false;
    this._lastTickAt = 0;
    this._hb = null;
    this._reconnecting = false;
    this._backoffMs = 1000; // exponential backoff
    this._lastSymbols = [];
  }

  /**
   * Start the feed mux with given symbols
   * @param {string[]} symbols - Array of symbols to subscribe
   */
  async start(symbols = []) {
    console.log('[IBKR MUX] Starting with symbols:', symbols);
    await this._connectAndSub(symbols);
    this._startHeartbeat();
  }

  /**
   * Stop the feed mux
   */
  async stop() {
    console.log('[IBKR MUX] Stopping...');
    this._stopHeartbeat();
    if (this._connected) {
      try { 
        await this.disconnectFn?.(); 
      } catch (e) {
        console.warn('[IBKR MUX] Disconnect error:', e?.message || e);
      }
    }
    this._connected = false;
  }

  /**
   * Handle incoming tick data
   * @param {Object} tick - Tick data
   */
  handleTick = async (tick) => {
    this._lastTickAt = Date.now();
    
    // Emit to listeners (UI, AI agents, etc.)
    this.emit('tick', tick);
    
    // Cache the tick data (prevents 502/404 when IBKR lags)
    try {
      await upsertTick(tick);
    } catch (e) {
      console.warn('[IBKR MUX] Cache error:', e?.message || e);
    }
  }

  /**
   * Start heartbeat monitoring
   * @private
   */
  _startHeartbeat() {
    const HEARTBEAT = Number(process.env?.FEED_HEARTBEAT_MS || 2000);
    const STALL = Number(process.env?.FEED_STALL_MS || 10000);

    this._hb = setInterval(async () => {
      const now = Date.now();
      const noTickFor = now - this._lastTickAt;

      if (noTickFor > STALL && !this._reconnecting && this._connected) {
        console.warn(`[IBKR MUX] No ticks for ${noTickFor}ms, reconnecting...`);
        this._reconnecting = true;
        await this._reconnect();
        this._reconnecting = false;
      }
    }, HEARTBEAT);
  }

  /**
   * Stop heartbeat monitoring
   * @private
   */
  _stopHeartbeat() {
    if (this._hb) {
      clearInterval(this._hb);
      this._hb = null;
    }
  }

  /**
   * Connect and subscribe to symbols
   * @private
   */
  async _connectAndSub(symbols) {
    try {
      console.log('[IBKR MUX] Connecting to IBKR...');
      await this.connectFn?.();
      this._connected = true;
      
      if (symbols?.length) {
        console.log('[IBKR MUX] Subscribing to symbols:', symbols);
        await this.subscribeFn?.(symbols, this.handleTick);
        this._lastSymbols = symbols;
      }
      
      this._lastTickAt = Date.now();
      this._backoffMs = 1000; // reset backoff
      console.log('[IBKR MUX] Connected successfully');
      
    } catch (e) {
      console.error('[IBKR MUX] Connection failed:', e?.message || e);
      this._connected = false;
      await this._scheduleReconnect();
    }
  }

  /**
   * Reconnect after disconnection
   * @private
   */
  async _reconnect() {
    try { 
      await this.disconnectFn?.(); 
    } catch (e) {
      console.warn('[IBKR MUX] Disconnect during reconnect:', e?.message || e);
    }
    await this._scheduleReconnect();
  }

  /**
   * Schedule reconnection with backoff
   * @private
   */
  async _scheduleReconnect() {
    const wait = Math.min(this._backoffMs, 30000); // cap at 30s
    console.warn(`[IBKR MUX] Reconnect in ${wait}ms`);
    
    await new Promise(r => setTimeout(r, wait));
    this._backoffMs *= 2; // exponential backoff

    // Reconnect with last known symbols
    const symbols = this._lastSymbols || [];
    await this._connectAndSub(symbols);
  }

  /**
   * Change subscriptions on the fly
   * @param {string[]} symbols - New symbols to subscribe
   */
  async setSubscriptions(symbols) {
    console.log('[IBKR MUX] Updating subscriptions:', symbols);
    this._lastSymbols = symbols;
    
    if (!this._connected) {
      console.warn('[IBKR MUX] Not connected, storing symbols for next connection');
      return;
    }

    try {
      await this.subscribeFn?.(symbols, this.handleTick);
    } catch (e) {
      console.error('[IBKR MUX] Subscription update failed:', e?.message || e);
    }
  }

  /**
   * Get connection status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      connected: this._connected,
      reconnecting: this._reconnecting,
      lastTickAge: this._lastTickAt ? Date.now() - this._lastTickAt : null,
      subscribedSymbols: this._lastSymbols,
      backoffMs: this._backoffMs
    };
  }
}