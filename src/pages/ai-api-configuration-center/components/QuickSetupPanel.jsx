import React, { useState } from 'react';
import { Key, Copy, CheckCircle, AlertCircle } from 'lucide-react';

const QuickSetupPanel = () => {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, keyName) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const apiKeys = [
    {
      name: 'OpenAI',
      key: 'VITE_OPENAI_API_KEY',
      placeholder: 'sk-proj-...',
      description: 'Get your API key from OpenAI Dashboard',
      link: 'https://platform.openai.com/api-keys',
      status: 'missing'
    },
    {
      name: 'Claude (Anthropic)',
      key: 'VITE_ANTHROPIC_API_KEY', 
      placeholder: 'sk-ant-api03-...',
      description: 'Get your API key from Anthropic Console',
      link: 'https://console.anthropic.com/dashboard',
      status: 'missing'
    },
    {
      name: 'Gemini',
      key: 'VITE_GEMINI_API_KEY',
      placeholder: 'AIza...',
      description: 'Get your API key from Google AI Studio',
      link: 'https://ai.google.dev/',
      status: 'missing'
    },
    {
      name: 'Perplexity',
      key: 'VITE_PERPLEXITY_API_KEY',
      placeholder: 'pplx-...',
      description: 'Get your API key from Perplexity Dashboard',
      link: 'https://www.perplexity.ai/settings/api',
      status: 'missing'
    },
    {
      name: 'Google Analytics',
      key: 'VITE_GOOGLE_ANALYTICS_ID',
      placeholder: 'G-XXXXXXXXXX',
      description: 'Get your Measurement ID from Google Analytics 4',
      link: 'https://analytics.google.com/',
      status: 'missing'
    },
    {
      name: 'Google AdSense',
      key: 'VITE_ADSENSE_ID',
      placeholder: 'ca-pub-XXXXXXXXXXXXXXXX',
      description: 'Get your Publisher ID from AdSense dashboard',
      link: 'https://www.google.com/adsense/',
      status: 'missing'
    },
    {
      name: 'Stripe',
      key: 'VITE_STRIPE_PUBLISHABLE_KEY',
      placeholder: 'pk_live_... or pk_test_...',
      description: 'Get your publishable key from Stripe Dashboard',
      link: 'https://dashboard.stripe.com/apikeys',
      status: 'missing'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Key className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Quick API Key Setup
          </h3>
        </div>
        <p className="text-gray-600 mt-2">
          Configure your API keys to enable AI services and integrations
        </p>
      </div>

      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-yellow-800 font-medium">Setup Instructions</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Add these keys to your <code className="bg-yellow-100 px-1.5 py-0.5 rounded text-xs">.env</code> file 
                or configure them through your hosting platform's environment variables.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {apiKeys?.map((apiKey) => (
            <div key={apiKey?.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">{apiKey?.name}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    apiKey?.status === 'missing' ?'bg-red-100 text-red-700' :'bg-green-100 text-green-700'
                  }`}>
                    {apiKey?.status === 'missing' ? (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Missing
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Configured
                      </>
                    )}
                  </span>
                </div>
                <a
                  href={apiKey?.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Get API Key →
                </a>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{apiKey?.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800 flex-1">
                    {apiKey?.key}={apiKey?.placeholder}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${apiKey?.key}=${apiKey?.placeholder}`, apiKey?.key)}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedKey === apiKey?.key ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-blue-900 font-medium mb-2">Environment File (.env)</h4>
          <p className="text-blue-800 text-sm mb-3">
            Create or update your .env file in the project root with your actual API keys:
          </p>
          <div className="bg-white rounded border border-blue-300 p-3">
            <pre className="text-xs text-gray-800 font-mono">
{`# AI Services
VITE_OPENAI_API_KEY=your-actual-openai-key-here
VITE_ANTHROPIC_API_KEY=your-actual-claude-key-here
VITE_GEMINI_API_KEY=your-actual-gemini-key-here
VITE_PERPLEXITY_API_KEY=your-actual-perplexity-key-here

# Analytics & Monetization
VITE_GOOGLE_ANALYTICS_ID=your-actual-ga-id-here
VITE_ADSENSE_ID=your-actual-adsense-id-here

# Payments
VITE_STRIPE_PUBLISHABLE_KEY=your-actual-stripe-key-here`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSetupPanel;