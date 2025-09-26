import { useState, useEffect } from 'react';
import { RefreshCcw, Wifi, WifiOff, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { browserDataSchedulerService } from '../../services/dataSchedulerService';
import { marketDataService } from '../../services/marketDataService';
import Button from './Button';

export function DataSyncStatus({ className = '', showDetails = true }) {
  const [freshness, setFreshness] = useState({
    isFresh: false,
    lastUpdate: null,
    source: null,
    minutesSinceUpdate: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  // Check data freshness on mount and every 30 seconds
  useEffect(() => {
    const checkFreshness = async () => {
      try {
        const status = await browserDataSchedulerService?.checkDataFreshness();
        setFreshness(status);
        setError(null);
      } catch (err) {
        setError(err?.message);
      }
    };

    checkFreshness();
    const interval = setInterval(checkFreshness, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const result = await marketDataService?.refreshData();
      setLastRefresh(new Date());
      
      if (result?.success) {
        // Refresh status after successful sync
        setTimeout(async () => {
          const status = await browserDataSchedulerService?.checkDataFreshness();
          setFreshness(status);
        }, 2000);
      } else {
        setError(result?.message);
      }
    } catch (err) {
      setError(err?.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (isRefreshing) {
      return <RefreshCcw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (freshness?.isFresh) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isRefreshing) return 'Syncing data...';
    if (error) return 'Sync error';
    if (freshness?.isFresh) return 'Data is current';
    if (freshness?.minutesSinceUpdate > 60) return 'Data is stale';
    return `Updated ${freshness?.minutesSinceUpdate}m ago`;
  };

  const getStatusColor = () => {
    if (isRefreshing) return 'text-blue-600';
    if (error) return 'text-red-600';
    if (freshness?.isFresh) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      {/* Connection Status */}
      <div className="flex items-center">
        {freshness?.source ? (
          <Wifi className="h-4 w-4 text-green-500" title={`Data from ${freshness?.source}`} />
        ) : (
          <WifiOff className="h-4 w-4 text-gray-400" title="No data source" />
        )}
      </div>
      {/* Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        className="h-8 px-2"
      >
        <RefreshCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      {/* Details Panel */}
      {showDetails && (freshness?.lastUpdate || error) && (
        <div className="text-xs text-gray-500 ml-4">
          {error ? (
            <span className="text-red-500">Error: {error}</span>
          ) : freshness?.lastUpdate ? (
            <span>
              Last: {new Date(freshness.lastUpdate)?.toLocaleTimeString()}
              {freshness?.source && ` (${freshness?.source})`}
            </span>
          ) : (
            <span>No recent updates</span>
          )}
          {lastRefresh && (
            <span className="ml-2 text-green-600">
              • Manual sync: {lastRefresh?.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}