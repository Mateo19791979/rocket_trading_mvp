import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StrategySuggestions = ({ onApplySuggestion }) => {
  const suggestions = [
    {
      id: 1,
      name: "Momentum Breakout",
      description: "Stratégie basée sur les cassures de résistances avec volume élevé",
      reason: "Marché haussier détecté sur SPY avec forte volatilité",
      confidence: 85,
      expectedReturn: 12.5,
      risk: "Moyen",
      timeframe: "Court terme (1-2 semaines)",
      icon: "TrendingUp",
      tags: ["Momentum", "Breakout", "Volume"]
    },
    {
      id: 2,
      name: "Mean Reversion",
      description: "Achat sur survente et vente sur surachat avec RSI",
      reason: "Volatilité élevée observée sur QQQ, opportunités de retour à la moyenne",
      confidence: 72,
      expectedReturn: 8.3,
      risk: "Faible",
      timeframe: "Moyen terme (2-4 semaines)",
      icon: "RotateCcw",
      tags: ["RSI", "Reversion", "Volatilité"]
    },
    {
      id: 3,
      name: "Sector Rotation",
      description: "Rotation sectorielle basée sur la force relative",
      reason: "Rotation du secteur tech vers les valeurs cycliques détectée",
      confidence: 68,
      expectedReturn: 15.2,
      risk: "Élevé",
      timeframe: "Long terme (1-3 mois)",
      icon: "RefreshCw",
      tags: ["Secteur", "Rotation", "Cyclique"]
    }
  ];

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-success bg-success/10 border-success/20';
    if (confidence >= 70) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-error bg-error/10 border-error/20';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Faible':
        return 'text-success bg-success/10 border-success/20';
      case 'Moyen':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'Élevé':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground font-heading">
            Suggestions de Stratégies
          </h3>
          <p className="text-sm text-muted-foreground font-body">
            Stratégies recommandées basées sur les conditions actuelles du marché
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-data">
          <Icon name="Clock" size={14} />
          <span>Mis à jour il y a 5 min</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {suggestions?.map((suggestion) => (
          <div
            key={suggestion?.id}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-trading"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <Icon name={suggestion?.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground font-heading">
                    {suggestion?.name}
                  </h4>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    getConfidenceColor(suggestion?.confidence)
                  }`}>
                    {suggestion?.confidence}% confiance
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground font-body mb-4 leading-relaxed">
              {suggestion?.description}
            </p>

            <div className="bg-muted/20 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <Icon name="Lightbulb" size={14} className="text-warning mt-0.5" />
                <p className="text-xs text-foreground font-body leading-relaxed">
                  {suggestion?.reason}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-body mb-1">
                  Rendement Attendu
                </div>
                <div className="text-lg font-semibold text-success font-data">
                  +{suggestion?.expectedReturn}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-body mb-1">
                  Niveau de Risque
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  getRiskColor(suggestion?.risk)
                }`}>
                  {suggestion?.risk}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-muted-foreground font-body mb-2">
                Horizon de temps
              </div>
              <div className="text-sm text-foreground font-data">
                {suggestion?.timeframe}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {suggestion?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                iconName="Eye"
                iconPosition="left"
              >
                Détails
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onApplySuggestion(suggestion)}
                iconName="Play"
                iconPosition="left"
              >
                Appliquer
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/20 border border-border rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground font-heading mb-2">
              À propos des suggestions
            </h4>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Les suggestions sont générées automatiquement en analysant les conditions actuelles du marché, 
              la volatilité, les tendances sectorielles et les indicateurs techniques. Elles sont mises à jour 
              toutes les 5 minutes pendant les heures de marché.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySuggestions;