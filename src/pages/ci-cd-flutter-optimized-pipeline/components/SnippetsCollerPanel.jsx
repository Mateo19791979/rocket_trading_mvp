import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Copy, Check } from 'lucide-react';

const SnippetsCollerPanel = () => {
  const [copiedSnippet, setCopiedSnippet] = useState(null);

  const snippets = [
    {
      title: "Configuration Concurrency",
      code: `concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true`
    },
    {
      title: "Permissions & Environment",
      code: `permissions:
  contents: read
env:
  FLUTTER_VERSION: '3.16.0'
  PUB_CACHE: ~/.pub-cache`
    },
    {
      title: "Upload Artifact",
      code: `# upload-artifact
with:
  name: apk-\${{ matrix.flavor }}
  path: build/app/outputs/flutter-apk/*.apk
  retention-days: 7`
    }
  ];

  const copyToClipboard = async (code, index) => {
    try {
      await navigator?.clipboard?.writeText(code);
      setCopiedSnippet(index);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clipboard className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Snippets à coller</h2>
      </div>
      
      <div className="space-y-6">
        {snippets?.map((snippet, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-slate-800/40 border border-blue-500/20 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-slate-800/30 border-b border-blue-500/10">
              <h3 className="text-blue-400 font-medium text-sm">
                {snippet?.title}
              </h3>
              <button
                onClick={() => copyToClipboard(snippet?.code, index)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20 rounded-lg text-blue-400 text-xs transition-all duration-200"
              >
                {copiedSnippet === index ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copier
                  </>
                )}
              </button>
            </div>
            <div className="p-4">
              <pre className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                <code className="language-yaml">
                  {snippet?.code}
                </code>
              </pre>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SnippetsCollerPanel;