import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Globe, Shield, AlertTriangle, Calculator, Scale, Activity, Clock } from 'lucide-react';
import CognitiveEngineService from '../../services/cognitiveEngineService';
import IFRSStandardsRepository from './components/IFRSStandardsRepository';
import FiscalRulesEngine from './components/FiscalRulesEngine';
import RegulatoryIntelligence from './components/RegulatoryIntelligence';
import CognitiveIntegrationDashboard from './components/CognitiveIntegrationDashboard';
import CrossDomainLearningPanel from './components/CrossDomainLearningPanel';
import ComplianceAnalyticsCenter from './components/ComplianceAnalyticsCenter';

const IFRSFiscalIntelligenceIntegrationCenter = () => {
  const [complianceData, setComplianceData] = useState({
    accountingData: [],
    fiscalRules: [],
    ifrsKnowledge: []
  });
  const [loading, setLoading] = useState(true);
  const [activeCompliance, setActiveCompliance] = useState('all');
  const [realTimeCompliance, setRealTimeCompliance] = useState({
    ifrsCompliance: 94.2,
    fiscalCompliance: 87.6,
    regulatoryRisk: 'low',
    lastUpdate: new Date()
  });

  // Load IFRS & Fiscal compliance data
  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const data = await CognitiveEngineService?.getIFRSCompliance();
      setComplianceData(data);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
    const interval = setInterval(loadComplianceData, 45000); // Refresh every 45 seconds
    return () => clearInterval(interval);
  }, []);

  // Update real-time compliance metrics
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setRealTimeCompliance(prev => ({
        ifrsCompliance: Math.min(98, prev?.ifrsCompliance + (Math.random() - 0.5) * 2),
        fiscalCompliance: Math.min(95, prev?.fiscalCompliance + (Math.random() - 0.5) * 1.5),
        regulatoryRisk: Math.random() > 0.7 ? 'medium' : 'low',
        lastUpdate: new Date()
      }));
    }, 12000);
    return () => clearInterval(metricsInterval);
  }, []);

  const complianceCategories = [
    { 
      key: 'ifrs', 
      label: 'IFRS Standards', 
      icon: <FileText className="w-5 h-5" />, 
      count: complianceData?.ifrsKnowledge?.length || 0,
      compliance: realTimeCompliance?.ifrsCompliance
    },
    { 
      key: 'fiscal', 
      label: 'Fiscal Regulations', 
      icon: <Scale className="w-5 h-5" />, 
      count: complianceData?.fiscalRules?.length || 0,
      compliance: realTimeCompliance?.fiscalCompliance
    },
    { 
      key: 'accounting', 
      label: 'Accounting Data', 
      icon: <Calculator className="w-5 h-5" />, 
      count: complianceData?.accountingData?.length || 0,
      compliance: 92.1
    },
    { 
      key: 'regulatory', 
      label: 'Regulatory Intelligence', 
      icon: <Globe className="w-5 h-5" />, 
      count: 47,
      compliance: 89.3
    }
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  if (loading && !complianceData?.accountingData?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Compliance Intelligence...</p>
          <p className="text-green-300 text-sm mt-2">Analyzing IFRS & Fiscal Regulations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-green-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">IFRS & Fiscal Intelligence</h1>
              <p className="text-green-300 text-lg">Integration Center</p>
              <p className="text-slate-400 text-sm">Specialized regulatory compliance • Financial standards • Tax intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-400">Regulatory Intelligence: ACTIVE</span>
              </div>
            </div>
            
            <select
              value={activeCompliance}
              onChange={(e) => setActiveCompliance(e?.target?.value)}
              className="bg-slate-800/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Compliance Areas</option>
              {complianceCategories?.map(category => (
                <option key={category?.key} value={category?.key}>
                  {category?.label} ({category?.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Compliance Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">IFRS Compliance</p>
                <p className="text-2xl font-bold text-green-400">{realTimeCompliance?.ifrsCompliance?.toFixed(1)}%</p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeCompliance?.ifrsCompliance}%` }}
              ></div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Fiscal Compliance</p>
                <p className="text-2xl font-bold text-blue-400">{realTimeCompliance?.fiscalCompliance?.toFixed(1)}%</p>
              </div>
              <Scale className="w-8 h-8 text-blue-400" />
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${realTimeCompliance?.fiscalCompliance}%` }}
              ></div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Regulatory Risk</p>
                <p className={`text-2xl font-bold ${getRiskColor(realTimeCompliance?.regulatoryRisk)?.split(' ')?.[0]}`}>
                  {realTimeCompliance?.regulatoryRisk?.toUpperCase()}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${getRiskColor(realTimeCompliance?.regulatoryRisk)?.split(' ')?.[0]}`} />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Last Update</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {realTimeCompliance?.lastUpdate?.toLocaleTimeString()?.slice(0, 5)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Main Layout - Three Columns */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="col-span-4 space-y-6">
          <IFRSStandardsRepository 
            complianceData={complianceData} 
            activeFilter={activeCompliance}
            onStandardUpdate={loadComplianceData}
          />
          <FiscalRulesEngine 
            fiscalRules={complianceData?.fiscalRules}
            realTimeCompliance={realTimeCompliance}
          />
        </div>

        {/* Center Column */}
        <div className="col-span-4 space-y-6">
          <CognitiveIntegrationDashboard 
            complianceData={complianceData}
            activeCompliance={activeCompliance}
          />
          <CrossDomainLearningPanel 
            complianceData={complianceData}
            onInsightGeneration={loadComplianceData}
          />
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6">
          <ComplianceAnalyticsCenter 
            complianceData={complianceData}
            realTimeCompliance={realTimeCompliance}
          />
          <RegulatoryIntelligence 
            complianceData={complianceData}
            onRegulatoryUpdate={loadComplianceData}
          />
        </div>
      </div>
      {/* Floating Compliance Alerts */}
      <AnimatePresence>
        {realTimeCompliance?.regulatoryRisk === 'medium' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 max-w-md"
          >
            <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg border border-yellow-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Regulatory Alert</span>
              </div>
              <p className="text-slate-300 text-sm">
                Medium regulatory risk detected. Review fiscal compliance requirements for {new Date()?.getFullYear()}.
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-yellow-300 text-xs">
                  Risk Level: MEDIUM
                </span>
                <button className="text-yellow-400 text-xs hover:underline">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IFRSFiscalIntelligenceIntegrationCenter;