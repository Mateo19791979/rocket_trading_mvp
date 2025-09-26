import { useState, useEffect } from 'react';
import { Activity, Database, Wifi, AlertTriangle, CheckCircle, Clock, RefreshCcw } from 'lucide-react';
import { browserDataSchedulerService } from '../../../services/dataSchedulerService';
import { marketDataService } from '../../../services/marketDataService';
import { DataSyncStatus } from '../../../components/ui/DataSyncStatus';
import Button from '../../../components/ui/Button';

export function RealTimeDataPanel() {
  const [syncHistory, setSyncHistory] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);
  const [dataStats, setDataStats] = useState({
    totalSymbols: 0,
    lastUpdate: null,
    successRate: 0,
    apiSources: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDataStatus = async () => {
    try {
      // Get sync history
      const history = await browserDataSchedulerService?.getSyncJobHistory(10);
      setSyncHistory(history);

      // Get market status
      const status = await marketDataService?.getMarketStatus();
      setMarketStatus(status);

      // Get data statistics
      const stats = await getDataStatistics();
      setDataStats(stats);

    } catch (error) {
      console.error('Failed to fetch data status:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getDataStatistics = async () => {
    try {
      const marketData = await marketDataService?.getMarketData([]);
      const symbols = await marketDataService?.getAvailableSymbols();
      
      // Calculate success rate from recent sync history
      const recentJobs = syncHistory?.filter(job => {
        const jobDate = new Date(job.started_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return jobDate > dayAgo;
      }) || [];

      const successfulJobs = recentJobs?.filter(job => job?.status === 'completed')?.length;
      const successRate = recentJobs?.length > 0 ? (successfulJobs / recentJobs?.length) * 100 : 0;

      // Extract unique API sources
      const apiSources = [...new Set(syncHistory?.map(job => job.api_source).filter(Boolean))] || [];

      return {
        totalSymbols: symbols?.length || 0,
        lastUpdate: marketData?.lastUpdate,
        successRate: Math.round(successRate),
        apiSources
      };
    } catch (error) {
      return {
        totalSymbols: 0,
        lastUpdate: null,
        successRate: 0,
        apiSources: []
      };
    }
  };

  useEffect(() => {
    fetchDataStatus();
    const interval = setInterval(fetchDataStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'running': return <RefreshCcw className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center animate-pulse">
          <Database className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Loading Real-Time Data Status...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Real-Time Data Status</h3>
          </div>
          <DataSyncStatus showDetails={false} />
        </div>
      </div>
      <div className="p-6">
        {/* Market Status */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Market Status</h4>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-2 rounded-lg ${
              marketStatus?.isOpen ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
            }`}>
              <Activity className={`h-4 w-4 mr-2 ${marketStatus?.isOpen ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-medium">
                {marketStatus?.status || 'UNKNOWN'}
              </span>
            </div>
            {marketStatus?.nextOpen && (
              <span className="text-sm text-gray-500">
                Next open: {new Date(marketStatus.nextOpen)?.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Active Symbols</p>
                <p className="text-lg font-semibold text-blue-600">{dataStats?.totalSymbols}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">Success Rate</p>
                <p className="text-lg font-semibold text-green-600">{dataStats?.successRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-purple-900">API Sources</p>
                <p className="text-lg font-semibold text-purple-600">{dataStats?.apiSources?.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Last Update</p>
                <p className="text-sm font-semibold text-yellow-600">
                  {dataStats?.lastUpdate ? new Date(dataStats.lastUpdate)?.toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Sources */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Data Sources</h4>
          <div className="flex flex-wrap gap-2">
            {dataStats?.apiSources?.map((source, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {source}
              </span>
            ))}
            {dataStats?.apiSources?.length === 0 && (
              <span className="text-sm text-gray-500 italic">No active data sources</span>
            )}
          </div>
        </div>

        {/* Recent Sync Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Recent Sync Jobs</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDataStatus}
              className="h-8 px-3"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {syncHistory?.length > 0 ? (
              syncHistory?.map((job) => (
                <div
                  key={job?.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(job?.status)}`}>
                      {getStatusIcon(job?.status)}
                      <span className="ml-1 capitalize">{job?.status}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {job?.job_type} - {job?.asset_symbol}
                      </p>
                      <p className="text-xs text-gray-500">
                        {job?.api_source} • {job?.data_points_synced || 0} symbols
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(job.started_at)?.toLocaleString()}
                    </p>
                    {job?.error_message && (
                      <p className="text-xs text-red-500 max-w-xs truncate" title={job?.error_message}>
                        {job?.error_message}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No sync jobs recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}