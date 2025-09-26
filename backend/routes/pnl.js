import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

export const createPnlRoutes = (ibClient) => {
  router?.get('/', asyncHandler(async (req, res) => {
    if (!ibClient?.connected) {
      // Return cached data or empty response in degraded mode
      return res?.json({
        dailyPnL: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        error: 'IB Gateway/TWS not connected',
        mode: 'degraded',
        timestamp: new Date()?.toISOString()
      });
    }

    const pnl = await ibClient?.getPnl();
    res?.json(pnl);
  }));

  return router;
};