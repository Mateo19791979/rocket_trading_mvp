import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Code, 
  Clock,
  Activity as ActivityIcon
} from 'lucide-react';

const ServiceCard = ({ service, status }) => {
  const [expandedEndpoints, setExpandedEndpoints] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const getStatusIcon = () => {
    if (!status) return <ActivityIcon className="w-4 h-4 text-gray-400" />;
    
    switch (status?.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return 'text-gray-400';
    
    switch (status?.status) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const copyToClipboard = (endpoint) => {
    const url = `http://localhost:${service?.port?.split('→')?.[0]}${endpoint?.path}`;
    navigator.clipboard?.writeText(url);
    setCopiedEndpoint(endpoint?.path);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const IconComponent = service?.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
    >
      {/* Service Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 bg-${service?.color}-600 rounded-lg mr-3`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{service?.name}</h3>
            <p className="text-gray-400 text-xs">{service?.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {status?.status || 'unknown'}
          </span>
        </div>
      </div>
      {/* Tech & Port Info */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">
            {service?.tech}
          </span>
          <span className="text-gray-500">Port: {service?.port}</span>
        </div>
        
        {status && (
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{status?.response_time}ms</span>
            <span>({status?.uptime})</span>
          </div>
        )}
      </div>
      {/* Endpoints */}
      <div className="space-y-2">
        <button
          onClick={() => setExpandedEndpoints(!expandedEndpoints)}
          className="flex items-center justify-between w-full text-left text-xs text-gray-300 hover:text-white transition-colors"
        >
          <span className="font-medium">Endpoints ({service?.endpoints?.length})</span>
          <Code className={`w-3 h-3 transform transition-transform ${expandedEndpoints ? 'rotate-180' : ''}`} />
        </button>
        
        {expandedEndpoints && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-1 mt-2"
          >
            {service?.endpoints?.map((endpoint, index) => (
              <div
                key={index}
                className="bg-gray-900/50 rounded-lg p-2 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded text-white ${
                      endpoint?.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {endpoint?.method}
                    </span>
                    <code className="text-xs text-blue-300">{endpoint?.path}</code>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(endpoint)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedEndpoint === endpoint?.path ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-400">{endpoint?.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
        <a
          href="#"
          className="flex items-center text-xs text-blue-400 hover:text-blue-300"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Test API
        </a>
        
        <a
          href="#"
          className="flex items-center text-xs text-teal-400 hover:text-teal-300"
        >
          <Code className="w-3 h-3 mr-1" />
          Docs
        </a>
      </div>
    </motion.div>
  );
};

export default ServiceCard;