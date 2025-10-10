import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MousePointer2, Keyboard, Activity, CheckCircle, AlertCircle, Eye, Shield } from 'lucide-react';

export default function BehavioralBiometrics({ anomalies, authenticatedSessions, onAnomalyDetected }) {
  const [biometricData, setBiometricData] = useState({
    keystrokeDynamics: {
      authenticatedUsers: 847,
      averageTypingSpeed: 68,
      accuracyRate: 96.7,
      anomaliesDetected: 3
    },
    mouseMovements: {
      trackedSessions: 1205,
      patternMatches: 98.3,
      suspiciousPatterns: 7,
      adaptiveThreshold: 92.1
    },
    tradingBehavior: {
      activeTradingSessions: 234,
      behaviorBaseline: 'ESTABLISHED',
      deviationAlerts: 2,
      riskScore: 18.4
    }
  });

  const [securityControls, setSecurityControls] = useState({
    adaptiveAuthentication: {
      status: 'ACTIVE',
      riskBasedChallenges: 15,
      successRate: 94.8,
      falsePositiveRate: 2.3
    },
    continuousMonitoring: {
      monitoredSessions: authenticatedSessions,
      anomalyDetectionRate: 99.2,
      responseTime: '0.8s',
      adaptiveLearning: true
    }
  });

  const [userProfiles, setUserProfiles] = useState([
    {
      id: 'USER_001',
      trustScore: 94.7,
      riskLevel: 'LOW',
      lastActivity: '2 minutes ago',
      behaviorConsistency: 96.2,
      anomalies: 0
    },
    {
      id: 'USER_002',
      trustScore: 87.3,
      riskLevel: 'MEDIUM',
      lastActivity: '15 minutes ago',
      behaviorConsistency: 89.1,
      anomalies: 1
    },
    {
      id: 'USER_003',
      trustScore: 72.1,
      riskLevel: 'HIGH',
      lastActivity: '5 minutes ago',
      behaviorConsistency: 76.8,
      anomalies: 3
    },
    {
      id: 'USER_004',
      trustScore: 98.9,
      riskLevel: 'LOW',
      lastActivity: '1 minute ago',
      behaviorConsistency: 98.5,
      anomalies: 0
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update biometric data
      setBiometricData(prev => ({
        ...prev,
        keystrokeDynamics: {
          ...prev?.keystrokeDynamics,
          authenticatedUsers: prev?.keystrokeDynamics?.authenticatedUsers + Math.floor(Math.random() * 5),
          averageTypingSpeed: Math.max(60, Math.min(75, prev?.keystrokeDynamics?.averageTypingSpeed + (Math.random() * 4 - 2))),
          accuracyRate: Math.max(95, Math.min(99, prev?.keystrokeDynamics?.accuracyRate + (Math.random() * 2 - 1))),
          anomaliesDetected: Math.max(0, prev?.keystrokeDynamics?.anomaliesDetected + Math.floor(Math.random() * 3 - 1))
        },
        mouseMovements: {
          ...prev?.mouseMovements,
          trackedSessions: prev?.mouseMovements?.trackedSessions + Math.floor(Math.random() * 8),
          patternMatches: Math.max(95, Math.min(99.5, prev?.mouseMovements?.patternMatches + (Math.random() * 2 - 1))),
          suspiciousPatterns: Math.max(0, prev?.mouseMovements?.suspiciousPatterns + Math.floor(Math.random() * 3 - 1))
        },
        tradingBehavior: {
          ...prev?.tradingBehavior,
          activeTradingSessions: Math.max(200, prev?.tradingBehavior?.activeTradingSessions + Math.floor(Math.random() * 20 - 10)),
          riskScore: Math.max(0, Math.min(50, prev?.tradingBehavior?.riskScore + (Math.random() * 4 - 2))),
          deviationAlerts: Math.max(0, prev?.tradingBehavior?.deviationAlerts + Math.floor(Math.random() * 2 - 1))
        }
      }));

      // Update security controls
      setSecurityControls(prev => ({
        ...prev,
        adaptiveAuthentication: {
          ...prev?.adaptiveAuthentication,
          riskBasedChallenges: prev?.adaptiveAuthentication?.riskBasedChallenges + Math.floor(Math.random() * 3),
          successRate: Math.max(90, Math.min(98, prev?.adaptiveAuthentication?.successRate + (Math.random() * 2 - 1)))
        },
        continuousMonitoring: {
          ...prev?.continuousMonitoring,
          monitoredSessions: authenticatedSessions
        }
      }));

      // Simulate anomaly detection
      const totalAnomalies = biometricData?.keystrokeDynamics?.anomaliesDetected + 
                           biometricData?.mouseMovements?.suspiciousPatterns + 
                           biometricData?.tradingBehavior?.deviationAlerts;
      
      if (totalAnomalies !== anomalies) {
        onAnomalyDetected?.(totalAnomalies);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [biometricData, anomalies, authenticatedSessions, onAnomalyDetected]);

  const getRiskLevelColor = (level) => {
    const colors = {
      'LOW': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'HIGH': 'text-red-400',
      'CRITICAL': 'text-red-500'
    };
    return colors?.[level] || 'text-gray-400';
  };

  const getTrustScoreColor = (score) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-teal-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status) => {
    return status === 'ACTIVE' ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertCircle className="h-4 w-4 text-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Behavioral Biometrics */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-purple-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-purple-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <User className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Behavioral Biometrics</h3>
              <p className="text-sm text-gray-400">Continuous user authentication through behavioral analysis</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Keystroke Dynamics */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Keyboard className="h-4 w-4 mr-2 text-blue-400" />
                Keystroke Dynamics
              </h4>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {biometricData?.keystrokeDynamics?.accuracyRate?.toFixed(1)}% Accuracy
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Authenticated Users</p>
                <p className="text-lg font-semibold text-blue-400">{biometricData?.keystrokeDynamics?.authenticatedUsers}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg Typing Speed</p>
                <p className="text-lg font-semibold text-teal-400">{biometricData?.keystrokeDynamics?.averageTypingSpeed} WPM</p>
              </div>
            </div>
          </div>

          {/* Mouse Movement Patterns */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <MousePointer2 className="h-4 w-4 mr-2 text-orange-400" />
                Mouse Movement Patterns
              </h4>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                {biometricData?.mouseMovements?.patternMatches?.toFixed(1)}% Match Rate
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Tracked Sessions</p>
                <p className="text-lg font-semibold text-orange-400">{biometricData?.mouseMovements?.trackedSessions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Suspicious Patterns</p>
                <p className="text-lg font-semibold text-red-400">{biometricData?.mouseMovements?.suspiciousPatterns}</p>
              </div>
            </div>
          </div>

          {/* Trading Behavior Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-green-400" />
                Trading Behavior Analysis
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${
                biometricData?.tradingBehavior?.riskScore < 25 ? 'text-green-400 bg-green-900/30' :
                biometricData?.tradingBehavior?.riskScore < 50 ? 'text-yellow-400 bg-yellow-900/30': 'text-red-400 bg-red-900/30'
              }`}>
                Risk: {biometricData?.tradingBehavior?.riskScore?.toFixed(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Active Sessions</p>
                <p className="text-lg font-semibold text-green-400">{biometricData?.tradingBehavior?.activeTradingSessions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Deviation Alerts</p>
                <p className="text-lg font-semibold text-yellow-400">{biometricData?.tradingBehavior?.deviationAlerts}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Adaptive Security Controls */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600/20 rounded-lg">
              <Shield className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Adaptive Security Controls</h3>
              <p className="text-sm text-gray-400">Anomaly detection and adaptive security controls</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Adaptive Authentication */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-teal-400" />
                Adaptive Authentication
              </h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(securityControls?.adaptiveAuthentication?.status)}
                <span className="text-xs text-teal-400">{securityControls?.adaptiveAuthentication?.status}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Risk-based Challenges</p>
                <p className="text-lg font-semibold text-teal-400">{securityControls?.adaptiveAuthentication?.riskBasedChallenges}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Success Rate</p>
                <p className="text-lg font-semibold text-green-400">{securityControls?.adaptiveAuthentication?.successRate?.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Continuous Monitoring */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">Continuous Monitoring</h4>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                {securityControls?.continuousMonitoring?.responseTime} Response
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Monitored Sessions</span>
                <span className="text-sm font-semibold text-purple-400">{securityControls?.continuousMonitoring?.monitoredSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Detection Rate</span>
                <span className="text-sm font-semibold text-green-400">{securityControls?.continuousMonitoring?.anomalyDetectionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Adaptive Learning</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* User Trust Profiles */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">User Trust Profiles</h3>
              <p className="text-sm text-gray-400">Individual user behavior and trust scoring</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {userProfiles?.map((profile) => (
              <div key={profile?.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">{profile?.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(profile?.riskLevel)} bg-gray-700/50`}>
                      {profile?.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Trust Score</p>
                    <p className={`font-semibold ${getTrustScoreColor(profile?.trustScore)}`}>
                      {profile?.trustScore?.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Consistency</p>
                    <p className="text-teal-400 font-semibold">{profile?.behaviorConsistency?.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Anomalies</p>
                    <p className={`font-semibold ${profile?.anomalies === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profile?.anomalies}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Activity</p>
                    <p className="text-gray-300 font-semibold">{profile?.lastActivity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}