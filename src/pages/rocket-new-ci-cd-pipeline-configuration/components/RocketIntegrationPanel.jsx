import React from 'react';
import { Copy, Check, Rocket, Shield, Zap, GitBranch } from 'lucide-react';

const RocketIntegrationPanel = ({ copyToClipboard, copiedSection }) => {
  const rocketConfig = `# Rocket.new Platform Integration
ROCKET_PROJECT_ID=trading-mvp
ROCKET_API_TOKEN=\${{ secrets.ROCKET_API_TOKEN }}
ROCKET_DEPLOY_ENV=production
ROCKET_BUILD_COMMAND="npm run build"
ROCKET_DIST_FOLDER="dist"`;

  const envVariables = `# Environment Variables for Rocket.new
VITE_SUPABASE_URL=\${{ secrets.SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY=\${{ secrets.SUPABASE_ANON_KEY }}
VITE_OPENAI_API_KEY=\${{ secrets.OPENAI_API_KEY }}
VITE_MVP_API_BASE=\${{ secrets.MVP_API_BASE }}
VITE_ORCHESTRATOR_URL=\${{ secrets.ORCHESTRATOR_URL }}`;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
          <Rocket className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Rocket.new Integration</h3>
      </div>

      <div className="space-y-6">
        {/* Platform Authentication */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-400" />
            <h4 className="text-lg font-semibold text-white">Platform Authentication</h4>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <pre className="text-sm text-green-400 overflow-x-auto">
              <code>{rocketConfig}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(rocketConfig, 'rocket-config')}
              className="mt-2 flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedSection === 'rocket-config' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSection === 'rocket-config' ? 'Copied!' : 'Copy Config'}</span>
            </button>
          </div>
        </div>

        {/* Build Optimization */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-orange-400" />
            <h4 className="text-lg font-semibold text-white">Build Optimization</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-600">
              <h5 className="text-sm font-medium text-blue-300 mb-2">React + Vite</h5>
              <p className="text-xs text-slate-400">Optimized bundling with tree-shaking and code splitting</p>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-600">
              <h5 className="text-sm font-medium text-teal-300 mb-2">Node.js 20.x</h5>
              <p className="text-xs text-slate-400">Latest LTS version with performance improvements</p>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-purple-400" />
            <h4 className="text-lg font-semibold text-white">Environment Injection</h4>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <pre className="text-sm text-purple-400 overflow-x-auto">
              <code>{envVariables}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(envVariables, 'env-vars')}
              className="mt-2 flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedSection === 'env-vars' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSection === 'env-vars' ? 'Copied!' : 'Copy Variables'}</span>
            </button>
          </div>
        </div>

        {/* Deployment Triggers */}
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg p-4 border border-blue-500/20">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">Automated Triggers</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Push to main branch → Production deployment</li>
            <li>• Push to develop → Staging deployment</li>
            <li>• Pull requests → Preview deployment</li>
            <li>• Manual workflow dispatch available</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RocketIntegrationPanel;