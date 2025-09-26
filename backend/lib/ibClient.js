import { IBApi, EventName, ErrorCode } from '@stoqey/ib';
import { z } from 'zod';

// Validation schemas
const OrderSchema = z?.object({
  symbol: z?.string()?.min(1)?.max(10),
  side: z?.enum(['BUY', 'SELL']),
  qty: z?.number()?.positive(),
  type: z?.enum(['LIMIT', 'MARKET']),
  limit: z?.number()?.positive()?.optional(),
  tif: z?.enum(['DAY', 'GTC'])?.default('DAY'),
  clientTag: z?.string()?.optional()
});

export class IBClient {
  constructor(config) {
    this.config = config;
    this.ib = new IBApi({
      host: config.host,
      port: config.port,
      clientId: config.clientId
    });
    
    this.connected = false;
    this.accounts = [];
    this.positions = new Map();
    this.orders = new Map();
    this.pnlData = {};
    this.nextOrderId = 1;
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Connection events
    this.ib?.on(EventName?.connected, () => {
      this.connected = true;
      console.log('✅ Connected to IB Gateway/TWS');
      this.requestInitialData();
    });

    this.ib?.on(EventName?.disconnected, () => {
      this.connected = false;
      console.log('❌ Disconnected from IB Gateway/TWS');
    });

    this.ib?.on(EventName?.error, (error, code, reqId) => {
      console.error(`IB Error [${code}]: ${error}`);
      if (code === ErrorCode?.CONNECT_FAIL) {
        this.connected = false;
      }
    });

    // Order events
    this.ib?.on(EventName?.orderStatus, (orderId, status, filled, remaining, avgPrice, permId, parentId, lastPrice, clientId, whyHeld, mktCapPrice) => {
      const orderData = {
        orderId,
        status,
        filled,
        remaining,
        avgPrice,
        lastPrice,
        timestamp: new Date()?.toISOString()
      };
      this.orders?.set(orderId, orderData);
      this.notifyWebSocketClients('orderStatus', orderData);
    });

    this.ib?.on(EventName?.execDetails, (reqId, contract, execution) => {
      const execData = {
        execId: execution?.execId,
        orderId: execution?.orderId,
        symbol: contract?.symbol,
        side: execution?.side,
        shares: execution?.shares,
        price: execution?.price,
        time: execution?.time
      };
      this.notifyWebSocketClients('execDetails', execData);
    });

    // Position events
    this.ib?.on(EventName?.position, (account, contract, position, avgCost) => {
      const positionData = {
        account,
        symbol: contract?.symbol,
        position,
        avgCost,
        marketValue: position * avgCost,
        timestamp: new Date()?.toISOString()
      };
      this.positions?.set(`${account}_${contract?.symbol}`, positionData);
    });

    // PnL events
    this.ib?.on(EventName?.pnl, (reqId, dailyPnL, unrealizedPnL, realizedPnL) => {
      this.pnlData = {
        dailyPnL,
        unrealizedPnL,
        realizedPnL,
        timestamp: new Date()?.toISOString()
      };
      this.notifyWebSocketClients('pnlUpdate', this.pnlData);
    });

    // Account events
    this.ib?.on(EventName?.managedAccounts, (accounts) => {
      this.accounts = accounts?.split(',')?.filter(acc => acc?.trim());
      console.log('📊 Received accounts:', this.accounts);
    });

    // Next valid order ID
    this.ib?.on(EventName?.nextValidId, (orderId) => {
      this.nextOrderId = orderId;
      console.log('🔢 Next valid order ID:', orderId);
    });
  }

  async connect() {
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ib.once(EventName.connected, () => {
          clearTimeout(timeout);
          resolve();
        });

        this.ib.once(EventName.error, (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        this.ib.connect();
      });

      return { success: true };
    } catch (error) {
      console.error('Connection failed:', error);
      return { success: false, error: error?.message };
    }
  }

  async disconnect() {
    this.ib?.disconnect();
    this.connected = false;
  }

  async handshake() {
    if (!this.connected) {
      const result = await this.connect();
      if (!result?.success) {
        return {
          status: 'disconnected',
          error: result?.error
        };
      }
    }

    return {
      status: 'connected',
      serverTime: new Date()?.toISOString(),
      accounts: this.accounts,
      clientId: this.config?.clientId
    };
  }

  requestInitialData() {
    // Request managed accounts
    this.ib?.reqManagedAccts();
    
    // Request positions for all accounts
    this.ib?.reqPositions();
    
    // Request PnL for first account if available
    if (this.accounts?.length > 0) {
      this.ib?.reqPnL(1, this.accounts?.[0], '');
    }
  }

  validateOrder(orderData) {
    try {
      return OrderSchema?.parse(orderData);
    } catch (error) {
      throw new Error(`Order validation failed: ${error.message}`);
    }
  }

  checkRiskLimits(order) {
    // Check market orders allowed
    if (order?.type === 'MARKET' && process.env?.ALLOW_MARKET_ORDERS !== 'true') {
      throw new Error('Market orders are disabled');
    }

    // Check order value limit
    const estimatedValue = order?.qty * (order?.limit || 100); // Use limit price or estimate
    const maxValue = parseFloat(process.env?.MAX_ORDER_VALUE_CHF || '50000');
    
    if (estimatedValue > maxValue) {
      throw new Error(`Order value (${estimatedValue.toFixed(2)}) exceeds maximum allowed (${maxValue})`);
    }

    return true;
  }

  async placeOrder(symbol, side, qty, type, limit, tif = 'DAY', clientTag = '') {
    if (!this.connected) {
      throw new Error('Not connected to IB Gateway/TWS');
    }

    const orderData = {
      symbol,
      side,
      qty,
      type,
      limit,
      tif,
      clientTag
    };

    // Validate order
    const validatedOrder = this.validateOrder(orderData);
    
    // Check risk limits
    this.checkRiskLimits(validatedOrder);

    // Create IB contract
    const contract = {
      symbol: symbol,
      secType: 'STK',
      exchange: 'SMART',
      currency: 'USD'
    };

    // Create IB order
    const order = {
      orderType: type,
      action: side,
      totalQuantity: qty,
      tif: tif,
      orderRef: clientTag
    };

    if (type === 'LIMIT' && limit) {
      order.lmtPrice = limit;
    }

    const orderId = this.nextOrderId++;

    try {
      this.ib?.placeOrder(orderId, contract, order);
      
      // Store order locally
      this.orders?.set(orderId, {
        orderId,
        symbol,
        side,
        qty,
        type,
        limit,
        status: 'submitted',
        timestamp: new Date()?.toISOString()
      });

      return { orderId, status: 'submitted' };
    } catch (error) {
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  async getOrder(orderId) {
    const order = this.orders?.get(parseInt(orderId));
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getPositions() {
    if (!this.connected) {
      return {};
    }

    const positions = Array.from(this.positions?.values())?.map(pos => ({
      symbol: pos?.symbol,
      qty: pos?.position,
      avgPrice: pos?.avgCost,
      marketValue: pos?.marketValue,
      account: pos?.account,
      timestamp: pos?.timestamp
    }));

    return { positions, timestamp: new Date()?.toISOString() };
  }

  async getPnl() {
    if (!this.connected) {
      return {};
    }

    return {
      ...this.pnlData,
      timestamp: this.pnlData?.timestamp || new Date()?.toISOString()
    };
  }

  // WebSocket client management
  wsClients = new Set();

  addWebSocketClient(ws) {
    this.wsClients?.add(ws);
    ws?.on('close', () => {
      this.wsClients?.delete(ws);
    });
  }

  notifyWebSocketClients(event, data) {
    const message = JSON.stringify({
      event,
      data,
      timestamp: new Date()?.toISOString()
    });

    this.wsClients?.forEach(ws => {
      if (ws?.readyState === 1) { // WebSocket.OPEN
        ws?.send(message);
      }
    });
  }
}