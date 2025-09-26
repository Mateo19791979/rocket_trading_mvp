import { Router } from 'express';
import { MarketStatus } from '../lib/marketStatus.js';
import { validateMarketStatus } from '../middleware/validation.js';

const router = Router();

export const createMarketRoutes = () => {
  router?.get('/status', validateMarketStatus, (req, res) => {
    const { ex } = req?.query;
    const status = MarketStatus?.getMarketStatus(ex);
    res?.json(status);
  });

  return router;
};