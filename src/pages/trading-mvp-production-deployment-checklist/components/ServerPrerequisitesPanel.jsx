import React from 'react';
import { Server, Cpu, HardDrive, Wifi, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ServerPrerequisitesPanel({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Server className="w-5 h-5 text-blue-400" />;
    }
  };

  const requirements = [
    {
      icon: <Server className="w-4 h-4" />,
      text: 'VPS Linux (2 vCPU, 4–8 GB RAM, 60+ GB SSD)',
      status: status === 'success' ? 'verified' : 'pending'
    },
    {
      icon: <Cpu className="w-4 h-4" />,
      text: 'Docker + Docker Compose',
      status: status === 'success' ? 'verified' : 'pending'
    },
    {
      icon: <Wifi className="w-4 h-4" />,
      text: 'Ports 80/443 ouverts',
      status: status === 'success' ? 'verified' : 'pending'
    }
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        {getStatusIcon()}
        <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
          1) Prérequis serveur
        </h2>
      </div>
      <div className="space-y-4">
        {requirements?.map((req, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="text-slate-400">
              {req?.icon}
            </div>
            <span className="text-slate-300 flex-1">{req?.text}</span>
            <div className="flex items-center gap-2">
              {req?.status === 'verified' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Server Specifications */}
      <div className="mt-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Spécifications recommandées</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <Cpu className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-slate-300 font-medium">2 vCPU</div>
            <div className="text-slate-500">Minimum</div>
          </div>
          <div className="text-center">
            <HardDrive className="w-5 h-5 text-teal-400 mx-auto mb-1" />
            <div className="text-slate-300 font-medium">4-8 GB</div>
            <div className="text-slate-500">RAM</div>
          </div>
          <div className="text-center">
            <Server className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-slate-300 font-medium">60+ GB</div>
            <div className="text-slate-500">SSD</div>
          </div>
        </div>
      </div>
    </div>
  );
}