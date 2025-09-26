import { Router } from 'express';

const router = Router();

export const createHealthRoutes = (ibClient) => {
  router?.get('/', (req, res) => {
    const health = {
      status: 'ok',
      ibkr: ibClient?.connected ? 'connected' : 'disconnected',
      time: new Date()?.toISOString(),
      accounts: ibClient?.accounts?.length,
      orders: ibClient?.orders?.size,
      positions: ibClient?.positions?.size
    };
    
    res?.json(health);
  });

  return router;
};