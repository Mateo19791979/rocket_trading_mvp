import React, { useState } from 'react';
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const CORSConfigPanel = () => {
  const [corsOrigins, setCorsOrigins] = useState([
    'https://ton-domaine.rocket.new',
    'http://localhost:3000'
  ]);
  const [newOrigin, setNewOrigin] = useState('');
  const [rateLimitConfig, setRateLimitConfig] = useState({
    requestsPerMinute: 60,
    burstLimit: 10,
    authRequired: true
  });

  const addOrigin = () => {
    if (newOrigin?.trim() && !corsOrigins?.includes(newOrigin?.trim())) {
      setCorsOrigins([...corsOrigins, newOrigin?.trim()]);
      setNewOrigin('');
    }
  };

  const removeOrigin = (origin) => {
    setCorsOrigins(corsOrigins?.filter(o => o !== origin));
  };

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-white mr-3" />
        <h3 className="text-xl font-bold text-white">CORS & Rate-Limit</h3>
      </div>
      {/* CORS Origins Configuration */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">CORS_ORIGIN Configuration</h4>
        <div className="space-y-2 mb-4">
          {corsOrigins?.map((origin, index) => (
            <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <code className="text-orange-100 text-sm">{origin}</code>
              </div>
              <button
                onClick={() => removeOrigin(origin)}
                className="text-red-400 hover:text-red-300 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e?.target?.value)}
            placeholder="https://example.com"
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            onKeyPress={(e) => e?.key === 'Enter' && addOrigin()}
          />
          <button
            onClick={addOrigin}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Rate Limiting */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">/orders Rate-Limit</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-orange-100 mb-2">
              Requests per minute
            </label>
            <input
              type="number"
              value={rateLimitConfig?.requestsPerMinute}
              onChange={(e) => setRateLimitConfig({...rateLimitConfig, requestsPerMinute: parseInt(e?.target?.value)})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-100 mb-2">
              Burst limit
            </label>
            <input
              type="number"
              value={rateLimitConfig?.burstLimit}
              onChange={(e) => setRateLimitConfig({...rateLimitConfig, burstLimit: parseInt(e?.target?.value)})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={rateLimitConfig?.authRequired}
            onChange={(e) => setRateLimitConfig({...rateLimitConfig, authRequired: e?.target?.checked})}
            className="mr-3 w-4 h-4 text-orange-600 bg-white/10 border-white/30 rounded focus:ring-orange-500"
          />
          <label className="text-orange-100">Require JWT authentication</label>
        </div>
      </div>
      {/* Audit Logging */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
          <h5 className="font-semibold text-white">Audit Logging</h5>
        </div>
        <ul className="text-sm text-orange-100 space-y-1">
          <li>• Journaliser tous les ordres (succès/échec)</li>
          <li>• Enregistrer les erreurs d'authentification</li>
          <li>• Tracer les dépassements de rate-limit</li>
          <li>• Logs rotatifs (7 jours de rétention)</li>
        </ul>
      </div>
    </div>
  );
};

export default CORSConfigPanel;