const express = require('express');
const { register } = require('../services/prometheusMetrics');
const router = express?.Router();

/**
 * Prometheus metrics endpoint
 * This endpoint is scraped by Prometheus server
 */
router?.get('/metrics', async (req, res) => {
  try {
    res?.set('Content-Type', register?.contentType);
    res?.end(await register?.metrics());
  } catch (error) {
    console.error('Error generating Prometheus metrics:', error);
    res?.status(500)?.end('Error generating metrics');
  }
});

/**
 * Health check endpoint for monitoring
 */
router?.get('/readyz', (req, res) => {
  res?.status(200)?.json({
    status: 'ready',
    timestamp: new Date()?.toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env?.npm_package_version || '1.0.0'
  });
});

/**
 * Sentry test endpoint for preflight checks
 */
router?.get('/debug/sentry-test', (req, res) => {
  // This would trigger a Sentry event in production
  console.log('Sentry test endpoint called');
  res?.status(200)?.json({
    message: 'Sentry test successful',
    timestamp: new Date()?.toISOString()
  });
});

module.exports = router;