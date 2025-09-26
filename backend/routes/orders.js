import { Router } from 'express';
import { validateOrder } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { MarketStatus } from '../lib/marketStatus.js';

const router = Router();

export const createOrderRoutes = (ibClient) => {
  // Place new order
  router?.post('/', validateOrder, asyncHandler(async (req, res) => {
    const { symbol, side, qty, type, limit, tif, clientTag } = req?.body;
    
    // Check if market is open (basic check)
    const marketStatus = MarketStatus?.getMarketStatus('NYSE');
    if (marketStatus?.status === 'CLOSED') {
      return res?.status(400)?.json({
        error: 'market_closed',
        message: 'Cannot place orders when market is closed',
        marketStatus
      });
    }

    if (!ibClient?.connected) {
      return res?.status(503)?.json({
        error: 'service_unavailable',
        message: 'IB Gateway/TWS is not connected. Please check your connection.',
        suggestion: 'Ensure IB Gateway or TWS is running and accessible'
      });
    }

    const result = await ibClient?.placeOrder(symbol, side, qty, type, limit, tif, clientTag);
    res?.json(result);
  }));

  // Get order status
  router?.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req?.params;
    
    if (!ibClient?.connected) {
      return res?.status(503)?.json({
        error: 'service_unavailable',
        message: 'IB Gateway/TWS is not connected'
      });
    }

    const order = await ibClient?.getOrder(id);
    res?.json(order);
  }));

  return router;
};