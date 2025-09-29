import React, { useState } from 'react';
        import { motion } from 'framer-motion';
        import { 
          Settings, 
          Code, 
          CheckCircle, 
          AlertTriangle, 
          Download,
          RefreshCw,
          FileText,
          Zap
        } from 'lucide-react';

        const StrategyConstructionPanel = () => {
          const [yamlOutput, setYamlOutput] = useState(`# Generated Strategy YAML
strategy:
  metadata:
    name: "Options_Volatility_Strategy" version:"1.0.0" type:"volatility_trading" created:"2024-09-28T18:08:13Z"
    
  entry_conditions:
    - rule: "implied_volatility < historical_volatility * 0.8"
      weight: 0.6
    - rule: "delta_neutral_position = true"
      weight: 0.4
      
  exit_conditions:
    - rule: "profit_target >= 20%" priority:"high" - rule:"time_decay >= 0.5" priority:"medium"
      
  risk_parameters:
    max_position_size: 10000
    stop_loss: -5%
    max_correlation: 0.7
    
  instruments:
    - type: "option_call" underlying:"SPY"
      strike_range: [0.95, 1.05]
    - type: "option_put" underlying:"SPY"
      strike_range: [0.95, 1.05]`);

          const [validationResults, setValidationResults] = useState([
            { field: 'metadata.name', status: 'valid', message: 'Strategy name follows naming convention' },
            { field: 'entry_conditions', status: 'valid', message: '2 conditions defined with proper weights' },
            { field: 'risk_parameters', status: 'warning', message: 'Consider adding volatility_limit parameter' },
            { field: 'instruments', status: 'valid', message: 'Instrument specifications are complete' }
          ]);

          const [schemaStats] = useState({
            totalFields: 15,
            validFields: 12,
            warningFields: 2,
            errorFields: 1,
            completeness: 85
          });

          const handleRegenerateYaml = () => {
            // Simulate YAML regeneration
            setYamlOutput(prev => prev + '\n# Updated: ' + new Date()?.toISOString());
          };

          const handleDownloadYaml = () => {
            const blob = new Blob([yamlOutput], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'strategy.yaml';
            a?.click();
          };

          return (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Strategy Construction</h3>
                    <p className="text-blue-300 text-sm">Automated YAML generation with schema validation</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRegenerateYaml}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleDownloadYaml}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              {/* Schema Statistics */}
              <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-medium">Schema Validation</span>
                  </div>
                  <span className="text-sm text-green-300">{schemaStats?.completeness}% Complete</span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{schemaStats?.validFields}</div>
                    <div className="text-xs text-green-300">Valid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{schemaStats?.warningFields}</div>
                    <div className="text-xs text-yellow-300">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{schemaStats?.errorFields}</div>
                    <div className="text-xs text-red-300">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{schemaStats?.totalFields}</div>
                    <div className="text-xs text-slate-300">Total</div>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    style={{ width: `${schemaStats?.completeness}%` }}
                  />
                </div>
              </div>
              {/* YAML Output */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Code className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-medium">Generated YAML</span>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                  <pre className="text-sm text-green-300 font-mono overflow-x-auto max-h-80 overflow-y-auto">
                    {yamlOutput}
                  </pre>
                </div>
              </div>
              {/* Validation Results */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-medium">Validation Results</span>
                </div>
                <div className="space-y-2">
                  {validationResults?.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-3">
                        {result?.status === 'valid' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : result?.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        )}
                        <div>
                          <div className="text-white font-medium text-sm">{result?.field}</div>
                          <div className="text-slate-300 text-xs">{result?.message}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result?.status === 'valid' ? 'bg-green-500/20 text-green-300' :
                        result?.status === 'warning'? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {result?.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        };

        export default StrategyConstructionPanel;