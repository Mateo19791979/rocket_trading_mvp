import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, AlertTriangle, Eye, Lock, Activity, RefreshCw, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import ThreatDetectionEngine from './components/ThreatDetectionEngine';
import QuantumSafeCryptography from './components/QuantumSafeCryptography';
import PredictiveSecurityDashboard from './components/PredictiveSecurityDashboard';
import BehavioralBiometrics from './components/BehavioralBiometrics';
import AdvancedAuditCompliance from './components/AdvancedAuditCompliance';

export default function AdvancedAISecurityThreatIntelligenceCenter() {
  const [securityStatus, setSecurityStatus] = useState({
    threatLevel: 'LOW',
    activeThreats: 0,
    behavioralAnomalies: 0,
    cryptoStatus: 'SECURE',
    complianceScore: 98.5,
    predictiveAccuracy: 94.2
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    threatDetections: 0,
    blockedAttempts: 0,
    authenticatedSessions: 0,
    cryptoTransactions: 0
  });

  const [systemHealth, setSystemHealth] = useState({
    aiEngineStatus: 'HEALTHY',
    quantumCryptoStatus: 'OPERATIONAL',
    biometricSystemStatus: 'ACTIVE',
    auditSystemStatus: 'MONITORING',
    lastUpdate: new Date()
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSecurityData = async () => {
    try {
      // Mock security data loading - in real implementation, this would call security APIs
      setSecurityStatus(prev => ({
        ...prev,
        activeThreats: Math.floor(Math.random() * 5),
        behavioralAnomalies: Math.floor(Math.random() * 3),
        predictiveAccuracy: 94.2 + (Math.random() * 2 - 1)
      }));

      setRealTimeMetrics(prev => ({
        threatDetections: prev?.threatDetections + Math.floor(Math.random() * 2),
        blockedAttempts: prev?.blockedAttempts + Math.floor(Math.random() * 3),
        authenticatedSessions: prev?.authenticatedSessions + Math.floor(Math.random() * 5),
        cryptoTransactions: prev?.cryptoTransactions + Math.floor(Math.random() * 10)
      }));

      setSystemHealth(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));

      setError('');
    } catch (err) {
      setError(`Security system error: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 5000); // Real-time updates every 5s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadSecurityData();
  };

  const getThreatLevelColor = (level) => {
    const colors = {
      'LOW': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'HIGH': 'text-red-400',
      'CRITICAL': 'text-red-500'
    };
    return colors?.[level] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const isHealthy = ['HEALTHY', 'OPERATIONAL', 'ACTIVE', 'MONITORING', 'SECURE']?.includes(status);
    return isHealthy ? 
      <CheckCircle className="h-5 w-5 text-green-400" /> : 
      <XCircle className="h-5 w-5 text-red-400" />;
  };

  if (loading && Object.keys(realTimeMetrics)?.every(key => realTimeMetrics?.[key] === 0)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Security Intelligence Center...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-950 text-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-red-800/30"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <Shield className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Advanced AI Security & Threat Intelligence Center
                </h1>
                <p className="text-gray-400 mt-1">
                  Next-generation cybersecurity orchestration and autonomous threat detection
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Security Level</p>
                <p className={`text-lg font-bold ${getThreatLevelColor(securityStatus?.threatLevel)}`}>
                  {securityStatus?.threatLevel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Scan</p>
                <p className="text-sm text-gray-300">{systemHealth?.lastUpdate?.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-red-400" />
              </button>
            </div>
          </div>

          {/* Real-time Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Threats</p>
                  <p className="text-2xl font-semibold text-red-400">{securityStatus?.activeThreats}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Blocked Attempts</p>
                  <p className="text-2xl font-semibold text-orange-400">{realTimeMetrics?.blockedAttempts}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Crypto Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(securityStatus?.cryptoStatus)}
                    <p className="text-sm text-green-400">{securityStatus?.cryptoStatus}</p>
                  </div>
                </div>
                <Lock className="h-8 w-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Predictive Accuracy</p>
                  <p className="text-2xl font-semibold text-blue-400">{securityStatus?.predictiveAccuracy?.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Compliance Score</p>
                  <p className="text-2xl font-semibold text-teal-400">{securityStatus?.complianceScore}%</p>
                </div>
                <Activity className="h-8 w-8 text-teal-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Behavioral Anomalies</p>
                  <p className="text-2xl font-semibold text-purple-400">{securityStatus?.behavioralAnomalies}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {error && (
        <motion.div 
          className="bg-red-900/20 border border-red-500 text-red-400 p-4 m-4 rounded-lg"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <ThreatDetectionEngine 
              securityStatus={securityStatus}
              realTimeMetrics={realTimeMetrics}
              onThreatUpdate={setSecurityStatus}
            />
            <QuantumSafeCryptography 
              cryptoStatus={securityStatus?.cryptoStatus}
              transactionCount={realTimeMetrics?.cryptoTransactions}
              onStatusUpdate={(status) => setSecurityStatus(prev => ({ ...prev, cryptoStatus: status }))}
            />
          </motion.div>

          {/* Center Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <PredictiveSecurityDashboard 
              securityStatus={securityStatus}
              systemHealth={systemHealth}
              onPredictionUpdate={(accuracy) => setSecurityStatus(prev => ({ ...prev, predictiveAccuracy: accuracy }))}
            />
            <BehavioralBiometrics 
              anomalies={securityStatus?.behavioralAnomalies}
              authenticatedSessions={realTimeMetrics?.authenticatedSessions}
              onAnomalyDetected={(count) => setSecurityStatus(prev => ({ ...prev, behavioralAnomalies: count }))}
            />
          </motion.div>

          {/* Right Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <AdvancedAuditCompliance 
              complianceScore={securityStatus?.complianceScore}
              auditSystemStatus={systemHealth?.auditSystemStatus}
              onComplianceUpdate={(score) => setSecurityStatus(prev => ({ ...prev, complianceScore: score }))}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}