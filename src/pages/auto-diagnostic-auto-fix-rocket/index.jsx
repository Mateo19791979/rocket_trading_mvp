import React, { useState, useEffect } from 'react';
import { Play, Code, Settings } from 'lucide-react';

// Composants spécialisés pour l'auto-diagnostic
import AutomatedTestsPanel from './components/AutomatedTestsPanel';
import ShimCreationPanel from './components/ShimCreationPanel';  
import TransformationsPanel from './components/TransformationsPanel';
import FinalVerificationPanel from './components/FinalVerificationPanel';

export default function AutoDiagnosticAutoFixRocket() {
  const [testResults, setTestResults] = useState({
    testA: null,
    testB: null,
    testC: null
  });
  
  const [shimDeployed, setShimDeployed] = useState(false);
  const [fixingInProgress, setFixingInProgress] = useState(false);
  const [autoFixComplete, setAutoFixComplete] = useState(false);

  // Auto-génération de la date du jour
  const getCurrentDate = () => {
    const now = new Date();
    const day = now?.getDate()?.toString()?.padStart(2, '0');
    const month = now?.toLocaleString('fr-FR', { month: 'short' });
    const year = now?.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // État pour le suivi des diagnostics
  const [diagnosticState, setDiagnosticState] = useState({
    beObjectPresent: false,
    beMethodPresent: false,
    apiEndpointsOk: false,
    corsHttpsOk: false,
    shimRequired: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Image de référence utilisée directement */}
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/assets/images/Plaquette_AutoDiag_AutoFix_BeOverview-1758917685460.jpg" 
          alt="Auto-Diagnostic Reference"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 p-6">
        {/* En-tête principal */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Auto-Diagnostic & Auto-Fix (Rocket)
              </h1>
              <p className="text-xl text-gray-300">
                Be.getAgentsOverview n'est pas une fonction — tests & corrections automatiques
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-400">
                {getCurrentDate()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Diagnostic en temps réel</span>
              </div>
            </div>
          </div>

          {/* Barre de statut globale */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${
                    autoFixComplete ? 'bg-green-400' : fixingInProgress ?'bg-yellow-400 animate-pulse': 'bg-red-400'
                  }`}></div>
                  <span className="text-white font-semibold">
                    {autoFixComplete ? 'Corrections appliquées' : fixingInProgress ?'Correction en cours...': 'Diagnostic requis'}
                  </span>
                </div>
                
                {shimDeployed && (
                  <div className="flex items-center gap-2 text-teal-400">
                    <Code className="w-4 h-4" />
                    <span className="text-sm">SHIM déployé</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  onClick={() => setFixingInProgress(true)}
                >
                  <Play className="w-4 h-4" />
                  Lancer diagnostic
                </button>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Settings className="w-4 h-4" />
                  Configuration
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout principal en 2 colonnes */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Colonne gauche */}
          <div className="space-y-6">
            
            {/* Panel 1: Tests automatiques */}
            <AutomatedTestsPanel 
              testResults={testResults}
              setTestResults={setTestResults}
              diagnosticState={diagnosticState}
              setDiagnosticState={setDiagnosticState}
            />

            {/* Panel 2: SHIM Creation */}
            <ShimCreationPanel 
              shimDeployed={shimDeployed}
              setShimDeployed={setShimDeployed}
              testResults={testResults}
              fixingInProgress={fixingInProgress}
              setFixingInProgress={setFixingInProgress}
            />

          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            
            {/* Panel 3: Transformations */}
            <TransformationsPanel 
              diagnosticState={diagnosticState}
            />

            {/* Panel 4: Vérifications finales */}
            <FinalVerificationPanel 
              testResults={testResults}
              shimDeployed={shimDeployed}
              autoFixComplete={autoFixComplete}
              setAutoFixComplete={setAutoFixComplete}
            />

          </div>
        </div>

        {/* Footer avec indicateurs de santé */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400 mb-1">
                  {Object.values(testResults)?.filter(r => r === true)?.length}/3
                </div>
                <div className="text-sm text-gray-400">Tests réussis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {shimDeployed ? '1' : '0'}/1
                </div>
                <div className="text-sm text-gray-400">SHIM actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  5/5
                </div>
                <div className="text-sm text-gray-400">Endpoints API</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {autoFixComplete ? '100%' : '0%'}
                </div>
                <div className="text-sm text-gray-400">Correction auto</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}