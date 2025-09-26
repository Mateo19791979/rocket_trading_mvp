import React, { useState } from 'react';
import { CheckSquare, Square, ArrowRight, Play, Database, Grid3X3, GitMerge, Shield } from 'lucide-react';

export default function ActionPlanPanel() {
  const [completedSteps, setCompletedSteps] = useState([]);

  const actionSteps = [
    {
      id: 1,
      icon: Database,
      title: "Exposer /registry_private et /registry_open",
      description: "(format ci-dessus)",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500"
    },
    {
      id: 2,
      icon: Grid3X3,
      title: "Adapter Rocket: deux onglets",
      description: "Private | Open",
      color: "text-teal-400", 
      bgColor: "bg-teal-500/20",
      borderColor: "border-teal-500"
    },
    {
      id: 3,
      icon: GitMerge,
      title: "Ajouter /registry (fusion)",
      description: "en lecture seule plus tard",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20", 
      borderColor: "border-blue-500"
    },
    {
      id: 4,
      icon: Shield,
      title: "Valider (JSON schema)",
      description: "+ logs dédoublonnage",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500"
    }
  ];

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => 
      prev?.includes(stepId) 
        ? prev?.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const isCompleted = (stepId) => completedSteps?.includes(stepId);

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl p-6 border border-slate-600 h-full">
      <div className="flex items-center gap-3 mb-6">
        <Play className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">
          Plan d'action
        </h2>
        <div className="ml-auto text-sm text-gray-400">
          {completedSteps?.length}/{actionSteps?.length} complétées
        </div>
      </div>
      <div className="space-y-4">
        {actionSteps?.map((step, index) => (
          <div key={step?.id} className="group">
            <div 
              onClick={() => toggleStep(step?.id)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isCompleted(step?.id) 
                  ? `${step?.bgColor} ${step?.borderColor} opacity-75` 
                  : `${step?.bgColor} ${step?.borderColor} hover:bg-opacity-80`
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-lg font-bold text-gray-400">
                    {step?.id})
                  </span>
                  {isCompleted(step?.id) ? (
                    <CheckSquare className="w-5 h-5 text-green-400" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  )}
                  <step.icon className={`w-5 h-5 ${step?.color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isCompleted(step?.id) ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {step?.title}
                    </span>
                    {step?.description && (
                      <>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {step?.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Progress indicator */}
      <div className="mt-6">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(completedSteps?.length / actionSteps?.length) * 100}%` 
            }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-gray-400">
          Progression: {Math.round((completedSteps?.length / actionSteps?.length) * 100)}%
        </div>
      </div>
    </div>
  );
}