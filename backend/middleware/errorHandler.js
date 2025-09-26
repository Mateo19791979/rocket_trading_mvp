export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err?.message);
  
  // IB API specific errors
  if (err?.message?.includes('Not connected')) {
    return res?.status(503)?.json({
      error: 'service_unavailable',
      message: 'IB Gateway/TWS is not available. Please check your connection.',
      code: 'IB_DISCONNECTED'
    });
  }

  if (err?.message?.includes('Market orders are disabled')) {
    return res?.status(400)?.json({
      error: 'market_orders_disabled',
      message: 'Market orders are not allowed. Use LIMIT orders only.',
      code: 'MARKET_ORDER_BLOCKED'
    });
  }

  if (err?.message?.includes('exceeds maximum')) {
    return res?.status(400)?.json({
      error: 'risk_limit_exceeded',
      message: err?.message,
      code: 'ORDER_VALUE_TOO_HIGH'
    });
  }

  if (err?.message?.includes('validation failed')) {
    return res?.status(400)?.json({
      error: 'validation_error',
      message: err?.message,
      code: 'INVALID_ORDER_DATA'
    });
  }

  // Generic error
  res?.status(500)?.json({
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))?.catch(next);
  };
};