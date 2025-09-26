import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

export const createPositionRoutes = (ibClient) => {
  router?.get('/', asyncHandler(async (req, res) => {
    if (!ibClient?.connected) {
      // Return cached data or empty response in degraded mode
      return res?.json({
        positions: [],
        error: 'IB Gateway/TWS not connected',
        mode: 'degraded',
        timestamp: new Date()?.toISOString()
      });
    }

    const positions = await ibClient?.getPositions();
    res?.json(positions);
  }));

  return router;
};