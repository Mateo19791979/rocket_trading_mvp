import React, { useState } from 'react';
        import { motion } from 'framer-motion';
        import { 
          Target, 
          Edit3, 
          Save, 
          Undo, 
          Redo,
          Upload,
          Download,
          GitBranch,
          Clock,
          Settings,
          RefreshCw
        } from 'lucide-react';

        const EditingControls = () => {
          const [isEditing, setIsEditing] = useState(false);
          const [hasChanges, setHasChanges] = useState(false);
          
          const [editingSessions] = useState([
            {
              id: 'session_001',
              user: 'Trading Analyst',
              strategy: 'Momentum RSI Strategy v2.1',
              status: 'active',
              changes: 12,
              startTime: '14:32',
              lastModified: '2 min ago'
            },
            {
              id: 'session_002',
              user: 'Risk Manager', 
              strategy: 'Volatility Trading v1.8',
              status: 'reviewing',
              changes: 7,
              startTime: '13:45',
              lastModified: '15 min ago'
            },
            {
              id: 'session_003',
              user: 'Quantitative Researcher',
              strategy: 'Mean Reversion v3.0',
              status: 'completed',
              changes: 23,
              startTime: '09:20',
              lastModified: '1 hour ago'
            }
          ]);

          const [versionHistory] = useState([
            {
              version: 'v2.1.3',
              timestamp: '2024-09-28T16:30:00Z',
              author: 'Trading Analyst',
              changes: 'Updated risk parameters and exit conditions',
              status: 'current'
            },
            {
              version: 'v2.1.2',
              timestamp: '2024-09-28T14:15:00Z',
              author: 'Risk Manager',
              changes: 'Added volatility filters and position sizing rules',
              status: 'previous'
            },
            {
              version: 'v2.1.1',
              timestamp: '2024-09-27T18:45:00Z',
              author: 'Quantitative Researcher',
              changes: 'Initial strategy deployment and backtesting',
              status: 'previous'
            }
          ]);

          const [batchOperations] = useState({
            totalStrategies: 47,
            selectedStrategies: 12,
            pendingOperations: 3,
            completedOperations: 8
          });

          const handleStartEditing = () => {
            setIsEditing(true);
            setHasChanges(false);
          };

          const handleSaveChanges = () => {
            setHasChanges(false);
            // Save logic here
          };

          const getStatusColor = (status) => {
            switch (status) {
              case 'active':
                return 'border-green-500/20 bg-green-500/10 text-green-300';
              case 'reviewing':
                return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300';
              case 'completed':
                return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
              case 'current':
                return 'border-purple-500/20 bg-purple-500/10 text-purple-300';
              case 'previous':
                return 'border-slate-500/20 bg-slate-500/10 text-slate-300';
              default:
                return 'border-slate-500/20 bg-slate-500/10 text-slate-300';
            }
          };

          return (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-orange-500/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Target className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Interactive Editing Controls</h3>
                    <p className="text-orange-300 text-sm">Manual rule refinement and version control</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={handleStartEditing}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-300 transition-all duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Start Editing</span>
                    </button>
                  ) : (
                    <>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500 rounded-lg text-slate-300 transition-all duration-200">
                        <Undo className="h-4 w-4" />
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500 rounded-lg text-slate-300 transition-all duration-200">
                        <Redo className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                          hasChanges 
                            ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300' :'bg-slate-600/20 border border-slate-600 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Editing Sessions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-4 w-4 text-orange-400" />
                    <span className="text-white font-medium">Active Editing Sessions</span>
                  </div>
                  <button className="text-xs text-orange-300 hover:text-orange-200 transition-colors">
                    View All Sessions
                  </button>
                </div>

                <div className="space-y-3">
                  {editingSessions?.map((session) => (
                    <div key={session?.id} className={`p-4 rounded-lg border ${getStatusColor(session?.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session?.status === 'active' ? 'bg-green-400 animate-pulse' :
                            session?.status === 'reviewing' ? 'bg-yellow-400' : 'bg-blue-400'
                          }`} />
                          <span className="text-white font-medium">{session?.user}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session?.status)} capitalize`}>
                            {session?.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">Started {session?.startTime}</span>
                      </div>

                      <div className="text-sm text-slate-300 mb-2">{session?.strategy}</div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{session?.changes} changes made</span>
                        <span>Last modified {session?.lastModified}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Batch Operations */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-4 w-4 text-orange-400" />
                  <span className="text-white font-medium">Batch Operations</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                    <div className="text-sm text-slate-300">Total Strategies</div>
                    <div className="text-xl font-bold text-white">{batchOperations?.totalStrategies}</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="text-sm text-blue-300">Selected</div>
                    <div className="text-xl font-bold text-white">{batchOperations?.selectedStrategies}</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="text-sm text-yellow-300">Pending</div>
                    <div className="text-xl font-bold text-white">{batchOperations?.pendingOperations}</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="text-sm text-green-300">Completed</div>
                    <div className="text-xl font-bold text-white">{batchOperations?.completedOperations}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500 rounded-lg text-slate-300 text-sm transition-all duration-200">
                    <Upload className="h-4 w-4" />
                    <span>Bulk Upload</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500 rounded-lg text-slate-300 text-sm transition-all duration-200">
                    <Download className="h-4 w-4" />
                    <span>Export Selected</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500 rounded-lg text-slate-300 text-sm transition-all duration-200">
                    <RefreshCw className="h-4 w-4" />
                    <span>Batch Validate</span>
                  </button>
                </div>
              </div>
              {/* Version Control */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <GitBranch className="h-4 w-4 text-orange-400" />
                  <span className="text-white font-medium">Version History</span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {versionHistory?.map((version, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getStatusColor(version?.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-orange-400" />
                          <span className="text-white font-medium">{version?.version}</span>
                          {version?.status === 'current' && (
                            <span className="px-2 py-1 text-xs bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {new Date(version.timestamp)?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-slate-300 mb-2">{version?.changes}</div>
                      <div className="text-xs text-slate-400">Author: {version?.author}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        };

        export default EditingControls;