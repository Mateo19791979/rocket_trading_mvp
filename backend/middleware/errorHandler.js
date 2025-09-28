export const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error:', err);

  const error = {
    message: err?.message || 'Internal server error',
    path: req?.path,
    method: req?.method,
    timestamp: new Date()?.toISOString(),
    requestId: req?.id || 'unknown'
  };

  // Supabase-specific errors
  if (err?.message?.includes('supabase') || err?.message?.includes('database')) {
    return res?.status(503)?.json({
      error: 'database_error',
      ...error,
      suggestion: 'Check Supabase connection and credentials'
    });
  }

  // IB-specific errors
  if (err?.message?.includes('Not connected')) {
    return res?.status(503)?.json({
      error: 'service_unavailable',
      message: 'IB Gateway/TWS is not available. Please check your connection.',
      code: 'IB_DISCONNECTED',
      ...error
    });
  }

  if (err?.message?.includes('Market orders are disabled')) {
    return res?.status(400)?.json({
      error: 'market_orders_disabled',
      message: 'Market orders are not allowed. Use LIMIT orders only.',
      code: 'MARKET_ORDER_BLOCKED',
      ...error
    });
  }

  if (err?.message?.includes('exceeds maximum')) {
    return res?.status(400)?.json({
      error: 'risk_limit_exceeded',
      message: err?.message,
      code: 'ORDER_VALUE_TOO_HIGH',
      ...error
    });
  }

  if (err?.message?.includes('validation failed')) {
    return res?.status(400)?.json({
      error: 'validation_error',
      message: err?.message,
      code: 'INVALID_ORDER_DATA',
      ...error
    });
  }

  // Rate limit errors
  if (err?.message?.includes('rate limit')) {
    return res?.status(429)?.json({
      error: 'rate_limit_exceeded',
      ...error,
      retryAfter: 60
    });
  }

  // Authentication errors
  if (err?.message?.includes('unauthorized') || err?.message?.includes('JWT')) {
    return res?.status(401)?.json({
      error: 'authentication_error',
      ...error,
      suggestion: 'Check authentication token'
    });
  }

  // Trading/Order errors
  if (err?.message?.includes('order') || err?.message?.includes('position')) {
    return res?.status(422)?.json({
      error: 'trading_error',
      ...error,
      suggestion: 'Check order parameters and market conditions'
    });
  }

  // Generic error with enhanced details
  res?.status(500)?.json({
    error: 'internal_server_error',
    ...error,
    support: 'Contact support if this error persists'
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))?.catch(next);
  };
};