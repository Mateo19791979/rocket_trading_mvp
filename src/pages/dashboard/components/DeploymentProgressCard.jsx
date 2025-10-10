import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Shield,
  Database,
  Layers
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import deploymentProgressService from '../../../services/deploymentProgressService';

const DeploymentProgressCard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Category icons mapping
  const categoryIcons = {
    infrastructure: Layers,
    aiSystems: Zap,
    security: Shield,
    mvpComponents: TrendingUp,
    database: Database,
    integration: ArrowRight
  };

  // Category colors
  const categoryColors = {
    infrastructure: 'from-blue-500 to-blue-600',
    aiSystems: 'from-purple-500 to-purple-600',
    security: 'from-green-500 to-green-600',
    mvpComponents: 'from-orange-500 to-orange-600',
    database: 'from-indigo-500 to-indigo-600',
    integration: 'from-teal-500 to-teal-600'
  };

  // Load deployment progress
  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: progressError } = await deploymentProgressService?.getComprehensiveProgress(user?.id);
      
      if (progressError) throw new Error(progressError);
      
      setProgressData(data);
      setError(null);
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user?.id]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded-lg w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded-lg w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded-lg w-1/2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card border border-error/30 rounded-2xl p-6 shadow-trading">
        <div className="flex items-center space-x-3 text-error">
          <AlertCircle size={24} />
          <div>
            <h3 className="text-lg font-semibold font-heading">Erreur de Chargement</h3>
            <p className="text-sm font-body">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallProgress, categories, deploymentReadiness, nextSteps } = progressData || {};

  return (
    <div className="bg-card border border-border rounded-2xl shadow-trading overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground font-heading mb-2">
              🚀 Progression Déploiement MVP
            </h2>
            <p className="text-muted-foreground font-body">
              État du déploiement Rocket Trading en temps réel
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary font-data">
              {overallProgress || 0}%
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
              deploymentReadiness?.color === 'success' ? 'bg-success/20 text-success' :
              deploymentReadiness?.color === 'warning' ? 'bg-warning/20 text-warning' :
              deploymentReadiness?.color === 'info' ? 'bg-info/20 text-info' : 'bg-primary/20 text-primary'
            }`}>
              {deploymentReadiness?.level}
            </div>
          </div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground font-body">
            Progression Globale
          </span>
          <span className="text-sm font-bold text-foreground font-data">
            {overallProgress}% complété
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          >
            <div className="h-full bg-gradient-to-r from-transparent to-white/20"></div>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground font-body">
          {deploymentReadiness?.description}
        </div>
      </div>
      {/* Categories Overview */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories && Object.entries(categories)?.map(([key, category]) => {
            const IconComponent = categoryIcons?.[key];
            const gradientColor = categoryColors?.[key];
            
            return (
              <div key={key} className="relative group">
                <div className="bg-muted/50 border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor} text-white`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground font-heading capitalize">
                        {key === 'aiSystems' ? 'IA Systems' : 
                         key === 'mvpComponents' ? 'MVP' :
                         key}
                      </div>
                      <div className="text-xl font-bold text-primary font-data">
                        {category?.progress || 0}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-full bg-gradient-to-r ${gradientColor} rounded-full transition-all duration-500`}
                        style={{ width: `${category?.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground font-body">
                      {category?.completedItems || 0}/{category?.totalItems || 0} éléments
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Expandable Details */}
      {expanded && categories && (
        <div className="border-t border-border bg-muted/20">
          <div className="p-6 space-y-6">
            {Object.entries(categories)?.map(([key, category]) => {
              const IconComponent = categoryIcons?.[key];
              const gradientColor = categoryColors?.[key];
              
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradientColor} text-white`}>
                      <IconComponent size={18} />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground font-heading capitalize">
                      {key === 'aiSystems' ? 'Systèmes IA' : 
                       key === 'mvpComponents' ? 'Composants MVP' :
                       key === 'infrastructure' ? 'Infrastructure' :
                       key === 'security' ? 'Sécurité' :
                       key === 'database' ? 'Base de Données' :
                       key === 'integration' ? 'Intégrations' : key}
                    </h4>
                    <span className="text-sm font-bold text-primary font-data">
                      {category?.progress}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-8">
                    {category?.details?.map((detail, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {detail?.status === 'completed' ? (
                          <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                        ) : (
                          <Clock size={16} className="text-warning flex-shrink-0" />
                        )}
                        <span className={`font-body ${
                          detail?.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {detail?.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Next Steps */}
      {nextSteps?.length > 0 && (
        <div className="border-t border-border p-6 bg-muted/10">
          <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
            🎯 Prochaines Étapes
          </h3>
          <div className="space-y-2">
            {nextSteps?.slice(0, 3)?.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold font-data">{index + 1}</span>
                </div>
                <span className="text-sm text-foreground font-body">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Toggle Details Button */}
      <div className="border-t border-border p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary/10 
                     hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200 font-body"
        >
          <span className="text-sm font-medium">
            {expanded ? 'Masquer les détails' : 'Voir les détails'}
          </span>
          <ArrowRight 
            size={16} 
            className={`transform transition-transform duration-200 ${
              expanded ? 'rotate-90' : 'rotate-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default DeploymentProgressCard;