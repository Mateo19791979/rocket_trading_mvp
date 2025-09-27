import React, { useState } from 'react';
import { GitBranch, GitPullRequest, Clock, Play } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const TriggerConfigPanel = () => {
  const [triggerStates, setTriggerStates] = useState({
    push: { active: true, count: 24, lastTriggered: '2 min ago' },
    pr: { active: true, count: 12, lastTriggered: '15 min ago' },
    schedule: { active: true, count: 1, lastTriggered: '2h 15min ago' },
    manual: { active: true, count: 3, lastTriggered: '1h 30min ago' }
  });

  const triggers = [
    {
      id: 'push',
      icon: GitBranch,
      title: 'Push (main, develop, feature/*, hotfix/*)',
      description: 'Déclenchement automatique sur push',
      color: 'bg-blue-600',
      borderColor: 'border-blue-500'
    },
    {
      id: 'pr',
      icon: GitPullRequest,
      title: 'Pull Request (main, develop, paths filtrés)',
      description: 'Validation automatique des PR',
      color: 'bg-blue-600',
      borderColor: 'border-blue-500'
    },
    {
      id: 'schedule',
      icon: Clock,
      title: 'Schedule (scan sécurité 02h UTC)',
      description: 'Scan sécurité programmé',
      color: 'bg-blue-600',
      borderColor: 'border-blue-500'
    },
    {
      id: 'manual',
      icon: Play,
      title: 'Dispatch manuel',
      description: 'Déclenchement manuel avec paramètres',
      color: 'bg-blue-600',
      borderColor: 'border-blue-500'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GitBranch className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">🟦 Déclencheurs</h3>
          <p className="text-gray-400 text-sm">Configuration et statuts des triggers</p>
        </div>
      </div>
      <div className="space-y-4">
        {triggers?.map((trigger) => {
          const Icon = trigger?.icon;
          const state = triggerStates?.[trigger?.id];
          
          return (
            <div 
              key={trigger?.id}
              className={`bg-gray-700 rounded-lg p-4 border-l-4 ${trigger?.borderColor} hover:bg-gray-600 transition-colors cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`${trigger?.color} p-2 rounded-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">• {trigger?.title}</p>
                    <p className="text-gray-400 text-sm">{trigger?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${state?.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-400">{state?.active ? 'Actif' : 'Inactif'}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {state?.count} fois • {state?.lastTriggered}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Fréquence moyenne</span>
          <span className="text-blue-400 font-medium">~15 builds/jour</span>
        </div>
      </div>
    </div>
  );
};

export default TriggerConfigPanel;