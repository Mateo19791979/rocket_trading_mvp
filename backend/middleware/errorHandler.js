/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))?.catch(next);
};

/**
 * Enhanced global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    message: err?.message,
    stack: process.env?.NODE_ENV === 'development' ? err?.stack : undefined,
    url: req?.url,
    method: req?.method,
    timestamp: new Date()?.toISOString()
  });

  // Default error response
  let error = {
    ok: false,
    error: 'Internal server error',
    timestamp: new Date()?.toISOString(),
    path: req?.originalUrl,
    method: req?.method
  };

  // Handle specific error types
  if (err?.name === 'ValidationError') {
    error.error = 'Validation failed';
    error.details = err?.message;
    return res?.status(400)?.json(error);
  }

  if (err?.name === 'CastError') {
    error.error = 'Invalid ID format';
    return res?.status(400)?.json(error);
  }

  if (err?.code === 11000) {
    error.error = 'Duplicate field value';
    error.field = Object?.keys(err?.keyValue)?.[0];
    return res?.status(400)?.json(error);
  }

  // IBKR specific errors
  if (err?.message?.includes('IB Gateway') || err?.message?.includes('TWS')) {
    error.error = 'Trading system unavailable';
    error.details = 'IB Gateway/TWS connection required';
    error.fallback_available = true;
    return res?.status(503)?.json(error);
  }

  // Network/connection errors
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT' || err?.code === 'ENOTFOUND') {
    error.error = 'Service unavailable';
    error.details = 'External service connection failed';
    error.retry_after = 30;
    return res?.status(503)?.json(error);
  }

  // Database errors
  if (err?.message?.includes('Supabase') || 
      err?.message?.includes('database') || 
      err?.code?.startsWith('42')) {
    error.error = 'Database unavailable';
    error.details = 'Database connection or query failed';
    error.fallback_available = true;
    return res?.status(503)?.json(error);
  }

  // Authentication errors
  if (err?.status === 401 || err?.message?.includes('Unauthorized')) {
    error.error = 'Unauthorized';
    error.details = 'Authentication required';
    return res?.status(401)?.json(error);
  }

  // Permission errors
  if (err?.status === 403 || err?.message?.includes('Forbidden')) {
    error.error = 'Forbidden';
    error.details = 'Insufficient permissions';
    return res?.status(403)?.json(error);
  }

  // Rate limiting errors
  if (err?.status === 429) {
    error.error = 'Too many requests';
    error.details = 'Rate limit exceeded';
    error.retry_after = 60;
    return res?.status(429)?.json(error);
  }

  // JSON parsing errors
  if (err?.type === 'entity.parse.failed') {
    error.error = 'Invalid JSON payload';
    error.details = 'Request body must be valid JSON';
    return res?.status(400)?.json(error);
  }

  // Request timeout errors
  if (err?.code === 'TIMEOUT' || err?.message?.includes('timeout')) {
    error.error = 'Request timeout';
    error.details = 'Request took too long to process';
    error.retry_after = 30;
    return res?.status(408)?.json(error);
  }

  // Default 500 error
  error.details = process?.env?.NODE_ENV === 'development' 
    ? err?.message 
    : 'Please try again later';
    
  if (process?.env?.NODE_ENV === 'development') {
    error.debug_info = {
      stack: err?.stack?.split('\n')?.slice(0, 5),
      code: err?.code,
      name: err?.name
    };
  }

  res?.status(500)?.json(error);
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req, res) => {
  res?.status(404)?.json({
    ok: false,
    error: 'Route not found',
    message: `The requested endpoint ${req?.method} ${req?.originalUrl} does not exist`,
    path: req?.originalUrl,
    method: req?.method,
    timestamp: new Date()?.toISOString(),
    suggestion: 'Check API documentation for available endpoints'
  });
};

/**
 * Request timeout middleware
 */
export const timeoutHandler = (timeout = 30000) => (req, res, next) => {
  const timeoutId = setTimeout(() => {
    if (!res?.headersSent) {
      res?.status(408)?.json({
        ok: false,
        error: 'Request timeout',
        details: `Request exceeded ${timeout}ms timeout`,
        timestamp: new Date()?.toISOString()
      });
    }
  }, timeout);

  // Clear timeout when response is sent
  const originalSend = res?.send;
  res.send = function(...args) {
    clearTimeout(timeoutId);
    return originalSend?.apply(this, args);
  };

  next();
};

export default {
  asyncHandler,
  errorHandler,
  notFoundHandler,
  timeoutHandler
};