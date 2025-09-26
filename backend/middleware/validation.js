import { z } from 'zod';

// Order validation schema
export const OrderSchema = z?.object({
  symbol: z?.string()?.min(1)?.max(10)?.regex(/^[A-Z]+$/, 'Symbol must be uppercase letters only'),
  side: z?.enum(['BUY', 'SELL']),
  qty: z?.number()?.int()?.positive()?.max(10000),
  type: z?.enum(['LIMIT', 'MARKET']),
  limit: z?.number()?.positive()?.optional(),
  tif: z?.enum(['DAY', 'GTC'])?.default('DAY'),
  clientTag: z?.string()?.max(50)?.optional()
})?.refine(data => {
  if (data?.type === 'LIMIT' && !data?.limit) {
    return false;
  }
  return true;
}, {
  message: "Limit price is required for LIMIT orders"
});

// Validation middleware
export const validateOrder = (req, res, next) => {
  try {
    req.body = OrderSchema?.parse(req?.body);
    next();
  } catch (error) {
    res?.status(400)?.json({
      error: 'validation_error',
      details: error?.errors?.map(e => e?.message) || [error?.message]
    });
  }
};

// Market status validation
export const MarketStatusSchema = z?.object({
  ex: z?.enum(['SIX', 'NYSE', 'NASDAQ'])?.default('NYSE')
});

export const validateMarketStatus = (req, res, next) => {
  try {
    req.query = MarketStatusSchema?.parse(req?.query);
    next();
  } catch (error) {
    res?.status(400)?.json({
      error: 'validation_error',
      details: error?.errors?.map(e => e?.message) || [error?.message]
    });
  }
};