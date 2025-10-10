import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader, Filter } from 'lucide-react';

export default function TaskQueue({ tasks }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'running': return <Loader className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'timeout': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'stale': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'running': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'done': return 'bg-green-50 text-green-700 border-green-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      case 'timeout': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'stale': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return 'Not started';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end?.getTime() - start?.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp)?.toLocaleDateString();
  };

  const filteredTasks = tasks?.filter(task => {
    const statusMatch = statusFilter === 'all' || task?.status === statusFilter;
    const agentMatch = agentFilter === 'all' || task?.agent_name === agentFilter;
    return statusMatch && agentMatch;
  }) || [];

  const uniqueAgents = [...new Set(tasks?.map(task => task?.agent_name) || [])];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Task Queue</h2>
            <p className="text-gray-600 text-sm mt-1">{filteredTasks?.length} tasks shown</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e?.target?.value)}
                className="border border-gray-200 rounded px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="done">Done</option>
                <option value="failed">Failed</option>
                <option value="timeout">Timeout</option>
                <option value="stale">Stale</option>
              </select>
            </div>
            
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e?.target?.value)}
              className="border border-gray-200 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Agents</option>
              {uniqueAgents?.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredTasks?.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Found</h3>
            <p className="text-gray-600">No tasks match the current filters.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredTasks?.map((task) => (
              <div key={task?.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task?.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {task?.task_type || 'Unknown Task'}
                      </h3>
                      <p className="text-sm text-gray-600">{task?.agent_name || 'Unknown Agent'}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task?.status)}`}>
                      {task?.status || 'unknown'}
                    </span>
                    {task?.priority > 0 && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Priority: {task?.priority}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                  <div>
                    <span className="font-medium">Created:</span> {formatRelativeTime(task?.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {formatDuration(task?.started_at, task?.updated_at)}
                  </div>
                </div>
                
                {task?.payload && Object.keys(task?.payload)?.length > 0 && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-700 font-medium">View Payload</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(task?.payload, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                
                {task?.result && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-green-700 font-medium">View Result</summary>
                      <pre className="mt-2 p-2 bg-green-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(task?.result, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                
                {task?.error && (
                  <div className="mt-2">
                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                      <span className="text-red-700 text-sm font-medium">Error: </span>
                      <span className="text-red-600 text-sm">{task?.error}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}