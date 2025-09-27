import React from 'react';
import { Copy, Check, Zap, Package, TestTube, Rocket } from 'lucide-react';

const PipelineOptimizationPanel = ({ copyToClipboard, copiedSection }) => {
  const optimizedJob = `install-and-test:
  name: "🔎 Install & Tests"
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: "Setup Node.js 20.x"
      uses: actions/setup-node@v4
      with:
        node-version: '20.x' cache:'npm'
    - name: "Install dependencies"
      run: npm ci
    - name: "Lint & Test with Coverage"
      run: |
        npm run lint || echo "⚠️ Lint configuration needed"
        npm run test -- --coverage --watchAll=false
        npm run test:e2e || echo "⚠️ E2E tests optional"`;

  const buildOptimization = `build:
  name: "📦 Build Trading MVP"
  needs: install-and-test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20.x' cache:'npm'
    - run: npm ci
    
    - name: "Create .env.production"
      run: |
        echo "VITE_SUPABASE_URL=\${{ secrets.SUPABASE_URL }}" >> .env.production
        echo "VITE_SUPABASE_ANON_KEY=\${{ secrets.SUPABASE_ANON_KEY }}">> .env.production echo"VITE_MVP_API_BASE=\${{ secrets.MVP_API_BASE }}">> .env.production - name:"Build with Vite"
      run: |
        npm run build
        ls -la dist/
        
    - name: "Bundle Analysis"
      run: |
        npx vite-bundle-analyzer dist/ --open=false
        
    - uses: actions/upload-artifact@v4
      with:
        name: trading-mvp-build
        path: dist/
        retention-days: 7`;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Pipeline Optimization</h3>
      </div>

      <div className="space-y-6">
        {/* React Enhancements */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">React-Specific Enhancements</h4>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <pre className="text-sm text-blue-400 overflow-x-auto">
              <code>{optimizedJob}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(optimizedJob, 'optimized-job')}
              className="mt-2 flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedSection === 'optimized-job' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSection === 'optimized-job' ? 'Copied!' : 'Copy Test Job'}</span>
            </button>
          </div>
        </div>

        {/* Build Optimization */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Rocket className="h-4 w-4 text-teal-400" />
            <h4 className="text-lg font-semibold text-white">Build Artifact Optimization</h4>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <pre className="text-sm text-teal-400 overflow-x-auto">
              <code>{buildOptimization}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(buildOptimization, 'build-opt')}
              className="mt-2 flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {copiedSection === 'build-opt' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSection === 'build-opt' ? 'Copied!' : 'Copy Build Job'}</span>
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <TestTube className="h-4 w-4 text-green-400" />
              <h5 className="text-sm font-semibold text-green-300">Faster Install</h5>
            </div>
            <p className="text-xs text-slate-300">npm ci reduces install time by 40-60%</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="h-4 w-4 text-purple-400" />
              <h5 className="text-sm font-semibold text-purple-300">Bundle Analysis</h5>
            </div>
            <p className="text-xs text-slate-300">Automated bundle size monitoring</p>
          </div>
        </div>

        {/* Rocket.new Commands */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
          <h4 className="text-sm font-semibold text-orange-300 mb-2">Rocket.new Deployment Commands</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• Progress monitoring with build status updates</li>
            <li>• Automated rollback on deployment failure</li>
            <li>• Health checks post-deployment</li>
            <li>• Performance metrics collection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PipelineOptimizationPanel;