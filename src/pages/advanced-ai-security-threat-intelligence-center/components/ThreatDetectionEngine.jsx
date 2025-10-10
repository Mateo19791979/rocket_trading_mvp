import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Target, Activity, Eye } from 'lucide-react';

export default function ThreatDetectionEngine({ securityStatus, realTimeMetrics, onThreatUpdate }) {
  const [threatData, setThreatData] = useState({
    behavioralAnalysis: {
      normalPatterns: 1247,
      anomalies: 3,
      confidence: 94.7,
      accuracy: 98.2
    },
    threatHunting: {
      activeScanners: 12,
      patternMatches: 156,
      falsePositives: 2,
      huntingEfficiency: 96.8
    },
    zeroDay: {
      predictedThreats: 2,
      confidenceLevel: 89.3,
      mitigationReady: true,
      riskScore: 23.1
    }
  });

  const [detectionLogs, setDetectionLogs] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000),
      type: 'BEHAVIORAL_ANOMALY',
      severity: 'MEDIUM',
      source: 'Trading Session Analysis',
      description: 'Unusual trading pattern detected in user session',
      action: 'MONITORED'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 600000),
      type: 'PATTERN_RECOGNITION',
      severity: 'LOW',
      source: 'ML Pattern Hunter',
      description: 'Known attack signature similarity: 67%',
      action: 'ANALYZED'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 900000),
      type: 'ZERO_DAY_PREDICTION',
      severity: 'HIGH',
      source: 'Predictive AI Engine',
      description: 'Potential zero-day vulnerability predicted',
      action: 'MITIGATED'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time threat detection updates
      setThreatData(prev => ({
        ...prev,
        behavioralAnalysis: {
          ...prev?.behavioralAnalysis,
          anomalies: Math.max(0, prev?.behavioralAnalysis?.anomalies + Math.floor(Math.random() * 3 - 1)),
          confidence: Math.min(100, Math.max(90, prev?.behavioralAnalysis?.confidence + (Math.random() * 2 - 1)))
        },
        threatHunting: {
          ...prev?.threatHunting,
          patternMatches: prev?.threatHunting?.patternMatches + Math.floor(Math.random() * 5),
          huntingEfficiency: Math.min(100, Math.max(95, prev?.threatHunting?.huntingEfficiency + (Math.random() * 1 - 0.5)))
        },
        zeroDay: {
          ...prev?.zeroDay,
          riskScore: Math.min(100, Math.max(0, prev?.zeroDay?.riskScore + (Math.random() * 4 - 2)))
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'HIGH': 'text-red-400',
      'CRITICAL': 'text-red-500'
    };
    return colors?.[severity] || 'text-gray-400';
  };

  const getSeverityBg = (severity) => {
    const colors = {
      'LOW': 'bg-green-900/20 border-green-500/30',
      'MEDIUM': 'bg-yellow-900/20 border-yellow-500/30',
      'HIGH': 'bg-red-900/20 border-red-500/30',
      'CRITICAL': 'bg-red-900/30 border-red-500/50'
    };
    return colors?.[severity] || 'bg-gray-900/20 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      {/* AI Threat Detection Engine */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-red-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-red-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <Brain className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">AI Threat Detection Engine</h3>
              <p className="text-sm text-gray-400">Real-time behavioral anomaly analysis using ML models</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Behavioral Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-400" />
                Behavioral Analysis
              </h4>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {threatData?.behavioralAnalysis?.confidence?.toFixed(1)}% Confidence
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Normal Patterns</p>
                <p className="text-lg font-semibold text-green-400">{threatData?.behavioralAnalysis?.normalPatterns}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Anomalies</p>
                <p className="text-lg font-semibold text-yellow-400">{threatData?.behavioralAnalysis?.anomalies}</p>
              </div>
            </div>
          </div>

          {/* Automated Threat Hunting */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Target className="h-4 w-4 mr-2 text-orange-400" />
                Automated Threat Hunting
              </h4>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                {threatData?.threatHunting?.activeScanners} Active Scanners
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Pattern Matches</p>
                <p className="text-lg font-semibold text-orange-400">{threatData?.threatHunting?.patternMatches}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Efficiency</p>
                <p className="text-lg font-semibold text-green-400">{threatData?.threatHunting?.huntingEfficiency?.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Zero-Day Prediction */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-purple-400" />
                Zero-Day Vulnerability Prediction
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${
                threatData?.zeroDay?.riskScore < 30 ? 'text-green-400 bg-green-900/30' :
                threatData?.zeroDay?.riskScore < 60 ? 'text-yellow-400 bg-yellow-900/30': 'text-red-400 bg-red-900/30'
              }`}>
                Risk: {threatData?.zeroDay?.riskScore?.toFixed(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Predicted Threats</p>
                <p className="text-lg font-semibold text-purple-400">{threatData?.zeroDay?.predictedThreats}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Confidence Level</p>
                <p className="text-lg font-semibold text-teal-400">{threatData?.zeroDay?.confidenceLevel?.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Real-time Detection Logs */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Eye className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Real-time Detection Logs</h3>
              <p className="text-sm text-gray-400">Live threat detection and response activities</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {detectionLogs?.map((log) => (
              <div 
                key={log?.id}
                className={`rounded-lg p-3 border ${getSeverityBg(log?.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-medium ${getSeverityColor(log?.severity)}`}>
                        {log?.severity}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{log?.type}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{log?.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Source: {log?.source}</span>
                      <span>Action: {log?.action}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {log?.timestamp?.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}