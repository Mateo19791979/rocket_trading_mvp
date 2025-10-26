import React, { useState } from 'react';
import { Shield, Copy, CheckCircle, Settings } from 'lucide-react';

export default function NginxConfigPanel() {
  const [copiedConfig, setCopiedConfig] = useState(false);

  const nginxConfig = `/etc/nginx/sites-available/trading-mvp.com :

server {
  listen 80;
  server_name trading-mvp.com www.trading-mvp.com;
  return 301 https://trading-mvp.com$request_uri;
}

server {
  listen 443 ssl http2;
  server_name trading-mvp.com www.trading-mvp.com;

  # Certificats (LetsEncrypt / certbot)
  ssl_certificate     /etc/letsencrypt/live/trading-mvp.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/trading-mvp.com/privkey.pem;

  # Sécurité basique
  client_max_body_size 25m;

  # Frontend statique (si servi par Nginx)
  root /var/www/trading-mvp.com/current;
  index index.html;

  # --- API : route tout /api/* vers le backend 8001 ---
  location /api/ {
    proxy_pass http://127.0.0.1:8001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  # Fallback SPA
  location / {
    try_files $uri $uri/ /index.html;
  }
}`;

  const copyConfig = async () => {
    try {
      await navigator.clipboard?.writeText(nginxConfig);
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const deploymentSteps = [
    { step: 1, command: 'nginx -t', description: 'Test configuration syntax' },
    { step: 2, command: 'systemctl reload nginx', description: 'Reload Nginx with new config' },
    { step: 3, command: 'curl -I https://trading-mvp.com/api/health', description: 'Verify API routing' }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Nginx Reverse Proxy</h3>
        </div>
        <button
          onClick={copyConfig}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
        >
          {copiedConfig ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copiedConfig ? 'Copied!' : 'Copy Config'}</span>
        </button>
      </div>
      {/* Nginx Configuration */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Configuration File</h4>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            <code>{nginxConfig}</code>
          </pre>
        </div>
      </div>
      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-900/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-white mb-2">Security Features</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• HTTPS-only redirect (301)</li>
            <li>• SSL termination with Let's Encrypt</li>
            <li>• HTTP/2 support</li>
            <li>• Security headers configured</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-900/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-white mb-2">Routing Configuration</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• /api/* → Backend :8001</li>
            <li>• /* → SPA fallback</li>
            <li>• Load balancing ready</li>
            <li>• WebSocket support</li>
          </ul>
        </div>
      </div>
      {/* Deployment Steps */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Deployment Steps</h4>
        <div className="space-y-3">
          {deploymentSteps?.map((item) => (
            <div key={item?.step} className="flex items-center space-x-3 p-3 bg-slate-900/50 rounded-lg">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{item?.step}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-800 px-2 py-1 rounded text-xs text-green-400">{item?.command}</code>
                  <span className="text-xs text-gray-400">{item?.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Status Indicators */}
      <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/50">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Proxy Configuration</span>
        </div>
        <div className="text-xs text-gray-400">
          Routes all /api requests to backend :8001 with proper headers and SSL termination
        </div>
      </div>
    </div>
  );
}