import React, { useState } from 'react';
        import { motion } from 'framer-motion';
        import { 
          FileText, 
          Plus, 
          Edit, 
          Trash2, 
          Copy, 
          TrendingUp,
          BarChart3,
          Zap,
          Shield,
          Settings
        } from 'lucide-react';

        const TemplateManagement = () => {
          const [templates] = useState([
            {
              id: 'momentum_v1',
              name: 'Momentum Strategy',
              type: 'momentum',
              description: 'Trend-following strategy with momentum indicators',
              usage: 23,
              lastModified: '2024-09-28',
              parameters: ['rsi_threshold', 'ma_period', 'volume_filter'],
              icon: TrendingUp,
              color: 'green'
            },
            {
              id: 'mean_reversion_v1',
              name: 'Mean Reversion Strategy',
              type: 'mean_reversion',
              description: 'Contrarian strategy targeting oversold/overbought conditions',
              usage: 18,
              lastModified: '2024-09-27',
              parameters: ['bb_period', 'rsi_oversold', 'rsi_overbought'],
              icon: BarChart3,
              color: 'blue'
            },
            {
              id: 'volatility_v1',
              name: 'Volatility Trading',
              type: 'volatility',
              description: 'Options-based strategy exploiting volatility discrepancies',
              usage: 31,
              lastModified: '2024-09-28',
              parameters: ['iv_percentile', 'delta_target', 'theta_threshold'],
              icon: Zap,
              color: 'yellow'
            },
            {
              id: 'arbitrage_v1',
              name: 'Statistical Arbitrage',
              type: 'arbitrage',
              description: 'Pairs trading and statistical arbitrage opportunities',
              usage: 12,
              lastModified: '2024-09-26',
              parameters: ['correlation_threshold', 'z_score_entry', 'z_score_exit'],
              icon: Shield,
              color: 'purple'
            }
          ]);

          const [selectedTemplate, setSelectedTemplate] = useState(null);
          const [isCreatingNew, setIsCreatingNew] = useState(false);

          const handleCreateTemplate = () => {
            setIsCreatingNew(true);
            setSelectedTemplate(null);
          };

          const handleEditTemplate = (template) => {
            setSelectedTemplate(template);
            setIsCreatingNew(false);
          };

          const getColorClasses = (color) => {
            const colors = {
              green: 'border-green-500/20 bg-green-500/10',
              blue: 'border-blue-500/20 bg-blue-500/10',
              yellow: 'border-yellow-500/20 bg-yellow-500/10',
              purple: 'border-purple-500/20 bg-purple-500/10'
            };
            return colors?.[color] || colors?.blue;
          };

          const getIconColor = (color) => {
            const colors = {
              green: 'text-green-400',
              blue: 'text-blue-400',
              yellow: 'text-yellow-400',
              purple: 'text-purple-400'
            };
            return colors?.[color] || colors?.blue;
          };

          return (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-green-500/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FileText className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Template Management</h3>
                    <p className="text-green-300 text-sm">Customizable strategy templates with parameter controls</p>
                  </div>
                </div>

                <button
                  onClick={handleCreateTemplate}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Template</span>
                </button>
              </div>
              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {templates?.map((template) => {
                  const IconComponent = template?.icon;
                  return (
                    <div 
                      key={template?.id} 
                      className={`p-4 rounded-lg border ${getColorClasses(template?.color)} hover:bg-opacity-20 transition-all duration-200 cursor-pointer`}
                      onClick={() => handleEditTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getColorClasses(template?.color)}`}>
                            <IconComponent className={`h-5 w-5 ${getIconColor(template?.color)}`} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{template?.name}</h4>
                            <p className="text-xs text-slate-400">Type: {template?.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-slate-600 rounded text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{template?.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Used {template?.usage} times</span>
                        <span>Modified {template?.lastModified}</span>
                      </div>
                      {/* Parameters */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {template?.parameters?.map((param) => (
                          <span 
                            key={param}
                            className={`px-2 py-1 text-xs rounded-full ${getColorClasses(template?.color)} text-white`}
                          >
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Template Editor/Creator */}
              {(selectedTemplate || isCreatingNew) && (
                <motion.div
                  className="border border-slate-600 rounded-lg p-4 bg-slate-700/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">
                        {isCreatingNew ? 'Create New Template' : `Edit: ${selectedTemplate?.name}`}
                      </span>
                    </div>
                    <button
                      onClick={() => { setSelectedTemplate(null); setIsCreatingNew(false); }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Template Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                        defaultValue={selectedTemplate?.name || ''}
                        placeholder="Enter template name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Strategy Type</label>
                      <select className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white">
                        <option value="momentum">Momentum</option>
                        <option value="mean_reversion">Mean Reversion</option>
                        <option value="volatility">Volatility</option>
                        <option value="arbitrage">Arbitrage</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-300 mb-2">Description</label>
                      <textarea 
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white h-20"
                        defaultValue={selectedTemplate?.description || ''}
                        placeholder="Describe your strategy template"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-slate-300 mb-2">Parameters (comma-separated)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                        defaultValue={selectedTemplate?.parameters?.join(', ') || ''}
                        placeholder="parameter1, parameter2, parameter3"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      {isCreatingNew ? 'Create Template' : 'Update Template'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        };

        export default TemplateManagement;