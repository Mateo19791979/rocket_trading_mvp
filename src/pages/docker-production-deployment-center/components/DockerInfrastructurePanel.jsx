import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Container, Shield, Globe, CheckCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import Icon from '@/components/AppIcon';


export default function DockerInfrastructurePanel({ certificates, systemHealth }) {
  const [activeTab, setActiveTab] = useState('traefik');
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const infrastructureConfig = {
    traefik: {
      name: 'Traefik Reverse Proxy',
      icon: Server,
      status: systemHealth?.docker === 'running' ? 'active' : 'inactive',
      details: [
        'Automatic Let\'s Encrypt SSL provisioning',
        'HTTP to HTTPS redirection',
        'Load balancing with health checks',
        'Rate limiting and security headers',
        'WebSocket support for /api/ws'
      ],
      config: `# Traefik v3.0 Production Configuration
image: traefik:v3.0
container_name: traefik
command:
  - --api.dashboard=true
  - --providers.docker=true
  - --providers.docker.exposedbydefault=false
  - --entrypoints.web.address=:80
  - --entrypoints.websecure.address=:443
  - --certificatesresolvers.le.acme.email=\${LETSENCRYPT_EMAIL}
  - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
  - --certificatesresolvers.le.acme.httpchallenge=true
  - --certificatesresolvers.le.acme.httpchallenge.entrypoint=web`
    },
    frontend: {
      name: 'React/Vite Frontend',
      icon: Globe,
      status: 'active',
      details: [
        'Multi-stage Docker build optimization',
        'Nginx serving with SPA fallback',
        'Build-time environment injection',
        'Health endpoint at /healthz',
        'Static assets caching (30 days)'
      ],
      config: `# Multi-stage Frontend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=\${VITE_API_BASE_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80`
    },
    api: {
      name: 'Node.js API Backend',
      icon: Container,
      status: 'active',
      details: [
        'Express.js with CORS configuration',
        'Supabase integration ready',
        'Health endpoints for monitoring',
        'Production error handling',
        'Environment-based configuration'
      ],
      config: `# Production API Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server/index.js"]`
    }
  };

  const sslStatus = certificates?.reduce((acc, cert) => {
    const daysUntilExpiry = cert?.expires_at ? 
      Math.ceil((new Date(cert.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysUntilExpiry <= 7) acc.critical++;
    else if (daysUntilExpiry <= 30) acc.warning++;
    else acc.valid++;
    
    return acc;
  }, { valid: 0, warning: 0, critical: 0 }) || { valid: 0, warning: 0, critical: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Container className="h-5 w-5 text-blue-400" />
            <span>Docker Infrastructure</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              systemHealth?.overall === 'healthy' ? 'bg-green-400' :
              systemHealth?.overall === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm text-gray-400">Production Stack</span>
          </div>
        </div>

        {/* Infrastructure Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-900/50 rounded-lg p-1">
          {Object.entries(infrastructureConfig)?.map(([key, config]) => {
            const Icon = config?.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-blue-600 text-white' :'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {key?.charAt(0)?.toUpperCase() + key?.slice(1)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Configuration */}
        {activeTab && infrastructureConfig?.[activeTab] && (
          <div className="space-y-4">
            {/* Service Status */}
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  infrastructureConfig?.[activeTab]?.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <h4 className="font-medium text-white">
                    {infrastructureConfig?.[activeTab]?.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Status: {infrastructureConfig?.[activeTab]?.status}
                  </p>
                </div>
              </div>
              {infrastructureConfig?.[activeTab]?.status === 'active' && (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
            </div>

            {/* Service Details */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Key Features:</h5>
              {infrastructureConfig?.[activeTab]?.details?.map((detail, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{detail}</span>
                </div>
              ))}
            </div>

            {/* Configuration Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-300">Configuration:</h5>
                <button
                  onClick={() => copyToClipboard(infrastructureConfig?.[activeTab]?.config, activeTab)}
                  className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copiedText === activeTab ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {infrastructureConfig?.[activeTab]?.config}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SSL Certificate Summary */}
        <div className="mt-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">SSL Certificates</span>
            </div>
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-400">{sslStatus?.valid}</div>
              <div className="text-xs text-gray-400">Valid</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-400">{sslStatus?.warning}</div>
              <div className="text-xs text-gray-400">Expiring</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-400">{sslStatus?.critical}</div>
              <div className="text-xs text-gray-400">Critical</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1">
            <ExternalLink className="h-3 w-3" />
            <span>View Dashboard</span>
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1">
            <RefreshCw className="h-3 w-3" />
            <span>Restart Services</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}