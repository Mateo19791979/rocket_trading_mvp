import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * Create orders routes with IBKR integration support
 */
export const createOrderRoutes = (ibClient) => {
  
  // Get all orders
  router?.get('/', asyncHandler(async (req, res) => {
    try {
      if (!ibClient?.connected) {
        // Return mock data in degraded mode
        const mockOrders = [
          { 
            id: 'ord_001',
            symbol: 'TSLA', 
            side: 'BUY', 
            quantity: 10, 
            price: 800.00,
            order_type: 'LIMIT',
            status: 'PENDING',
            account: 'DU123456',
            created_at: new Date()?.toISOString(),
            updated_at: new Date()?.toISOString()
          },
          { 
            id: 'ord_002',
            symbol: 'MSFT', 
            side: 'SELL', 
            quantity: 25,
            price: 345.00,
            order_type: 'MARKET',
            status: 'FILLED',
            filled_quantity: 25,
            avg_fill_price: 344.85,
            account: 'DU123456',
            created_at: new Date(Date.now() - 3600000)?.toISOString(),
            updated_at: new Date()?.toISOString()
          }
        ];

        return res?.json({
          ok: true,
          orders: mockOrders,
          total_orders: mockOrders?.length,
          pending_orders: mockOrders?.filter(o => o?.status === 'PENDING')?.length,
          filled_orders: mockOrders?.filter(o => o?.status === 'FILLED')?.length,
          mode: 'degraded',
          warning: 'IB Gateway/TWS not connected - showing mock data',
          timestamp: new Date()?.toISOString()
        });
      }

      // Live data from IBKR
      const orders = await ibClient?.getOrders() || [];
      
      res?.json({
        ok: true,
        orders,
        total_orders: orders?.length,
        pending_orders: orders?.filter(o => o?.status === 'PENDING' || o?.status === 'SUBMITTED')?.length,
        filled_orders: orders?.filter(o => o?.status === 'FILLED')?.length,
        mode: 'live',
        timestamp: new Date()?.toISOString()
      });

    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to fetch orders',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  }));

  // Get specific order by ID
  router?.get('/:orderId', asyncHandler(async (req, res) => {
    try {
      const { orderId } = req?.params;

      if (!ibClient?.connected) {
        return res?.status(503)?.json({
          ok: false,
          error: 'IB Gateway/TWS not connected',
          mode: 'degraded',
          timestamp: new Date()?.toISOString()
        });
      }

      const order = await ibClient?.getOrder(orderId);
      
      if (!order) {
        return res?.status(404)?.json({
          ok: false,
          error: 'Order not found',
          order_id: orderId,
          timestamp: new Date()?.toISOString()
        });
      }

      res?.json({
        ok: true,
        order,
        timestamp: new Date()?.toISOString()
      });

    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to fetch order',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  }));

  // Place new order
  router?.post('/', asyncHandler(async (req, res) => {
    try {
      const { symbol, side, quantity, price, orderType = 'LIMIT' } = req?.body;

      // Validate required fields
      if (!symbol || !side || !quantity) {
        return res?.status(400)?.json({
          ok: false,
          error: 'Missing required fields: symbol, side, quantity',
          timestamp: new Date()?.toISOString()
        });
      }

      if (!ibClient?.connected) {
        return res?.status(503)?.json({
          ok: false,
          error: 'Cannot place orders - IB Gateway/TWS not connected',
          mode: 'degraded',
          timestamp: new Date()?.toISOString()
        });
      }

      // Place order via IBKR
      const orderResult = await ibClient?.placeOrder({
        symbol,
        side: side?.toUpperCase(),
        quantity: parseInt(quantity),
        price: price ? parseFloat(price) : undefined,
        orderType: orderType?.toUpperCase()
      });

      res?.status(201)?.json({
        ok: true,
        message: 'Order placed successfully',
        order: orderResult,
        timestamp: new Date()?.toISOString()
      });

    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to place order',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  }));

  // Cancel order
  router?.delete('/:orderId', asyncHandler(async (req, res) => {
    try {
      const { orderId } = req?.params;

      if (!ibClient?.connected) {
        return res?.status(503)?.json({
          ok: false,
          error: 'Cannot cancel orders - IB Gateway/TWS not connected',
          mode: 'degraded',
          timestamp: new Date()?.toISOString()
        });
      }

      const result = await ibClient?.cancelOrder(orderId);

      res?.json({
        ok: true,
        message: 'Order cancellation requested',
        order_id: orderId,
        result,
        timestamp: new Date()?.toISOString()
      });

    } catch (error) {
      res?.status(500)?.json({
        ok: false,
        error: 'Failed to cancel order',
        details: error?.message,
        timestamp: new Date()?.toISOString()
      });
    }
  }));

  return router;
};

export default router;