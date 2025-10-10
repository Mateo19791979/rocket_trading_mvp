import React, { useState } from 'react';
import { Shield, Lock, Globe, CheckCircle, Network, Key } from 'lucide-react';

export default function TraefikSecurityPanel({ stats }) {
  const [securityConfig, setSecurityConfig] = useState({
    rateLimit: {
      avgApi: 20,
      burstApi: 40,
      avgFront: 10,
      burstFront: 20
    },
    securityHeaders: {
      hsts: true,
      stsSeconds: 31536000,
      stsIncludeSubdomains: true,
      stsPreload: true,
      contentTypeNosniff: true,
      browserXssFilter: true,
      referrerPolicy: 'no-referrer-when-downgrade',
      frameOptions: 'SAMEORIGIN',
      csp: "default-src \'self\'; img-src \'self\' data:; style-src \'self\' \'unsafe-inline\'; script-src \'self\'; connect-src \'self\' https: wss:;"
    },
    middleware: {
      redirectHttps: true,
      websocketSupport: true,
      compression: true
    }
  });

  const [rateLimitStats] = useState({
    apiRequests: {
      current: 18,
      limit: 20,
      blocked: 3
    },
    frontendRequests: {
      current: 8,
      limit: 10,
      blocked: 1
    }
  });

  const [certificateInfo] = useState({
    domain: 'trading-mvp.com',
    issuer: "Let's Encrypt",
    validFrom: '2024-01-15',
    validUntil: '2024-04-15',
    status: 'valid',
    autoRenewal: true
  });

  const updateRateLimit = (section, key, value) => {
    setSecurityConfig(prev => ({
      ...prev,
      rateLimit: {
        ...prev?.rateLimit,
        [key]: parseInt(value)
      }
    }));
  };

  const toggleSecurityHeader = (key) => {
    setSecurityConfig(prev => ({
      ...prev,
      securityHeaders: {
        ...prev?.securityHeaders,
        [key]: !prev?.securityHeaders?.[key]
      }
    }));
  };

  const applySecurityConfig = () => {
    console.log('Applying Traefik security configuration:', securityConfig);
    // Here you would make API call to update Traefik configuration
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Rate Limiting Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          Rate Limiting & Middleware
        </h3>

        <div className="space-y-6">
          {/* API Rate Limits */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Network className="w-4 h-4" />
              API Rate Limits
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Average (req/sec)</label>
                <input
                  type="number"
                  value={securityConfig?.rateLimit?.avgApi}
                  onChange={(e) => updateRateLimit('api', 'avgApi', e?.target?.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Burst Limit</label>
                <input
                  type="number"
                  value={securityConfig?.rateLimit?.burstApi}
                  onChange={(e) => updateRateLimit('api', 'burstApi', e?.target?.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current: {rateLimitStats?.apiRequests?.current}/{rateLimitStats?.apiRequests?.limit}</span>
                <span className="text-red-400">Blocked: {rateLimitStats?.apiRequests?.blocked}</span>
              </div>
            </div>
          </div>

          {/* Frontend Rate Limits */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Frontend Rate Limits
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Average (req/sec)</label>
                <input
                  type="number"
                  value={securityConfig?.rateLimit?.avgFront}
                  onChange={(e) => updateRateLimit('front', 'avgFront', e?.target?.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Burst Limit</label>
                <input
                  type="number"
                  value={securityConfig?.rateLimit?.burstFront}
                  onChange={(e) => updateRateLimit('front', 'burstFront', e?.target?.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Current: {rateLimitStats?.frontendRequests?.current}/{rateLimitStats?.frontendRequests?.limit}</span>
                <span className="text-red-400">Blocked: {rateLimitStats?.frontendRequests?.blocked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Security Headers Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          Security Headers
        </h3>

        <div className="space-y-4">
          {/* HSTS Configuration */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">HTTP Strict Transport Security</h4>
              <button
                onClick={() => toggleSecurityHeader('hsts')}
                className={`px-3 py-1 rounded text-sm ${
                  securityConfig?.securityHeaders?.hsts 
                    ? 'bg-green-600 text-white' :'bg-gray-600 text-gray-300'
                }`}
              >
                {securityConfig?.securityHeaders?.hsts ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={securityConfig?.securityHeaders?.stsIncludeSubdomains}
                  onChange={() => toggleSecurityHeader('stsIncludeSubdomains')}
                  className="rounded"
                />
                <span className="text-gray-300">Include Subdomains</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={securityConfig?.securityHeaders?.stsPreload}
                  onChange={() => toggleSecurityHeader('stsPreload')}
                  className="rounded"
                />
                <span className="text-gray-300">Preload</span>
              </div>
            </div>
          </div>

          {/* Other Security Headers */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Additional Headers</h4>
            <div className="space-y-3">
              {[
                { key: 'contentTypeNosniff', label: 'Content-Type Nosniff' },
                { key: 'browserXssFilter', label: 'X-XSS-Protection' }
              ]?.map((header) => (
                <div key={header?.key} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{header?.label}</span>
                  <button
                    onClick={() => toggleSecurityHeader(header?.key)}
                    className={`px-2 py-1 rounded text-xs ${
                      securityConfig?.securityHeaders?.[header?.key] 
                        ? 'bg-green-600 text-white' :'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {securityConfig?.securityHeaders?.[header?.key] ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CSP Configuration */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Content Security Policy</h4>
            <textarea
              value={securityConfig?.securityHeaders?.csp}
              onChange={(e) => setSecurityConfig(prev => ({
                ...prev,
                securityHeaders: { ...prev?.securityHeaders, csp: e?.target?.value }
              }))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm h-20 focus:outline-none focus:border-red-500"
              placeholder="Enter CSP policy..."
            />
          </div>
        </div>
      </div>
      {/* SSL Certificate & Monitoring */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-green-400" />
          SSL Certificate Management
        </h3>

        <div className="space-y-4">
          {/* Certificate Status */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Certificate Valid</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Domain:</span>
                <span className="text-white">{certificateInfo?.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Issuer:</span>
                <span className="text-white">{certificateInfo?.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-white">{certificateInfo?.validUntil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Auto-Renewal:</span>
                <span className="text-green-400">Enabled</span>
              </div>
            </div>
          </div>

          {/* Security Score */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Score
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 text-sm">Overall</span>
                  <span className="text-green-400 font-bold">A+</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">HSTS:</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CSP:</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rate Limiting:</span>
                <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>

          {/* Apply Configuration */}
          <div className="space-y-3">
            <button
              onClick={applySecurityConfig}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Apply Security Configuration
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Test Security Headers
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Renew SSL Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}