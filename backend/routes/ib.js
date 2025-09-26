import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

export const createIBRoutes = (ibClient) => {
  // Handshake endpoint
  router?.get('/handshake', asyncHandler(async (req, res) => {
    const result = await ibClient?.handshake();
    res?.json(result);
  }));

  return router;
};