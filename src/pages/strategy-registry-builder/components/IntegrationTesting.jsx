import React, { useState } from 'react';
        import { motion } from 'framer-motion';
        import { 
          Play, 
          Pause, 
          Square, 
          BarChart3, 
          TrendingUp,
          TrendingDown,
          Activity,
          Clock,
          Target,
          Zap
        } from 'lucide-react';

        const IntegrationTesting = () => {
          const [isRunning, setIsRunning] = useState(false);
          const [testProgress, setTestProgress] = useState(67);
          
          const [backtestResults] = useState({
            totalReturn: 23.4,
            sharpeRatio: 1.67,
            maxDrawdown: -8.2,
            winRate: 64.3,
            totalTrades: 147,
            avgTradeReturn: 0.83,
            volatility: 12.4,
            calmarRatio: 2.85
          });

          const [performanceMetrics] = useState([
            { 
              strategy: 'Momentum RSI v2.1',
              status: 'running',
              return: 15.7,
              sharpe: 1.34,
              drawdown: -5.2,
              trades: 89,
              runtime: '14:32'
            },
            {
              strategy: 'Volatility Smile v1.8',
              status: 'completed',
              return: 31.2,
              sharpe: 2.01,
              drawdown: -12.3,
              trades: 156,
              runtime: '23:45'
            },
            {
              strategy: 'Mean Reversion BB v3.0',
              status: 'failed',
              return: -7.4,
              sharpe: -0.45,
              drawdown: -18.9,
              trades: 203,
              runtime: '08:12'
            },
            {
              strategy: 'Options Arbitrage v1.2',
              status: 'queued',
              return: 0,
              sharpe: 0,
              drawdown: 0,
              trades: 0,
              runtime: '00:00'
            }
          ]);

          const [compatibilityTests] = useState([
            { component: 'Orchestrator API', status: 'passed', latency: '45ms' },
            { component: 'Risk Controller', status: 'passed', latency: '23ms' },
            { component: 'Market Data Feed', status: 'warning', latency: '156ms' },
            { component: 'Execution Engine', status: 'passed', latency: '67ms' },
            { component: 'Portfolio Manager', status: 'failed', latency: 'timeout' },
            { component: 'Event Bus', status: 'passed', latency: '12ms' }
          ]);

          const handleToggleTest = () => {
            setIsRunning(!isRunning);
          };

          const getStatusIcon = (status) => {
            switch (status) {
              case 'running':
                return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
              case 'completed':
                return <Target className="h-4 w-4 text-green-400" />;
              case 'failed':
                return <Square className="h-4 w-4 text-red-400" />;
              case 'queued':
                return <Clock className="h-4 w-4 text-yellow-400" />;
              case 'passed':
                return <Target className="h-4 w-4 text-green-400" />;
              case 'warning':
                return <Activity className="h-4 w-4 text-yellow-400" />;
              default:
                return <Square className="h-4 w-4 text-slate-400" />;
            }
          };

          const getStatusColor = (status) => {
            switch (status) {
              case 'running':
                return 'border-blue-500/20 bg-blue-500/10';
              case 'completed': case'passed':
                return 'border-green-500/20 bg-green-500/10';
              case 'failed':
                return 'border-red-500/20 bg-red-500/10';
              case 'queued': case'warning':
                return 'border-yellow-500/20 bg-yellow-500/10';
              default:
                return 'border-slate-500/20 bg-slate-500/10';
            }
          };

          return (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-yellow-500/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Play className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Integration Testing</h3>
                    <p className="text-yellow-300 text-sm">Strategy simulation and orchestrator compatibility</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleTest}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isRunning 
                        ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300' :'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300'
                    }`}
                  >
                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isRunning ? 'Stop Tests' : 'Start Tests'}</span>
                  </button>
                </div>
              </div>
              {/* Test Progress */}
              <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Test Progress</span>
                  <span className="text-sm text-yellow-300">{testProgress}% Complete</span>
                </div>
                <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
                    animate={{ width: `${testProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              {/* Performance Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-300">Total Return</span>
                  </div>
                  <div className="text-lg font-bold text-white">+{backtestResults?.totalReturn}%</div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-blue-300">Sharpe Ratio</span>
                  </div>
                  <div className="text-lg font-bold text-white">{backtestResults?.sharpeRatio}</div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-red-300">Max Drawdown</span>
                  </div>
                  <div className="text-lg font-bold text-white">{backtestResults?.maxDrawdown}%</div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-purple-300">Win Rate</span>
                  </div>
                  <div className="text-lg font-bold text-white">{backtestResults?.winRate}%</div>
                </div>
              </div>
              {/* Strategy Performance */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium">Strategy Performance</span>
                </div>

                <div className="space-y-3">
                  {performanceMetrics?.map((metric, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getStatusColor(metric?.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(metric?.status)}
                          <span className="text-white font-medium">{metric?.strategy}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(metric?.status)} capitalize`}>
                            {metric?.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">Runtime: {metric?.runtime}</span>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Return:</span>
                          <span className={`ml-2 font-medium ${metric?.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {metric?.return > 0 ? '+' : ''}{metric?.return}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Sharpe:</span>
                          <span className="ml-2 text-white font-medium">{metric?.sharpe}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Drawdown:</span>
                          <span className="ml-2 text-red-400 font-medium">{metric?.drawdown}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Trades:</span>
                          <span className="ml-2 text-white font-medium">{metric?.trades}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Compatibility Tests */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="h-4 w-4 text-yellow-400" />
                  <span className="text-white font-medium">Orchestrator Compatibility</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {compatibilityTests?.map((test, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test?.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test?.status)}
                          <span className="text-white text-sm font-medium">{test?.component}</span>
                        </div>
                        <span className="text-xs text-slate-400">{test?.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        };

        export default IntegrationTesting;