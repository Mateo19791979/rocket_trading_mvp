import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, Database, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function QuantumSafeCryptography({ cryptoStatus, transactionCount, onStatusUpdate }) {
  const [cryptoMetrics, setCryptoMetrics] = useState({
    postQuantumEncryption: {
      status: 'ACTIVE',
      algorithms: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'SPHINCS+'],
      keyStrength: 'AES-256 Quantum',
      performance: 98.7
    },
    secureMultiParty: {
      activeComputations: 24,
      privacyLevel: 'MAXIMUM',
      dataIntegrity: 99.9,
      participantNodes: 8
    },
    homomorphicEncryption: {
      operations: 1347,
      privacyPreserved: true,
      analyticsEnabled: true,
      performanceMetrics: 94.2
    }
  });

  const [deploymentStatus, setDeploymentStatus] = useState([
    {
      component: 'Quantum Key Distribution',
      status: 'DEPLOYED',
      uptime: 99.8,
      lastUpdate: 'Active',
      performance: 97.3
    },
    {
      component: 'Post-Quantum Signatures',
      status: 'DEPLOYED',
      uptime: 99.9,
      lastUpdate: 'Active',
      performance: 98.1
    },
    {
      component: 'Homomorphic Analytics',
      status: 'DEPLOYED',
      uptime: 98.7,
      lastUpdate: 'Active',
      performance: 95.8
    },
    {
      component: 'Secure MPC Framework',
      status: 'DEPLOYED',
      uptime: 99.2,
      lastUpdate: 'Active',
      performance: 96.4
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time crypto metrics updates
      setCryptoMetrics(prev => ({
        ...prev,
        postQuantumEncryption: {
          ...prev?.postQuantumEncryption,
          performance: Math.min(100, Math.max(95, prev?.postQuantumEncryption?.performance + (Math.random() * 2 - 1)))
        },
        secureMultiParty: {
          ...prev?.secureMultiParty,
          activeComputations: Math.max(15, prev?.secureMultiParty?.activeComputations + Math.floor(Math.random() * 6 - 3)),
          dataIntegrity: Math.min(100, Math.max(99, prev?.secureMultiParty?.dataIntegrity + (Math.random() * 0.2 - 0.1)))
        },
        homomorphicEncryption: {
          ...prev?.homomorphicEncryption,
          operations: prev?.homomorphicEncryption?.operations + Math.floor(Math.random() * 10),
          performanceMetrics: Math.min(100, Math.max(90, prev?.homomorphicEncryption?.performanceMetrics + (Math.random() * 2 - 1)))
        }
      }));

      // Update deployment status
      setDeploymentStatus(prev => 
        prev?.map(component => ({
          ...component,
          performance: Math.min(100, Math.max(90, component?.performance + (Math.random() * 2 - 1)))
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'text-green-400',
      'DEPLOYED': 'text-green-400',
      'MAXIMUM': 'text-teal-400',
      'OPERATIONAL': 'text-blue-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const isActive = ['ACTIVE', 'DEPLOYED', 'OPERATIONAL']?.includes(status);
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertCircle className="h-4 w-4 text-yellow-400" />;
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 98) return 'text-green-400';
    if (performance >= 95) return 'text-teal-400';
    if (performance >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Post-Quantum Encryption */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-teal-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-teal-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600/20 rounded-lg">
              <Shield className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Quantum-Safe Cryptography</h3>
              <p className="text-sm text-gray-400">Post-quantum encryption implementation and secure computation</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Post-Quantum Encryption Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-teal-400" />
                Post-Quantum Encryption
              </h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(cryptoMetrics?.postQuantumEncryption?.status)}
                <span className={`text-xs ${getStatusColor(cryptoMetrics?.postQuantumEncryption?.status)}`}>
                  {cryptoMetrics?.postQuantumEncryption?.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400">Key Strength</p>
                <p className="text-sm font-semibold text-teal-400">{cryptoMetrics?.postQuantumEncryption?.keyStrength}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Performance</p>
                <p className={`text-sm font-semibold ${getPerformanceColor(cryptoMetrics?.postQuantumEncryption?.performance)}`}>
                  {cryptoMetrics?.postQuantumEncryption?.performance?.toFixed(1)}%
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Active Algorithms</p>
              <div className="flex flex-wrap gap-1">
                {cryptoMetrics?.postQuantumEncryption?.algorithms?.map((algo, index) => (
                  <span
                    key={index}
                    className="text-xs bg-teal-900/30 text-teal-400 px-2 py-1 rounded"
                  >
                    {algo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Secure Multi-Party Computation */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Cpu className="h-4 w-4 mr-2 text-purple-400" />
                Secure Multi-Party Computation
              </h4>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                {cryptoMetrics?.secureMultiParty?.participantNodes} Nodes
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Active Computations</p>
                <p className="text-lg font-semibold text-purple-400">{cryptoMetrics?.secureMultiParty?.activeComputations}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Data Integrity</p>
                <p className="text-lg font-semibold text-green-400">{cryptoMetrics?.secureMultiParty?.dataIntegrity?.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Homomorphic Encryption */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Database className="h-4 w-4 mr-2 text-orange-400" />
                Homomorphic Encryption
              </h4>
              <div className="flex items-center space-x-2">
                {cryptoMetrics?.homomorphicEncryption?.privacyPreserved && (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                )}
                <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                  Privacy-Preserving
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Operations</p>
                <p className="text-lg font-semibold text-orange-400">{cryptoMetrics?.homomorphicEncryption?.operations}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Performance</p>
                <p className={`text-lg font-semibold ${getPerformanceColor(cryptoMetrics?.homomorphicEncryption?.performanceMetrics)}`}>
                  {cryptoMetrics?.homomorphicEncryption?.performanceMetrics?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Deployment Status */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Deployment Status & Performance</h3>
              <p className="text-sm text-gray-400">Real-time cryptographic system monitoring</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {deploymentStatus?.map((component, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(component?.status)}
                    <span className="text-sm font-medium text-gray-300">{component?.component}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(component?.status)} bg-gray-700/50`}>
                    {component?.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Uptime</p>
                    <p className="text-green-400 font-semibold">{component?.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Performance</p>
                    <p className={`font-semibold ${getPerformanceColor(component?.performance)}`}>
                      {component?.performance?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-blue-400 font-semibold">{component?.lastUpdate}</p>
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