import React, { useState } from 'react';
import { Server, Code, Play, Copy, CheckCircle } from 'lucide-react';

export default function BackendConfigPanel({ selectedBackend, onBackendChange }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const nodeJsCode = `// server/index.js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ATTENDUES ---
app.get('/health', (req,res)=>res.json({ 
  ok:true, service:'api', ts: Date.now() 
}));

app.get('/positions', (req,res)=>res.json({ 
  items: [], source:'stub' 
}));

app.get('/market', (req,res)=>res.json({ 
  status:'ok', feeds:[], source:'stub' 
}));

app.get('/ops/status', (req,res)=>res.json({ 
  uptime: process.uptime(), 
  memory: process.memoryUsage() 
}));

app.get('/security/tls/health', (req,res)=>res.json({ 
  tls:'ok (proxy term.)' 
}));

// --- 404 explicite pour debug
app.use((req,res)=>res.status(404).json({ 
  ok:false, error:'Route not found', path:req.path 
}));

const PORT = process.env.PORT || 8001;
app.listen(PORT, ()=>console.log('[API] listening on', PORT));`;

  const fastApiCode = `# server/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time, os, psutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True, "service":"api", "ts": int(time.time())}

@app.get("/positions")
def positions():
    return {"items": [], "source": "stub"}

@app.get("/market")
def market():
    return {"status":"ok", "feeds": [], "source":"stub"}

@app.get("/ops/status")
def ops():
    p = psutil.Process(os.getpid())
    return {"uptime": time.time() - p.create_time(), "rss": p.memory_info().rss}

@app.get("/security/tls/health")
def tls():
    return {"tls": "ok (proxy term.)"}`;

  const pm2Command = `pm2 start server/index.js --name api-core`;
  const uvicornCommand = `uvicorn server.main:app --host 0.0.0.0 --port 8001 --workers 2`;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Server className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Backend Service Configuration</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onBackendChange('nodejs')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedBackend === 'nodejs' ?'bg-green-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Node.js
          </button>
          <button
            onClick={() => onBackendChange('fastapi')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedBackend === 'fastapi' ?'bg-green-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            FastAPI
          </button>
        </div>
      </div>

      {selectedBackend === 'nodejs' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">Node.js/Express Implementation</h4>
              <button
                onClick={() => copyToClipboard(nodeJsCode, 'nodejs')}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
              >
                {copiedCode === 'nodejs' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedCode === 'nodejs' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{nodeJsCode}</code>
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">PM2 Startup Command</h4>
              <button
                onClick={() => copyToClipboard(pm2Command, 'pm2')}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
              >
                {copiedCode === 'pm2' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{copiedCode === 'pm2' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <code className="text-sm text-green-400">{pm2Command}</code>
            </div>
          </div>
        </div>
      )}

      {selectedBackend === 'fastapi' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">FastAPI Implementation</h4>
              <button
                onClick={() => copyToClipboard(fastApiCode, 'fastapi')}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
              >
                {copiedCode === 'fastapi' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedCode === 'fastapi' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{fastApiCode}</code>
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">Uvicorn Startup Command</h4>
              <button
                onClick={() => copyToClipboard(uvicornCommand, 'uvicorn')}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
              >
                {copiedCode === 'uvicorn' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{copiedCode === 'uvicorn' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <code className="text-sm text-green-400">{uvicornCommand}</code>
            </div>
          </div>
        </div>
      )}

      {/* Essential Routes Overview */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Essential API Routes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-green-400">GET /health</span>
              <span className="text-gray-400">System status</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">GET /positions</span>
              <span className="text-gray-400">Portfolio data</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">GET /market</span>
              <span className="text-gray-400">Real-time quotes</span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-green-400">GET /ops/status</span>
              <span className="text-gray-400">Operational monitoring</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">GET /security/tls/health</span>
              <span className="text-gray-400">SSL validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test */}
      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
        <div className="flex items-center space-x-2 mb-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Quick Test</span>
        </div>
        <div className="text-xs text-gray-400">
          Test locally: <code className="bg-gray-800 px-1 rounded">curl http://127.0.0.1:8001/health</code>
        </div>
      </div>
    </div>
  );
}