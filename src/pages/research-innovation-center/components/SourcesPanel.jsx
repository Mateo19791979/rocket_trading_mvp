import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Globe, 
  Cloud, 
  Newspaper,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { researchInnovationService } from '../../../services/researchInnovationService';

const SourcesPanel = () => {
  const [apiConfigs, setApiConfigs] = useState([]);
  const [marketSources, setMarketSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [configs, sources] = await Promise.all([
          researchInnovationService?.getExternalAPIConfigs(),
          researchInnovationService?.getMarketDataSources()
        ]);
        
        setApiConfigs(configs);
        setMarketSources(sources);
      } catch (err) {
        setError(err?.message || 'Erreur de chargement des sources');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSourceIcon = (apiName) => {
    const name = apiName?.toLowerCase() || '';
    if (name?.includes('arxiv') || name?.includes('ssrn')) return FileText;
    if (name?.includes('news') || name?.includes('sentiment')) return Newspaper;
    if (name?.includes('weather') || name?.includes('shipping')) return Cloud;
    return Globe;
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-400">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scientific Sources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-cyan-400" />
          <span className="font-medium text-gray-200">arXiv, SSRN, news scientifiques</span>
        </div>
        <div className="space-y-3">
          {apiConfigs
            ?.filter(config => 
              config?.api_name?.toLowerCase()?.includes('arxiv') || 
              config?.api_name?.toLowerCase()?.includes('ssrn') ||
              config?.api_name?.toLowerCase()?.includes('news')
            )
            ?.slice(0, 3)
            ?.map((config, index) => {
              const SourceIcon = getSourceIcon(config?.api_name);
              return (
                <motion.div
                  key={config?.id || index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <SourceIcon className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300 capitalize">
                      {config?.api_name?.replace(/_/g, ' ') || 'Source inconnue'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">
                      {config?.total_calls_today || 0} appels/jour
                    </span>
                  </div>
                </motion.div>
              );
            })}
          
          {/* Fallback if no scientific sources */}
          {(!apiConfigs?.length || 
            !apiConfigs?.some(config => 
              config?.api_name?.toLowerCase()?.includes('arxiv') || 
              config?.api_name?.toLowerCase()?.includes('ssrn')
            )) && (
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-gray-300">Sources scientifiques</span>
              </div>
              <span className="text-xs text-orange-400">Configuration en cours</span>
            </motion.div>
          )}
        </div>
      </div>
      {/* Alternative Data Sources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="h-5 w-5 text-blue-400" />
          <span className="font-medium text-gray-200">Données alternatives (météo, shipping, réseaux sociaux)</span>
        </div>
        <div className="space-y-3">
          {marketSources
            ?.slice(0, 3)
            ?.map((source, index) => (
              <motion.div
                key={`${source?.data_source}-${source?.api_provider}-${index}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Cloud className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    {source?.api_provider || source?.data_source || 'Source alternative'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-400" />
                  <span className="text-xs text-teal-400">
                    {source?.count || 0} points de données
                  </span>
                </div>
              </motion.div>
            ))}
          
          {/* Fallback alternative sources */}
          {(!marketSources?.length) && (
            <>
              {['Météo Global', 'Routes Shipping', 'Sentiment Social']?.map((name, index) => (
                <motion.div
                  key={name}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Cloud className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">{name}</span>
                  </div>
                  <span className="text-xs text-orange-400">Intégration prévue</span>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
      {/* Data Quality Indicators */}
      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-medium text-gray-200">Qualité des données</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Fraîcheur</div>
              <div className="text-sm font-medium text-green-400">98%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Couverture</div>
              <div className="text-sm font-medium text-cyan-400">95%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourcesPanel;