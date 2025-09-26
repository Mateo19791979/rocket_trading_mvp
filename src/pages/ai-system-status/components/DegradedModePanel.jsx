import React from 'react';
import { AlertTriangle, Shield, Settings } from 'lucide-react';

const DegradedModePanel = () => {
  return (
    <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-300 mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Système en Mode Dégradé
          </h3>
          <p className="text-yellow-200 text-sm mb-3">
            Tous les agents sont actuellement suspendus ou inactifs. Le système fonctionne en mode sécurisé hors ligne.
          </p>
          
          <div className="bg-yellow-700/30 rounded-lg p-3 mb-3">
            <h4 className="text-yellow-200 font-medium text-sm mb-2">Fonctionnalités actives en mode dégradé:</h4>
            <ul className="text-yellow-200 text-xs space-y-1">
              <li>• Surveillance des agents existants</li>
              <li>• Consultation des données historiques</li>
              <li>• Contrôles d'urgence</li>
              <li>• Export des rapports</li>
            </ul>
          </div>
          
          <div className="bg-yellow-800/30 rounded-lg p-3">
            <h4 className="text-yellow-200 font-medium text-sm mb-2">Fonctionnalités désactivées:</h4>
            <ul className="text-yellow-300 text-xs space-y-1">
              <li>• Exécution de nouvelles transactions</li>
              <li>• Mises à jour en temps réel</li>
              <li>• Signaux de trading automatiques</li>
              <li>• Modifications de portefeuille</li>
            </ul>
          </div>
          
          <div className="mt-3 flex items-center space-x-2 text-yellow-200 text-xs">
            <Settings className="w-3 h-3" />
            <span>Une intervention manuelle est requise pour réactiver le système</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DegradedModePanel;