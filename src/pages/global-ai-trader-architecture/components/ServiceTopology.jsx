import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, MousePointer } from 'lucide-react';

const ServiceTopology = ({ services, serviceStatuses }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);

  const getStatusColor = (serviceId) => {
    const status = serviceStatuses?.[serviceId];
    if (!status) return 'gray-400';
    
    switch (status?.status) {
      case 'healthy':
        return 'green-400';
      case 'warning':
        return 'yellow-400';
      case 'error':
        return 'red-400';
      default:
        return 'gray-400';
    }
  };

  const serviceConnections = [
    { from: 'data_phoenix', to: 'quant_oracle', type: 'data_feed' },
    { from: 'data_phoenix', to: 'immune_sentinel', type: 'data_feed' },
    { from: 'quant_oracle', to: 'strategy_weaver', type: 'signals' },
    { from: 'immune_sentinel', to: 'strategy_weaver', type: 'risk_data' },
    { from: 'strategy_weaver', to: 'deployer', type: 'strategies' },
    { from: 'deployer', to: 'dashboard', type: 'execution_status' }
  ];

  const getServicePosition = (serviceId) => {
    const positions = {
      data_phoenix: { x: 10, y: 50 },
      quant_oracle: { x: 35, y: 25 },
      immune_sentinel: { x: 35, y: 75 },
      strategy_weaver: { x: 65, y: 50 },
      deployer: { x: 85, y: 50 },
      dashboard: { x: 100, y: 25 }
    };
    return positions?.[serviceId] || { x: 50, y: 50 };
  };

  const getConnectionPath = (from, to) => {
    const fromPos = getServicePosition(from);
    const toPos = getServicePosition(to);
    
    const startX = fromPos?.x;
    const startY = fromPos?.y;
    const endX = toPos?.x;
    const endY = toPos?.y;
    
    const midX = (startX + endX) / 2;
    
    return `M ${startX} ${startY} Q ${midX} ${startY} ${endX} ${endY}`;
  };

  return (
    <div className="bg-gray-900/50 rounded-2xl p-6 shadow-xl border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-600 rounded-lg mr-3">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">🔗 Topologie Services</h2>
            <p className="text-gray-400 text-sm">Flux de données & interconnexions</p>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 flex items-center space-x-2">
          <MousePointer className="w-4 h-4" />
          <span>Cliquez sur un service pour plus de détails</span>
        </div>
      </div>
      {/* Topology Diagram */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 mb-6" style={{ minHeight: '400px' }}>
        <div className="relative w-full h-80">
          <svg
            viewBox="0 0 120 100"
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
          >
            {/* Connection Lines */}
            {serviceConnections?.map((connection, index) => {
              const isHovered = hoveredConnection === `${connection?.from}-${connection?.to}`;
              return (
                <g key={index}>
                  <motion.path
                    d={getConnectionPath(connection?.from, connection?.to)}
                    stroke={isHovered ? "#60A5FA" : "#6B7280"}
                    strokeWidth={isHovered ? "0.8" : "0.5"}
                    fill="none"
                    strokeDasharray="2,2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                    onMouseEnter={() => setHoveredConnection(`${connection?.from}-${connection?.to}`)}
                    onMouseLeave={() => setHoveredConnection(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Connection Type Label */}
                  {isHovered && (
                    <motion.text
                      x={(getServicePosition(connection?.from)?.x + getServicePosition(connection?.to)?.x) / 2}
                      y={(getServicePosition(connection?.from)?.y + getServicePosition(connection?.to)?.y) / 2 - 2}
                      textAnchor="middle"
                      fontSize="3"
                      fill="#60A5FA"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {connection?.type?.replace('_', ' ')}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Service Nodes */}
          {services?.map((service) => {
            const position = getServicePosition(service?.id);
            const IconComponent = service?.icon;
            const statusColor = getStatusColor(service?.id);
            const isSelected = selectedService === service?.id;
            
            return (
              <motion.div
                key={service?.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                  isSelected ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${position?.x}%`,
                  top: `${position?.y}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedService(isSelected ? null : service?.id)}
              >
                <div className={`relative p-4 bg-gray-800 rounded-xl border-2 shadow-lg transition-all ${
                  isSelected 
                    ? `border-${service?.color}-400 shadow-${service?.color}-400/20` 
                    : 'border-gray-600 hover:border-gray-500'
                }`}>
                  {/* Status Indicator */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 bg-${statusColor} rounded-full border-2 border-gray-800 animate-pulse`} />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2 bg-${service?.color}-600 rounded-lg mb-2`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-white text-xs font-semibold mb-1">{service?.name}</h3>
                    <p className="text-gray-400 text-xs">{service?.tech}</p>
                    <p className="text-gray-500 text-xs">{service?.port}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Dashboard Node */}
          <motion.div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            style={{ left: '100%', top: '25%' }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="relative p-4 bg-gray-800 rounded-xl border-2 border-gray-600 hover:border-gray-500 shadow-lg transition-all">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse" />
              
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-indigo-600 rounded-lg mb-2">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white text-xs font-semibold mb-1">Dashboard</h3>
                <p className="text-gray-400 text-xs">UI</p>
                <p className="text-gray-500 text-xs">18005:8004</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Service Details Panel */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          {(() => {
            const service = services?.find(s => s?.id === selectedService);
            const status = serviceStatuses?.[selectedService];
            const IconComponent = service?.icon;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 bg-${service?.color}-600 rounded-xl mr-4`}>
                      {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{service?.name}</h3>
                      <p className="text-gray-400">{service?.description}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status Info */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">État du Service</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`text-${getStatusColor(selectedService)}`}>
                          {status?.status || 'unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Response Time:</span>
                        <span className="text-white">{status?.response_time || 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uptime:</span>
                        <span className="text-white">{status?.uptime || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Endpoints */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">Endpoints Disponibles</h4>
                    <div className="space-y-2">
                      {service?.endpoints?.slice(0, 3)?.map((endpoint, index) => (
                        <div key={index} className="text-xs">
                          <div className="flex items-center space-x-2">
                            <span className={`px-1.5 py-0.5 rounded text-white ${
                              endpoint?.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                              {endpoint?.method}
                            </span>
                            <code className="text-blue-300">{endpoint?.path}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Connections */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">Connexions</h4>
                    <div className="space-y-2 text-xs">
                      {serviceConnections?.filter(conn => conn?.from === selectedService || conn?.to === selectedService)?.map((conn, index) => (
                          <div key={index} className="text-gray-400">
                            {conn?.from === selectedService ? (
                              <span>→ {conn?.to} <span className="text-gray-500">({conn?.type})</span></span>
                            ) : (
                              <span>← {conn?.from} <span className="text-gray-500">({conn?.type})</span></span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Healthy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span>Error</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-gray-500 border-dashed"></div>
          <span>Data Flow</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceTopology;