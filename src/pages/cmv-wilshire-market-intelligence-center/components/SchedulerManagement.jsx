import React, { useState } from 'react';
import { Calendar, Clock, Play, Pause, Settings, CheckCircle } from 'lucide-react';

export default function SchedulerManagement() {
  const [schedulerStatus, setSchedulerStatus] = useState('active');
  const [cronExpression, setCronExpression] = useState('30 7 * * *');
  const [timezone, setTimezone] = useState('Europe/Zurich');
  const [lastExecution, setLastExecution] = useState(new Date()?.toISOString());

  const getSchedulerStatusColor = () => {
    switch (schedulerStatus) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSchedulerStatusIcon = () => {
    switch (schedulerStatus) {
      case 'active': return <Play className="w-4 h-4 text-green-400" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNextExecution = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow?.setDate(tomorrow?.getDate() + 1);
    tomorrow?.setHours(7, 30, 0, 0);
    return tomorrow?.toLocaleString('fr-FR', { timeZone: timezone });
  };

  const getCronDescription = (cron) => {
    if (cron === '30 7 * * *') return 'Daily at 07:30';
    return 'Custom schedule';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold">Scheduler Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          {getSchedulerStatusIcon()}
          <span className={`text-sm font-medium ${getSchedulerStatusColor()}`}>
            {schedulerStatus?.charAt(0)?.toUpperCase() + schedulerStatus?.slice(1)}
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Cron Configuration */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Schedule Configuration</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cron Expression</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e?.target?.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="30 7 * * *"
                />
                <button className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getCronDescription(cronExpression)} ({timezone})
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e?.target?.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="Europe/Zurich">Europe/Zurich (CET/CEST)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Execution Timeline */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Execution Timeline</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Next Execution:</span>
              <span className="text-sm font-medium text-purple-400">
                {getNextExecution()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Execution:</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">
                  {new Date(lastExecution)?.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Success Rate:</span>
              <span className="text-sm font-medium text-green-400">98.5%</span>
            </div>
          </div>
        </div>

        {/* Manual Controls */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Manual Controls</h3>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setSchedulerStatus(schedulerStatus === 'active' ? 'paused' : 'active')}
              className={`flex-1 px-4 py-2 rounded text-sm font-medium ${
                schedulerStatus === 'active' ?'bg-yellow-600 hover:bg-yellow-700 text-white' :'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {schedulerStatus === 'active' ? (
                <>
                  <Pause className="w-4 h-4 inline mr-2" />
                  Pause Scheduler
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  Resume Scheduler
                </>
              )}
            </button>
          </div>
        </div>

        {/* Execution History */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Recent Executions</h3>
          
          <div className="space-y-2">
            {[
              { time: '07:30:00', status: 'success', sources: 'CMV + Wilshire' },
              { time: '07:30:00', status: 'success', sources: 'CMV + Wilshire' },
              { time: '07:30:00', status: 'success', sources: 'CMV + Wilshire' },
            ]?.map((execution, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-gray-400">Today {execution?.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">{execution?.sources}</span>
                  <span className="text-green-400 text-xs">Success</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}