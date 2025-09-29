import React, { useState } from 'react';
        import { motion } from 'framer-motion';
        import { 
          CheckCircle, 
          AlertTriangle, 
          XCircle, 
          Search, 
          RefreshCw,
          FileCheck,
          AlertCircle,
          Shield
        } from 'lucide-react';

        const RegistryValidation = () => {
          const [validationStatus] = useState({
            totalStrategies: 47,
            validStrategies: 42,
            warningStrategies: 3,
            errorStrategies: 2,
            duplicates: 1,
            conflicts: 2,
            completionRate: 89
          });

          const [validationResults] = useState([
            {
              id: 'strategy_001',
              name: 'Momentum RSI Strategy',
              status: 'valid',
              issues: [],
              confidence: 95
            },
            {
              id: 'strategy_002',
              name: 'Volatility Smile Trading',
              status: 'warning',
              issues: ['Missing stop_loss parameter', 'Risk parameters incomplete'],
              confidence: 78
            },
            {
              id: 'strategy_003',
              name: 'Mean Reversion Bollinger',
              status: 'error',
              issues: ['Invalid YAML syntax', 'Duplicate strategy ID', 'Missing required fields'],
              confidence: 23
            },
            {
              id: 'strategy_004',
              name: 'Options Arbitrage',
              status: 'valid',
              issues: [],
              confidence: 92
            },
            {
              id: 'strategy_005',
              name: 'Statistical Pairs Trading',
              status: 'warning',
              issues: ['Correlation threshold too high'],
              confidence: 85
            }
          ]);

          const [schemaChecks] = useState([
            { check: 'YAML Syntax Validation', status: 'passed', count: 45 },
            { check: 'Required Fields Present', status: 'passed', count: 44 },
            { check: 'Parameter Type Validation', status: 'warning', count: 42 },
            { check: 'Range Validation', status: 'warning', count: 43 },
            { check: 'Duplicate Detection', status: 'error', count: 46 },
            { check: 'Conflict Analysis', status: 'error', count: 45 }
          ]);

          const getStatusIcon = (status) => {
            switch (status) {
              case 'valid': case'passed':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
              case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
              case 'error':
                return <XCircle className="h-4 w-4 text-red-400" />;
              default:
                return <AlertCircle className="h-4 w-4 text-slate-400" />;
            }
          };

          const getStatusColor = (status) => {
            switch (status) {
              case 'valid': case'passed':
                return 'border-green-500/20 bg-green-500/10';
              case 'warning':
                return 'border-yellow-500/20 bg-yellow-500/10';
              case 'error':
                return 'border-red-500/20 bg-red-500/10';
              default:
                return 'border-slate-500/20 bg-slate-500/10';
            }
          };

          return (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-red-500/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Registry Validation</h3>
                    <p className="text-red-300 text-sm">Comprehensive schema checking and conflict analysis</p>
                  </div>
                </div>

                <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all duration-200">
                  <RefreshCw className="h-4 w-4" />
                  <span>Re-validate</span>
                </button>
              </div>
              {/* Validation Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-300">Valid</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{validationStatus?.validStrategies}</div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-yellow-300">Warnings</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{validationStatus?.warningStrategies}</div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-300">Errors</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{validationStatus?.errorStrategies}</div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-300">Conflicts</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{validationStatus?.conflicts}</div>
                </div>
              </div>
              {/* Schema Validation Checks */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileCheck className="h-4 w-4 text-red-400" />
                  <span className="text-white font-medium">Schema Validation Checks</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {schemaChecks?.map((check, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(check?.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(check?.status)}
                          <span className="text-white text-sm font-medium">{check?.check}</span>
                        </div>
                        <span className="text-xs text-slate-400">{check?.count}/{validationStatus?.totalStrategies}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Validation Results */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-white font-medium">Detailed Results</span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {validationResults?.map((result) => (
                    <div key={result?.id} className={`p-4 rounded-lg border ${getStatusColor(result?.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result?.status)}
                          <span className="text-white font-medium">{result?.name}</span>
                          <span className="text-xs text-slate-400">({result?.id})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                result?.confidence >= 90 ? 'bg-green-400' :
                                result?.confidence >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${result?.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-300">{result?.confidence}%</span>
                        </div>
                      </div>

                      {result?.issues?.length > 0 && (
                        <div className="space-y-1">
                          {result?.issues?.map((issue, issueIndex) => (
                            <div key={issueIndex} className="text-sm text-slate-300 flex items-center space-x-2">
                              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        };

        export default RegistryValidation;