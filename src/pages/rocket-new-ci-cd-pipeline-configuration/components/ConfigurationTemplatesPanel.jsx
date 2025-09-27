import React, { useState } from 'react';
import { Copy, Check, FileText, Github, TestTube, Shield } from 'lucide-react';

const ConfigurationTemplatesPanel = ({ copyToClipboard, copiedSection }) => {
  const [activeTemplate, setActiveTemplate] = useState('github-actions');

  const templates = {
    'github-actions': {
      name: 'GitHub Actions Integration',
      icon: Github,
      color: 'blue',
      code: `name: Rocket Trading MVP CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

env:
  NODE_VERSION: '20.x'

jobs:
  install-and-test:
    name: "🔎 Install & Tests"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: "Setup Node.js"
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - name: "Install dependencies"
        run: npm ci
      - name: "Lint & Test with Coverage"
        run: |
          npm run lint || echo "⚠️ Lint setup needed"
          npm run test -- --coverage --watchAll=false

  build:
    name: "📦 Build & Deploy"
    needs: install-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
      - run: npm ci
      
      - name: "Create .env.production"
        run: |
          echo "VITE_SUPABASE_URL=\${{ secrets.SUPABASE_URL }}" >> .env.production
          echo "VITE_SUPABASE_ANON_KEY=\${{ secrets.SUPABASE_ANON_KEY }}">> .env.production - name:"Build Trading MVP"
        run: npm run build
        
      - name: "Deploy to Rocket.new"
        if: github.ref == 'refs/heads/main'
        run: |
          echo "Deploying to production..."
          # Add Rocket.new deployment commands here`
    },
    'testing-config': {
      name: 'Testing with Jest & Cypress',
      icon: TestTube,
      color: 'green',
      code: `# Jest Configuration (jest.config.js)
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

# Cypress E2E Configuration
describe('Trading MVP E2E', () => {
  it('should load dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('Portfolio Balance');
    cy.get('[data-testid="balance-card"]').should('be.visible');
  });
  
  it('should navigate to market analysis', () => {
    cy.visit('/market-analysis');
    cy.get('[data-testid="quotes-table"]').should('exist');
  });
});`
    },
    'deployment-ready': {
      name: 'Deployment-Ready Examples',
      icon: Shield,
      color: 'purple',
      code: `# Production Deployment Pipeline
deploy:
  name: "🚀 Deploy to Production"
  needs: build
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://trading-mvp.rocket.new
  steps:
    - uses: actions/checkout@v4
    
    - name: "Download Build Artifacts"
      uses: actions/download-artifact@v4
      with:
        name: trading-mvp-build
        path: dist/
    
    - name: "Deploy with Supabase"
      run: |
        npm install -g supabase
        supabase db push --project-ref \${{ secrets.SUPABASE_PROJECT_REF }}
    
    - name: "Deploy to Rocket.new"
      run: |
        echo "Deploying to Rocket.new..."
        # Rocket.new specific deployment
        curl -X POST "https://api.rocket.new/deploy" \\
          -H "Authorization: Bearer \${{ secrets.ROCKET_API_TOKEN }}" \\
          -d '{"project": "trading-mvp", "environment": "production"}'
    
    - name: "Health Check"
      run: |
        curl -f https://trading-mvp.rocket.new/health || exit 1`
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Configuration Templates</h3>
      </div>
      {/* Template Selector */}
      <div className="flex space-x-2 mb-6">
        {Object.entries(templates)?.map(([key, template]) => (
          <button
            key={key}
            onClick={() => setActiveTemplate(key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
              activeTemplate === key
                ? `bg-${template?.color}-500/20 text-${template?.color}-300 border border-${template?.color}-500/30`
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <template.icon className="h-4 w-4" />
            <span>{template?.name}</span>
          </button>
        ))}
      </div>
      {/* Template Content */}
      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">{templates?.[activeTemplate]?.name}</h4>
            <button
              onClick={() => copyToClipboard(templates?.[activeTemplate]?.code, activeTemplate)}
              className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              {copiedSection === activeTemplate ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-slate-400" />}
              <span className="text-xs text-slate-300">{copiedSection === activeTemplate ? 'Copied!' : 'Copy Template'}</span>
            </button>
          </div>
          <pre className="text-sm text-slate-300 overflow-x-auto">
            <code>{templates?.[activeTemplate]?.code}</code>
          </pre>
        </div>

        {/* Template Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg p-3 border border-blue-500/20">
            <h5 className="text-xs font-semibold text-blue-300 mb-1">Syntax Highlighting</h5>
            <p className="text-xs text-slate-400">YAML validation and formatting</p>
          </div>
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20">
            <h5 className="text-xs font-semibold text-green-300 mb-1">Automated Testing</h5>
            <p className="text-xs text-slate-400">Jest, Cypress integration ready</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
            <h5 className="text-xs font-semibold text-purple-300 mb-1">Build Verification</h5>
            <p className="text-xs text-slate-400">Automated quality checks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationTemplatesPanel;