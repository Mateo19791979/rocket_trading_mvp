import React, { useState } from 'react';
import { Settings, CheckCircle, ArrowRight, Code, TestTube, FileText } from 'lucide-react';

const QuickIntegrationPanel = () => {
  const [completedSteps, setCompletedSteps] = useState([]);

  const integrationSteps = [
    {
      id: 1,
      title: 'Dans Rocket, ajouter sections "HTML/Embed"',
      description: 'Créer des sections HTML personnalisées dans votre interface Rocket.new',
      icon: Code,
      color: 'teal',
      details: 'Accéder aux paramètres de page → Ajouter élément → HTML/Embed'
    },
    {
      id: 2,
      title: 'Coller code widget (fetch + render JSON)',
      description: 'Intégrer le code JavaScript pour récupérer et afficher les données',
      icon: Settings,
      color: 'orange',
      details: 'Copier le code widget depuis le panel "Widgets recommandés"'
    },
    {
      id: 3,
      title: 'Tester avec endpoints en HTTPS (CORS OK)',
      description: 'Vérifier la connectivité et la sécurité des appels API',
      icon: TestTube,
      color: 'teal',
      details: 'Utiliser les boutons de test dans "Endpoints à pointer"'
    },
    {
      id: 4,
      title: 'Ajouter bouton Export PDF si besoin',
      description: 'Option pour générer des rapports PDF des données',
      icon: FileText,
      color: 'orange',
      details: 'Fonctionnalité optionnelle pour les rapports client'
    }
  ];

  const toggleStep = (stepId) => {
    setCompletedSteps(prev => 
      prev?.includes(stepId) 
        ? prev?.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getStepStatus = (stepId) => {
    return completedSteps?.includes(stepId);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-teal-500 rounded-lg mr-4">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">⚙️ Intégration rapide</h3>
      </div>
      <div className="space-y-4">
        {integrationSteps?.map((step, index) => {
          const IconComponent = step?.icon;
          const isCompleted = getStepStatus(step?.id);
          const isLast = index === integrationSteps?.length - 1;
          
          return (
            <div key={step?.id} className="relative">
              <div className={`p-4 rounded-lg border transition-all cursor-pointer ${
                isCompleted 
                  ? 'bg-teal-500/20 border-teal-400/50' 
                  : step?.color === 'teal' ?'bg-teal-500/10 border-teal-400/30 hover:bg-teal-500/20' :'bg-orange-500/10 border-orange-400/30 hover:bg-orange-500/20'
              }`}
              onClick={() => toggleStep(step?.id)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                      isCompleted 
                        ? 'bg-teal-500' 
                        : step?.color === 'teal' ?'bg-teal-500/50' :'bg-orange-500/50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{step?.id}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {step?.id}) {step?.title}
                      </h4>
                      <p className="text-sm text-gray-300">{step?.description}</p>
                    </div>
                  </div>
                  
                  <IconComponent className="w-5 h-5 text-white flex-shrink-0" />
                </div>
                
                <div className="mt-3 p-3 bg-black/20 rounded-lg">
                  <p className="text-xs text-gray-300">{step?.details}</p>
                </div>
              </div>
              {!isLast && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-orange-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Progress Indicator */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Progression</span>
          <span className="text-teal-300 font-semibold">
            {completedSteps?.length}/{integrationSteps?.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-teal-500 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(completedSteps?.length / integrationSteps?.length) * 100}%` 
            }}
          ></div>
        </div>
        
        <p className="text-xs text-gray-400 mt-2">
          Cliquez sur les étapes pour marquer comme complétées
        </p>
      </div>
    </div>
  );
};

export default QuickIntegrationPanel;