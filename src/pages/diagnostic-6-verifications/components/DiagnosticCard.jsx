import React from 'react';

const DiagnosticCard = ({ verification, onRetry }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'loading': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const interpretResult = (verification) => {
    if (!verification?.result) return null;

    const { id, result } = verification;
    
    try {
      let interpretation = '';
      
      if (id === 'v1' || id === 'v2') {
        // Vérifications de type de table
        if (Array.isArray(result) && result?.length > 0) {
          const tableType = result?.[0]?.table_type;
          interpretation = `${tableType === 'VIEW' ? '🔍 VUE' : '📋 TABLE'} - Type: ${tableType}`;
        } else {
          interpretation = '❌ Table/Vue introuvable';
        }
      } else if (id === 'v3' || id === 'v4') {
        // Vérifications de colonnes
        if (Array.isArray(result) && result?.length > 0) {
          const col = result?.[0];
          interpretation = `✅ Colonne trouvée - Type: ${col?.data_type}, Nullable: ${col?.is_nullable}`;
        } else {
          interpretation = '❌ Colonne manquante - Cause des erreurs 42703';
        }
      } else if (id === 'v5') {
        // Cache marché
        if (Array.isArray(result) && result?.length > 0) {
          const cache = result?.[0];
          interpretation = `📊 ${cache?.rows} lignes, ${cache?.unique_symbols} symboles uniques`;
        } else {
          interpretation = '📭 Cache vide';
        }
      } else if (id === 'v6') {
        // Santé IBKR
        if (Array.isArray(result) && result?.length > 0) {
          interpretation = `🔌 ${result?.[0]?.ibkr_health_status}`;
        } else {
          interpretation = '🔌 État IBKR indéterminé';
        }
      }
      
      return interpretation;
    } catch (error) {
      return '⚠️ Erreur d\'interprétation';
    }
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {getStatusIcon(verification?.status)}
        </span>
        <div className="flex-1">
          <h3 className={`font-semibold ${getStatusColor(verification?.status)}`}>
            {verification?.description}
          </h3>
          
          {verification?.result && (
            <div className="mt-3 space-y-2">
              {/* Interprétation lisible */}
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <strong className="text-blue-700">Analyse:</strong>
                <div className="mt-1 text-blue-600">
                  {interpretResult(verification)}
                </div>
              </div>
              
              {/* Données brutes */}
              <details className="bg-white border rounded">
                <summary className="p-2 cursor-pointer text-sm text-gray-600 hover:bg-gray-50">
                  📋 Données brutes (cliquer pour développer)
                </summary>
                <div className="p-3 border-t text-xs">
                  <pre className="overflow-auto max-h-32">
                    {typeof verification?.result === 'string' 
                      ? verification?.result 
                      : JSON.stringify(verification?.result, null, 2)
                    }
                  </pre>
                </div>
              </details>
            </div>
          )}

          {verification?.error && (
            <div className="mt-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <strong className="text-red-700">Erreur:</strong>
                <div className="mt-1 text-red-600 font-mono text-xs">
                  {verification?.result}
                </div>
                {onRetry && (
                  <button 
                    onClick={() => onRetry(verification?.id)}
                    className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                  >
                    🔄 Réessayer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticCard;