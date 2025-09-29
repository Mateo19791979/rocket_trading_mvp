import React, { useState } from 'react';
import { Database, Copy, CheckCircle, X, FileText } from 'lucide-react';
import Button from './Button';

const SupabaseNotification = ({ 
  onClose = () => {},
  onViewScript = () => {},
  onCopyScript = () => {},
  scriptName = "001_add_enum_volatility_correlation.sql",
  isVisible = true 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    try {
      // Copier le nom du script dans le presse-papier
      await navigator.clipboard?.writeText(scriptName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyScript?.();
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now?.toLocaleDateString('fr-FR', options);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="bg-gradient-to-r from-green-900/90 to-emerald-900/90 backdrop-blur-sm border border-green-600/30 rounded-xl shadow-2xl p-6 w-80 animate-slide-in-right">
        {/* Header avec timestamp */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-green-300/70 font-mono">
            {getCurrentDateTime()}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-6 h-6 text-green-300 hover:bg-green-800/30"
          >
            <X size={14} />
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-800/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-green-100 font-semibold text-sm">
                Votre schéma de projet est prêt à être envoyé vers Supabase
              </h3>
            </div>
          </div>
        </div>

        {/* Section Supabase */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-green-100 font-medium text-sm">Supabase</span>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Button
              onClick={onViewScript}
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-green-800/20 border-green-600/30 text-green-200 hover:bg-green-800/40"
            >
              <FileText className="w-3 h-3 mr-1" />
              Afficher
            </Button>
            <Button
              onClick={handleCopyScript}
              variant="outline"
              size="sm"
              className="flex-1 text-xs bg-green-800/20 border-green-600/30 text-green-200 hover:bg-green-800/40"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? 'Copié' : 'Copier le script'}
            </Button>
          </div>
        </div>

        {/* Nom du script */}
        <div className="bg-black/20 rounded-lg p-3 border border-green-600/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-green-400" />
              <span className="text-green-200 text-xs font-mono">
                {scriptName}
              </span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center">
          <p className="text-green-300/60 text-xs">
            Script de migration prêt pour déploiement
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseNotification;