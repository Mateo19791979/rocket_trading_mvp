import React, { useState } from 'react';
import { FileText, Clock, Download, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function DailyReportsPanel() {
  const [reports] = useState([
    {
      id: 'daily-001',
      name: 'Daily Intelligence Report',
      status: 'completed',
      generatedAt: '08:30',
      size: '2.4MB',
      type: 'PDF',
      metrics: { trades: 1247, pnl: '+$8,429.12', accuracy: '94.2%' }
    },
    {
      id: 'daily-002',
      name: 'Performance Summary',
      status: 'processing',
      generatedAt: '09:15',
      size: '1.8MB',
      type: 'PDF',
      metrics: { trades: 892, pnl: '+$3,105.47', accuracy: '91.8%' }
    },
    {
      id: 'daily-003',
      name: 'Compliance Report',
      status: 'scheduled',
      generatedAt: '10:00',
      size: '--',
      type: 'PDF',
      metrics: { trades: '--', pnl: '--', accuracy: '--' }
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/20 border-green-400/40';
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40';
      case 'scheduled':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/40';
      case 'failed':
        return 'text-red-400 bg-red-400/20 border-red-400/40';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/40';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <TrendingUp className="w-3 h-3" />;
      case 'processing':
        return <Clock className="w-3 h-3 animate-spin" />;
      case 'scheduled':
        return <Calendar className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Daily Reports</h3>
          </div>
          <button className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-500/40 rounded text-slate-300 text-xs transition-colors">
            Schedule New
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {reports?.map((report) => (
          <div
            key={report?.id}
            className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{report?.name}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{report?.generatedAt}</span>
                  <span>•</span>
                  <span>{report?.size}</span>
                  <span>•</span>
                  <span>{report?.type}</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor(report?.status)}`}>
                {getStatusIcon(report?.status)}
                <span className="capitalize">{report?.status}</span>
              </div>
            </div>

            {report?.status === 'completed' && (
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-600/30">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Trades</div>
                  <div className="font-mono text-xs text-white">{report?.metrics?.trades}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">PnL</div>
                  <div className="font-mono text-xs text-green-400">{report?.metrics?.pnl}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Accuracy</div>
                  <div className="font-mono text-xs text-blue-400">{report?.metrics?.accuracy}</div>
                </div>
              </div>
            )}

            {report?.status === 'completed' && (
              <div className="mt-3 flex justify-end">
                <button className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded text-blue-300 text-xs font-medium transition-colors flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Auto-Generation Settings */}
      <div className="p-4 border-t border-slate-600/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Auto-Generation</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-green-600/30 border border-green-500/40 rounded-full relative">
              <div className="w-3 h-3 bg-green-400 rounded-full absolute right-0.5 top-0.5 transition-all duration-200"></div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Next report: Today at 11:30 AM
        </div>
      </div>
    </div>
  );
}