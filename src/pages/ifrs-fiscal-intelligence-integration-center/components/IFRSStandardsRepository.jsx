import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, CheckCircle, AlertCircle, Shield, Target, Clock, BarChart3, Zap } from 'lucide-react';

const IFRSStandardsRepository = ({ complianceData, activeFilter, onStandardUpdate }) => {
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('idle');

  const ifrsStandards = [
    {
      id: 'ifrs_13',
      code: 'IFRS 13',
      title: 'Fair Value Measurement',
      status: 'active',
      coverage: 98.5,
      lastUpdated: '2024-01-15',
      impact: 'high',
      concepts: 8,
      description: 'Defines fair value, sets framework for measuring fair value'
    },
    {
      id: 'ifrs_17',
      code: 'IFRS 17',
      title: 'Insurance Contracts',
      status: 'active',
      coverage: 92.1,
      lastUpdated: '2024-02-01',
      impact: 'high',
      concepts: 12,
      description: 'Establishes principles for recognition, measurement of insurance contracts'
    },
    {
      id: 'ifrs_15',
      code: 'IFRS 15',
      title: 'Revenue from Contracts',
      status: 'active',
      coverage: 95.7,
      lastUpdated: '2024-01-20',
      impact: 'medium',
      concepts: 6,
      description: 'Revenue recognition from contracts with customers'
    },
    {
      id: 'ifrs_16',
      code: 'IFRS 16',
      title: 'Leases',
      status: 'active',
      coverage: 89.3,
      lastUpdated: '2024-02-10',
      impact: 'medium',
      concepts: 5,
      description: 'Lease accounting for both lessees and lessors'
    },
    {
      id: 'ifrs_9',
      code: 'IFRS 9',
      title: 'Financial Instruments',
      status: 'updating',
      coverage: 94.8,
      lastUpdated: '2024-02-12',
      impact: 'high',
      concepts: 15,
      description: 'Classification, measurement, and impairment of financial instruments'
    }
  ];

  const interpretationGuidance = [
    {
      type: 'implementation',
      title: 'IFRS 17 Implementation Guide',
      status: 'available',
      relevance: 'high'
    },
    {
      type: 'clarification',
      title: 'Fair Value Measurement Clarifications',
      status: 'available',
      relevance: 'high'
    },
    {
      type: 'update',
      title: 'COVID-19 Related Rent Concessions',
      status: 'available',
      relevance: 'medium'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'updating': return 'text-blue-400 bg-blue-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const triggerStandardUpdate = async (standardId) => {
    setUpdateStatus('updating');
    setTimeout(() => {
      setUpdateStatus('completed');
      onStandardUpdate?.();
      setTimeout(() => setUpdateStatus('idle'), 2000);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-lg border border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-green-400" />
            <span>IFRS Standards Repository</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time updates & interpretation guidance
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">
            {complianceData?.ifrsKnowledge?.length || 0}
          </p>
          <p className="text-slate-400 text-xs">Active Standards</p>
        </div>
      </div>
      {/* Standards Coverage Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-green-400 font-bold">
            {((ifrsStandards?.reduce((acc, s) => acc + s?.coverage, 0) / ifrsStandards?.length) || 0)?.toFixed(1)}%
          </p>
          <p className="text-slate-400 text-xs">Avg Coverage</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-blue-400 font-bold">
            {ifrsStandards?.filter(s => s?.impact === 'high')?.length}
          </p>
          <p className="text-slate-400 text-xs">High Impact</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-yellow-400 font-bold">
            {ifrsStandards?.filter(s => s?.status === 'updating')?.length}
          </p>
          <p className="text-slate-400 text-xs">Updating</p>
        </div>
      </div>
      {/* IFRS Standards List */}
      <div className="space-y-3 mb-6">
        <h3 className="text-white font-medium flex items-center space-x-2">
          <FileText className="w-4 h-4 text-green-400" />
          <span>International Standards</span>
        </h3>
        
        {ifrsStandards?.map((standard) => (
          <motion.div
            key={standard?.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedStandard(standard)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedStandard?.id === standard?.id
                ? 'bg-green-500/20 border-green-400' :'bg-slate-900/30 border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(standard?.status)}`}>
                  {standard?.code}
                </div>
                <div>
                  <h4 className="text-white font-medium">{standard?.title}</h4>
                  <p className="text-slate-400 text-sm">{standard?.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getImpactColor(standard?.impact)}`}>
                    {standard?.impact?.toUpperCase()}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(standard?.status)?.includes('green') ? 'bg-green-400' : getStatusColor(standard?.status)?.includes('blue') ? 'bg-blue-400' : 'bg-yellow-400'} ${standard?.status === 'updating' ? 'animate-pulse' : ''}`}></div>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {standard?.concepts} concepts
                </p>
              </div>
            </div>
            
            {/* Coverage Bar */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-3">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      standard?.coverage >= 95 ? 'bg-green-400' :
                      standard?.coverage >= 90 ? 'bg-blue-400': 'bg-yellow-400'
                    }`}
                    style={{ width: `${standard?.coverage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-slate-300 text-sm">{standard?.coverage}%</span>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-500 text-xs flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Updated: {new Date(standard?.lastUpdated)?.toLocaleDateString()}</span>
              </span>
              
              {standard?.status === 'updating' && (
                <div className="flex items-center space-x-1 text-blue-400 text-xs">
                  <Zap className="w-3 h-3 animate-pulse" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Interpretation Guidance */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span>Interpretation Guidance</span>
        </h3>
        
        {interpretationGuidance?.map((guidance, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg mb-2"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                guidance?.type === 'implementation' ? 'bg-green-500/20 text-green-400' :
                guidance?.type === 'clarification'? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {guidance?.type === 'implementation' ? <Target className="w-4 h-4" /> :
                 guidance?.type === 'clarification' ? <CheckCircle className="w-4 h-4" /> :
                 <AlertCircle className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">{guidance?.title}</h4>
                <p className="text-slate-400 text-xs">Relevance: {guidance?.relevance}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              guidance?.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
            }`}>
              {guidance?.status?.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      {/* Automated Compliance Checking */}
      <div className="bg-slate-900/30 p-4 rounded-lg">
        <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>Compliance Checking</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Standards Monitored</p>
            <p className="text-2xl font-bold text-purple-400">{ifrsStandards?.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Compliance Score</p>
            <p className="text-2xl font-bold text-green-400">94.2%</p>
          </div>
        </div>
        
        <button
          onClick={() => triggerStandardUpdate('all')}
          disabled={updateStatus !== 'idle'}
          className={`w-full mt-3 py-2 px-4 rounded-lg transition-all ${
            updateStatus !== 'idle' ?'bg-slate-600 text-slate-400 cursor-not-allowed' :'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {updateStatus === 'updating' ? 'Updating Standards...' :
           updateStatus === 'completed'? 'Standards Updated!' : 'Check for Updates'}
        </button>
      </div>
    </motion.div>
  );
};

export default IFRSStandardsRepository;