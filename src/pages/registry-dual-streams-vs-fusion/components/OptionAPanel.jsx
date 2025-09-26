import React from 'react';
import { CheckCircle, Database, BookOpen, GitBranch, Monitor, ArrowRight } from 'lucide-react';

export default function OptionAPanel({ registryData, activeTab, onTabChange }) {
  const advantages = [
    {
      icon: CheckCircle,
      title: "Robustesse",
      description: "si un flux tombe, l'autre reste OK"
    },
    {
      icon: Database, 
      title: "Debug clair par source",
      description: "schéma simple et stable"
    },
    {
      icon: GitBranch,
      title: "Comparaison facile", 
      description: "livres vs open-access"
    }
  ];

  const endpoints = [
    {
      path: "/registry_private",
      description: "Corpus Livres (PDF fournis)",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500",
      data: registryData?.private || []
    },
    {
      path: "/registry_open", 
      description: "Open-Access Feeder (arXiv, SSRN…)",
      color: "text-teal-400",
      bgColor: "bg-teal-500/20", 
      borderColor: "border-teal-500",
      data: registryData?.open || []
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-6 border border-slate-600 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-400">
            Deux flux séparés
          </h2>
          <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500">
            recommandé MAINTENANT
          </span>
        </div>
      </div>
      {/* Endpoints */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Endpoints:
        </h3>
        <div className="space-y-3">
          {endpoints?.map((endpoint, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 ${endpoint?.bgColor} ${endpoint?.borderColor}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <code className={`text-sm font-mono ${endpoint?.color}`}>
                  {endpoint?.path}
                </code>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{endpoint?.description}</span>
              </div>
              <div className="text-xs text-gray-400">
                {endpoint?.data?.length} stratégies disponibles
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Avantages */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Avantages:</h3>
        <div className="space-y-3">
          {advantages?.map((advantage, index) => (
            <div key={index} className="flex items-start gap-3">
              <advantage.icon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-white">{advantage?.title}:</span>
                <span className="text-gray-300 ml-1">{advantage?.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Front Rocket */}
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-500">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Front Rocket:
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Deux widgets (onglets)</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500">
                Private
              </span>
              <span className="text-gray-500">|</span>
              <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded border border-teal-500">
                Open
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Bus Monitor pointe toujours sur</span>
            <code className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500">
              /status
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}