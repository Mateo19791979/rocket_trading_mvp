import React, { useState } from 'react';
import { Puzzle, Eye, List, Target, Monitor, CheckCircle, AlertTriangle, Copy } from 'lucide-react';

const RecommendedWidgetsPanel = () => {
  const [widgetStatus, setWidgetStatus] = useState({
    poster: 'ready',
    registry: 'ready', 
    orchestrator: 'pending',
    busmonitor: 'pending'
  });

  const widgets = [
    {
      key: 'poster',
      name: 'Poster Vision / Plaquette',
      description: 'présentation',
      icon: Eye,
      code: 'widget-poster-vision',
      color: 'teal'
    },
    {
      key: 'registry',
      name: 'Registry',
      description: 'liste des stratégies',
      icon: List,
      code: 'widget-registry',
      color: 'orange'
    },
    {
      key: 'orchestrator',
      name: 'Orchestrateur',
      description: 'scores, select, allocate',
      icon: Target,
      code: 'widget-orchestrator',
      color: 'teal'
    },
    {
      key: 'busmonitor',
      name: 'Bus Monitor',
      description: 'statuts live des services',
      icon: Monitor,
      code: 'widget-bus-monitor',
      color: 'orange'
    }
  ];

  const copyWidgetCode = (widget) => {
    const code = `<div id="${widget?.code}">
  <script>
    fetch('https://api.trading-mvp.com/${widget?.key}')
      .then(response => response.json())
      .then(data => {
        document.getElementById('${widget?.code}').innerHTML = JSON.stringify(data, null, 2);
      });
  </script>
</div>`;
    navigator.clipboard?.writeText(code);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-teal-400" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-teal-500 rounded-lg mr-4">
          <Puzzle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">🧩 Widgets recommandés</h3>
      </div>
      <div className="space-y-4">
        {widgets?.map((widget) => {
          const IconComponent = widget?.icon;
          return (
            <div key={widget?.key} className={`p-4 rounded-lg border ${
              widget?.color === 'teal' ?'bg-teal-500/20 border-teal-400/30' :'bg-orange-500/20 border-orange-400/30'
            } hover:bg-white/10 transition-all`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <IconComponent className="w-5 h-5 text-white mr-3" />
                  <div>
                    <h4 className="font-semibold text-white">• {widget?.name}</h4>
                    <p className="text-sm text-gray-300">({widget?.description})</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(widgetStatus?.[widget?.key])}
                  <button
                    onClick={() => copyWidgetCode(widget)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    title="Copier le code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Widget Preview */}
              <div className="mt-3 p-3 bg-black/20 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
                {`<div id="${widget?.code}"></div>`}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-gray-300 mb-2">
          💡 <strong>Utilisation:</strong> Copier le code widget et coller dans Rocket section "HTML/Embed"
        </p>
        <p className="text-xs text-gray-400">
          Les widgets se connectent automatiquement aux endpoints API correspondants
        </p>
      </div>
    </div>
  );
};

export default RecommendedWidgetsPanel;