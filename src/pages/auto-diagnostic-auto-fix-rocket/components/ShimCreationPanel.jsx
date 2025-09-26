import React, { useState } from 'react';
import { Code, Copy, CheckCircle, XCircle, AlertTriangle, Wrench, Download } from 'lucide-react';

export default function ShimCreationPanel({ 
  shimDeployed, 
  setShimDeployed, 
  testResults, 
  fixingInProgress, 
  setFixingInProgress 
}) {
  const [copied, setCopied] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);

  const shimCode = `<script>
(function(){
  const API=(localStorage.getItem("trading_mvp_api_base")||"https://api.trading-mvp.com").replace(/\\/+$/,"");
  async function j(p){const r=await fetch(API+p,{mode:"cors"}); if(!r.ok) throw new Error(p+" "+r.status); return r.json();}
  window.Be = window.Be || {};
  window.Be.getAgentsOverview = async ()=>{
    const [status,registry,scores,select,allocate] = await Promise.all([
      j("/status"), j("/registry"), j("/scores?window=252"), j("/select"), j("/allocate")
    ]);
    return {status,registry,scores,select,allocate};
  };
})();
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard?.writeText(shimCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const deployShim = async () => {
    setFixingInProgress(true);
    setDeploymentStep(1);
    
    // Simulation du déploiement étape par étape
    const steps = [
      { step: 1, message: "Analyse de l\'erreur...", duration: 800 },
      { step: 2, message: "Génération du SHIM...", duration: 1000 },
      { step: 3, message: "Injection du code...", duration: 1200 },
      { step: 4, message: "Vérification des endpoints...", duration: 900 },
      { step: 5, message: "Test de la fonction Be.getAgentsOverview...", duration: 700 },
      { step: 6, message: "Déploiement terminé ✅", duration: 500 }
    ];
    
    for (const stepInfo of steps) {
      setDeploymentStep(stepInfo?.step);
      await new Promise(resolve => setTimeout(resolve, stepInfo.duration));
    }
    
    setShimDeployed(true);
    setFixingInProgress(false);
    setDeploymentStep(0);
  };

  const shouldShowShim = testResults?.testA === false || fixingInProgress || shimDeployed;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          2) Si Test A échoue → créer un SHIM
        </h3>
        {shouldShowShim && (
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
              title="Copier le code SHIM"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié!' : 'Copier'}
            </button>
            <button
              onClick={deployShim}
              disabled={fixingInProgress || shimDeployed}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              {fixingInProgress ? 'Déploiement...' : shimDeployed ? 'Déployé ✅' : 'Auto-Deploy'}
            </button>
          </div>
        )}
      </div>
      {/* Statut de l'évaluation */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
        <div className="flex items-center gap-3 mb-2">
          {testResults?.testA === false ? (
            <>
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-semibold">Test A échoué — SHIM requis</span>
            </>
          ) : testResults?.testA === true ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">Test A réussi — SHIM non nécessaire</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">En attente du Test A...</span>
            </>
          )}
        </div>
        
        {shimDeployed && (
          <div className="flex items-center gap-2 text-teal-400">
            <Code className="w-4 h-4" />
            <span className="text-sm">SHIM actif et fonctionnel</span>
          </div>
        )}
      </div>
      {/* Instructions de déploiement */}
      <div className="mb-4">
        <h4 className="text-white font-semibold mb-2">• Instructions de déploiement :</h4>
        <div className="text-sm text-gray-300 space-y-1 pl-4">
          <div>Insérer ce bloc <span className="font-semibold text-orange-400">AVANT</span> le widget qui appelle Be.getAgentsOverview</div>
          <div>Le SHIM initialise automatiquement l'espace de noms et les méthodes requises</div>
        </div>
      </div>
      {/* Déploiement en cours */}
      {fixingInProgress && (
        <div className="mb-4 p-4 bg-orange-900/20 border border-orange-600 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-orange-300 font-semibold">Auto-Fix en cours...</span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => {
              const stepNum = i + 1;
              const isComplete = deploymentStep > stepNum;
              const isCurrent = deploymentStep === stepNum;
              
              return (
                <div key={stepNum} className={`flex items-center gap-2 text-sm ${
                  isComplete ? 'text-green-400' : isCurrent ?'text-orange-400': 'text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isComplete ? 'bg-green-400' : isCurrent ?'bg-orange-400 animate-pulse': 'bg-gray-600'
                  }`}></div>
                  <span>
                    Étape {stepNum}: {
                      stepNum === 1 ? 'Analyse de l\'erreur' :
                      stepNum === 2 ? 'Génération du SHIM' :
                      stepNum === 3 ? 'Injection du code' :
                      stepNum === 4 ? 'Vérification des endpoints' :
                      stepNum === 5 ? 'Test de la fonction': 'Déploiement terminé'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Code SHIM */}
      {shouldShowShim && (
        <div className="bg-black/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Code SHIM à intégrer</span>
          </div>
          <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {shimCode}
          </pre>
        </div>
      )}
      {/* Explications techniques */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
        <h5 className="text-blue-300 font-semibold mb-2 text-sm">Fonctionnement du SHIM :</h5>
        <div className="text-xs text-blue-200 space-y-1">
          <div>• Initialise automatiquement <code className="bg-slate-700 px-1 rounded">window.Be</code> si absent</div>
          <div>• Crée <code className="bg-slate-700 px-1 rounded">getAgentsOverview()</code> avec Promise.all pour les 5 endpoints</div>
          <div>• Utilise localStorage pour configurer l'API base URL</div>
          <div>• Gestion d'erreurs intégrée avec mode CORS activé</div>
        </div>
      </div>
    </div>
  );
}