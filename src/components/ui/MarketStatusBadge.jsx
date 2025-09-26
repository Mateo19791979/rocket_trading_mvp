import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { marketStatusService } from '../../services/marketStatusService';

const MarketStatusBadge = ({ exchange = 'NYSE', showCountdown = true, className = '' }) => {
  const [marketStatus, setMarketStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMarketStatus = async () => {
    try {
      setLoading(true);
      const [status, countdownData] = await Promise.all([
        marketStatusService?.getMarketStatus(exchange),
        marketStatusService?.getMarketCountdown(exchange)
      ]);
      
      setMarketStatus(status);
      setCountdown(countdownData);
    } catch (error) {
      console.error('Failed to load market status:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = async () => {
    try {
      const newCountdown = await marketStatusService?.getMarketCountdown(exchange);
      setCountdown(newCountdown);
    } catch (error) {
      // Silently handle countdown update errors
    }
  };

  useEffect(() => {
    loadMarketStatus();
    const interval = setInterval(loadMarketStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [exchange]);

  useEffect(() => {
    if (!showCountdown || !countdown) return;
    
    const countdownInterval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [countdown, showCountdown]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-success/20 text-success border-success/30';
      case 'CLOSED':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status, isOpen) => {
    if (isOpen) return 'TrendingUp';
    return 'Clock';
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full border bg-muted/20 text-muted-foreground border-border ${className}`}>
        <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-sm font-medium font-data">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(marketStatus?.status)} ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon 
          name={getStatusIcon(marketStatus?.status, marketStatus?.isOpen)} 
          size={16} 
        />
        <span className="text-sm font-semibold font-data">
          {marketStatus?.exchange} {marketStatus?.status}
        </span>
        
        {showCountdown && countdown && (
          <>
            <span className="text-xs opacity-60">•</span>
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={12} className="opacity-60" />
              <span className="text-xs font-mono font-data">
                {countdown?.formatted}
              </span>
            </div>
          </>
        )}
      </div>
      
      {/* Pulse animation for open market */}
      {marketStatus?.isOpen && (
        <div className="w-2 h-2 bg-success rounded-full animate-pulse ml-2"></div>
      )}
    </div>
  );
};

export default MarketStatusBadge;