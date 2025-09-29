import React, { useState, useEffect } from 'react';
        import { motion } from 'framer-motion';
        import { Helmet } from 'react-helmet';
        import { BookOpen, Brain, FileText, Search, Target, CheckCircle, AlertTriangle, Play, Settings } from 'lucide-react';

        // Import components
        import RuleExtractionEngine from './components/RuleExtractionEngine';
        import StrategyConstructionPanel from './components/StrategyConstructionPanel';
        import TemplateManagement from './components/TemplateManagement';
        import RegistryValidation from './components/RegistryValidation';
        import IntegrationTesting from './components/IntegrationTesting';
        import EditingControls from './components/EditingControls';

        const StrategyRegistryBuilder = () => {
          const [activeTab, setActiveTab] = useState('extraction');
          const [pipelineStatus, setPipelineStatus] = useState({
            ingestion: 0,
            extraction: 0,
            validation: 0,
            testing: 0
          });
          const [registryStats, setRegistryStats] = useState({
            totalRules: 0,
            strategies: 0,
            templates: 0,
            errors: 0
          });

          useEffect(() => {
            // Simulate pipeline status updates
            const interval = setInterval(() => {
              setPipelineStatus(prev => ({
                ingestion: Math.min(prev?.ingestion + Math.random() * 5, 100),
                extraction: Math.min(prev?.extraction + Math.random() * 3, 100),
                validation: Math.min(prev?.validation + Math.random() * 2, 100),
                testing: Math.min(prev?.testing + Math.random() * 1, 100)
              }));
            }, 2000);

            return () => clearInterval(interval);
          }, []);

          const tabs = [
            { id: 'extraction', label: 'Rule Extraction', icon: Search },
            { id: 'construction', label: 'Strategy Construction', icon: Settings },
            { id: 'templates', label: 'Template Management', icon: FileText },
            { id: 'validation', label: 'Registry Validation', icon: CheckCircle },
            { id: 'testing', label: 'Integration Testing', icon: Play },
            { id: 'editing', label: 'Interactive Editing', icon: Target }
          ];

          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              <Helmet>
                <title>Strategy Registry Builder - Trading MVP</title>
                <meta name="description" content="Comprehensive YAML strategy construction and validation for automated trading rule generation" />
              </Helmet>
              {/* Header */}
              <div className="bg-slate-900/50 backdrop-blur-sm border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="h-8 w-8 text-purple-400" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">Strategy Registry Builder</h1>
                        <p className="text-purple-300">YAML Strategy Construction & Validation Pipeline</p>
                      </div>
                    </div>

                    {/* Pipeline Status */}
                    <div className="hidden lg:flex items-center space-x-6">
                      {Object.entries(pipelineStatus)?.map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs text-purple-300 capitalize">{key}</div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <span className="text-xs text-white font-mono">{Math.round(value)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registry Stats */}
                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-purple-300">Total Rules</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{registryStats?.totalRules}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-500/20">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-300">Strategies</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{registryStats?.strategies}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-green-500/20">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-300">Templates</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{registryStats?.templates}</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-red-500/20">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-300">Errors</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{registryStats?.errors}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Tab Navigation */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-wrap gap-2">
                  {tabs?.map((tab) => {
                    const IconComponent = tab?.icon;
                    return (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          activeTab === tab?.id
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50 hover:text-purple-300'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{tab?.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Main Content */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {activeTab === 'extraction' && <RuleExtractionEngine />}
                    {activeTab === 'construction' && <StrategyConstructionPanel />}
                    {activeTab === 'templates' && <TemplateManagement />}
                    {activeTab === 'editing' && <EditingControls />}
                    {(activeTab === 'validation' || activeTab === 'testing') && (
                      <div className="lg:col-span-2">
                        {activeTab === 'validation' && <RegistryValidation />}
                        {activeTab === 'testing' && <IntegrationTesting />}
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  {(activeTab === 'extraction' || activeTab === 'construction' || activeTab === 'templates' || activeTab === 'editing') && (
                    <div className="space-y-6">
                      {activeTab === 'extraction' && <RegistryValidation />}
                      {activeTab === 'construction' && <IntegrationTesting />}
                      {activeTab === 'templates' && <StrategyConstructionPanel />}
                      {activeTab === 'editing' && <TemplateManagement />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        };

        export default StrategyRegistryBuilder;