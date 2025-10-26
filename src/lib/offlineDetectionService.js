import React, { useState, useEffect } from 'react';
/**
 * Offline Detection Service
 * Enhanced offline detection with intelligent API failure analysis
 */

import networkRecoveryService from '../services/networkRecoveryService';

class OfflineDetectionService {
  constructor() {
    this.isInitialized = false;
    this.offlineCallbacks = [];
    this.failurePatterns = {
      consecutiveFailures: 0,
      maxConsecutiveFailures: 3,
      totalFailures: 0,
      lastFailureTime: null,
      failureTypes: new Map(),
      criticalEndpointsDown: new Set()
    };
    
    // Critical endpoints that indicate system-wide issues
    this.criticalEndpoints = [
      '/api/health',
      '/api/market',
      '/api/positions',
      'https://query1.finance.yahoo.com',
      'https://query2.finance.yahoo.com'
    ];
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // Listen for network state changes
    window.addEventListener('networkStateChange', this.handleNetworkStateChange?.bind(this));
    
    // Monitor fetch failures globally
    this.interceptFetchFailures();
    
    // Listen for unhandled promise rejections (often network related)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection?.bind(this));
    
    this.isInitialized = true;
    console.log('🛡️ Offline Detection Service initialized');
  }

  // Intercept fetch failures to detect patterns
  interceptFetchFailures() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Reset failure counter on successful request
        if (response?.ok) {
          this.recordSuccess(args?.[0]);
        } else {
          this.recordFailure(args?.[0], `HTTP ${response?.status}`);
        }
        
        return response;
      } catch (error) {
        this.recordFailure(args?.[0], error?.message);
        throw error;
      }
    };
  }

  // Record successful API call
  recordSuccess(url) {
    const endpoint = this.normalizeEndpoint(url);
    
    // Reset consecutive failures on any success
    if (this.failurePatterns?.consecutiveFailures > 0) {
      console.log('✅ API success detected - resetting failure counter');
      this.failurePatterns.consecutiveFailures = 0;
      this.failurePatterns?.criticalEndpointsDown?.clear();
    }
  }

  // Record API failure and analyze patterns
  recordFailure(url, errorMessage) {
    const endpoint = this.normalizeEndpoint(url);
    const now = Date.now();
    
    this.failurePatterns.consecutiveFailures++;
    this.failurePatterns.totalFailures++;
    this.failurePatterns.lastFailureTime = now;
    
    // Track failure types
    const failureType = this.categorizeFailure(errorMessage);
    this.failurePatterns?.failureTypes?.set(
      failureType, 
      (this.failurePatterns?.failureTypes?.get(failureType) || 0) + 1
    );
    
    // Track critical endpoint failures
    if (this.isCriticalEndpoint(endpoint)) {
      this.failurePatterns?.criticalEndpointsDown?.add(endpoint);
      console.warn(`🚨 Critical endpoint failure: ${endpoint} - ${errorMessage}`);
    }
    
    console.warn(`📊 Failure recorded: ${endpoint} (${this.failurePatterns?.consecutiveFailures} consecutive)`);
    
    // Check if we should trigger offline state
    this.evaluateOfflineState();
  }

  // Normalize endpoint for consistent tracking
  normalizeEndpoint(url) {
    try {
      if (typeof url === 'string') {
        if (url?.startsWith('http')) {
          const urlObj = new URL(url);
          return `${urlObj?.origin}${urlObj?.pathname}`;
        }
        return url;
      }
      return 'unknown';
    } catch (error) {
      return 'invalid-url';
    }
  }

  // Check if endpoint is critical for system operation
  isCriticalEndpoint(endpoint) {
    return this.criticalEndpoints?.some(critical => 
      endpoint?.includes(critical) || critical?.includes(endpoint)
    );
  }

  // Categorize failure types for analysis
  categorizeFailure(errorMessage) {
    const message = errorMessage?.toLowerCase();
    
    if (message?.includes('network error') || message?.includes('failed to fetch')) {
      return 'network';
    } else if (message?.includes('timeout')) {
      return 'timeout';  
    } else if (message?.includes('cors')) {
      return 'cors';
    } else if (message?.includes('404') || message?.includes('not found')) {
      return 'not_found';
    } else if (message?.includes('500') || message?.includes('internal server')) {
      return 'server_error';
    } else if (message?.includes('503') || message?.includes('service unavailable')) {
      return 'service_unavailable';
    }
    
    return 'unknown';
  }

  // Evaluate if system should be considered offline
  evaluateOfflineState() {
    const {
      consecutiveFailures,
      maxConsecutiveFailures,
      criticalEndpointsDown,
      failureTypes,
      lastFailureTime
    } = this.failurePatterns;
    
    // Immediate offline conditions
    const shouldGoOffline = (
      // Too many consecutive failures
      (consecutiveFailures >= maxConsecutiveFailures ||
      
      // Multiple critical endpoints down
      criticalEndpointsDown?.size >= 2 ||
      
      // High network failure rate
      (failureTypes?.get('network') || 0) >= 3 || // Recent pattern of timeouts
      (failureTypes?.get('timeout') || 0) >= 2)
    );

    if (shouldGoOffline && navigator.onLine) {
      console.error('🚨 Offline state detected based on failure patterns');
      this.triggerOfflineState('api_failures');
    }
  }

  // Trigger offline state with reason
  triggerOfflineState(reason) {
    const offlineData = {
      reason,
      timestamp: new Date()?.toISOString(),
      failurePatterns: { ...this.failurePatterns },
      networkStatus: networkRecoveryService?.getStatus(),
      userAgent: navigator.userAgent,
      url: window.location?.href
    };
    
    // Store offline reason for debugging
    localStorage.setItem('offlineReason', JSON.stringify(offlineData));
    localStorage.setItem('lastOfflineTime', Date.now()?.toString());
    
    // Notify all callbacks
    this.offlineCallbacks?.forEach(callback => {
      try {
        callback(offlineData);
      } catch (error) {
        console.error('Offline callback error:', error);
      }
    });
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('systemOfflineDetected', {
      detail: offlineData
    }));
    
    console.error('📴 System offline state triggered:', offlineData);
  }

  // Handle network state changes from network recovery service
  handleNetworkStateChange(event) {
    const { state } = event?.detail;
    
    if (state === 'offline') {
      this.triggerOfflineState('network_disconnected');
    } else if (state === 'online') {
      // Reset failure patterns when connection is restored
      this.resetFailurePatterns();
    }
  }

  // Handle unhandled promise rejections (often network related)
  handleUnhandledRejection(event) {
    const error = event?.reason;
    
    if (error && typeof error === 'object') {
      const message = error?.message || error?.toString();
      
      // Check if it's a network-related error
      if (this.isNetworkRelatedError(message)) {
        console.warn('🚨 Unhandled network rejection detected:', message);
        this.recordFailure('unhandled_rejection', message);
      }
    }
  }

  // Check if error is network-related
  isNetworkRelatedError(message) {
    const networkKeywords = [
      'network error',
      'failed to fetch',
      'connection refused',
      'timeout',
      'cors',
      'net::err_',
      'request failed'
    ];
    
    return networkKeywords?.some(keyword => 
      message?.toLowerCase()?.includes(keyword)
    );
  }

  // Reset failure patterns (called when connection is restored)
  resetFailurePatterns() {
    console.log('🔄 Resetting failure patterns - connection restored');
    this.failurePatterns = {
      consecutiveFailures: 0,
      totalFailures: 0,
      lastFailureTime: null,
      failureTypes: new Map(),
      criticalEndpointsDown: new Set()
    };
  }

  // Add callback for offline detection
  onOffline(callback) {
    this.offlineCallbacks?.push(callback);
  }

  // Remove offline callback
  removeOfflineCallback(callback) {
    this.offlineCallbacks = this.offlineCallbacks?.filter(cb => cb !== callback);
  }

  // Get current failure statistics
  getFailureStats() {
    return {
      ...this.failurePatterns,
      failureTypes: Object.fromEntries(this.failurePatterns?.failureTypes),
      criticalEndpointsDown: Array.from(this.failurePatterns?.criticalEndpointsDown)
    };
  }

  // Manual offline detection trigger (for testing or manual intervention)
  triggerManualOffline(reason = 'manual_trigger') {
    this.triggerOfflineState(reason);
  }

  // Check if system should be considered offline based on current patterns
  shouldBeOffline() {
    const {
      consecutiveFailures,
      maxConsecutiveFailures,
      criticalEndpointsDown
    } = this.failurePatterns;
    
    return (consecutiveFailures >= maxConsecutiveFailures ||
    criticalEndpointsDown?.size >= 2 || !navigator.onLine);
  }

  // Cleanup
  destroy() {
    window.removeEventListener('networkStateChange', this.handleNetworkStateChange);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    this.offlineCallbacks = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
const offlineDetectionService = new OfflineDetectionService();

export default offlineDetectionService;

// React hook for using offline detection
export const useOfflineDetection = () => {
  const [offlineData, setOfflineData] = React.useState(null);
  const [failureStats, setFailureStats] = React.useState({});
  
  React.useEffect(() => {
    const handleOffline = (data) => {
      setOfflineData(data);
    };
    
    offlineDetectionService?.onOffline(handleOffline);
    
    // Update failure stats periodically
    const interval = setInterval(() => {
      setFailureStats(offlineDetectionService?.getFailureStats());
    }, 5000);
    
    return () => {
      offlineDetectionService?.removeOfflineCallback(handleOffline);
      clearInterval(interval);
    };
  }, []);
  
  return {
    offlineData,
    failureStats,
    shouldBeOffline: offlineDetectionService?.shouldBeOffline(),
    triggerManualOffline: (reason) => offlineDetectionService?.triggerManualOffline(reason)
  };
};