import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DegradedModeControl = () => {
  const [isDegradedMode, setIsDegradedMode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleDegradedMode = async () => {
    if (!isDegradedMode && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsDegradedMode(!isDegradedMode);
      setShowConfirmation(false);
      setIsLoading(false);
    }, 1500);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const degradedFeatures = [
    "Données de marché en temps réel désactivées",
    "Utilisation de données mises en cache",
    "Latence des ordres augmentée",
    "Fonctionnalités de graphiques limitées",
    "Notifications push désactivées"
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isDegradedMode ? 'bg-warning/10' : 'bg-muted/30'
        }`}>
          <Icon 
            name={isDegradedMode ? "AlertTriangle" : "Settings"} 
            size={20} 
            className={isDegradedMode ? "text-warning" : "text-muted-foreground"}
          />
        </div>
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Mode Dégradé
        </h2>
      </div>
      {/* Current Status */}
      <div className={`p-4 rounded-xl mb-6 ${
        isDegradedMode ? 'bg-warning/10 border border-warning/20' : 'bg-muted/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isDegradedMode ? 'bg-warning animate-pulse' : 'bg-success'
            }`}></div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {isDegradedMode ? 'Mode Dégradé Actif' : 'Mode Normal'}
              </div>
              <div className="text-xs text-muted-foreground">
                {isDegradedMode 
                  ? 'Fonctionnalités limitées pour assurer la stabilité' :'Toutes les fonctionnalités sont disponibles'
                }
              </div>
            </div>
          </div>
          <Button
            variant={isDegradedMode ? "destructive" : "outline"}
            size="sm"
            onClick={handleToggleDegradedMode}
            loading={isLoading}
            iconName={isDegradedMode ? "Power" : "AlertTriangle"}
            iconPosition="left"
          >
            {isDegradedMode ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">
                Confirmer l'activation du mode dégradé
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Cette action va limiter certaines fonctionnalités pour améliorer la stabilité du système.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="warning"
              size="sm"
              onClick={handleToggleDegradedMode}
              loading={isLoading}
            >
              Confirmer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
      {/* Impact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground font-heading">
          Impact du Mode Dégradé
        </h3>
        
        <div className="space-y-2">
          {degradedFeatures?.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/10">
              <Icon name="Minus" size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-accent/10 rounded-xl">
          <h4 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-accent" />
            <span>Avantages du Mode Dégradé</span>
          </h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Stabilité système améliorée</li>
            <li>• Réduction de la charge serveur</li>
            <li>• Fonctionnement même en cas de problème API</li>
            <li>• Préservation des fonctions essentielles</li>
          </ul>
        </div>

        {/* Auto-Recovery Info */}
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="RotateCcw" size={14} className="text-primary" />
            <span className="text-xs font-medium text-foreground">Récupération Automatique</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Le système tentera de revenir au mode normal automatiquement lorsque tous les services seront opérationnels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DegradedModeControl;