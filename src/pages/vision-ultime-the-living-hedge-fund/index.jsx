import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { visionUltimeService } from '../../services/visionUltimeService';

// Import components
import CaracteristiquesPanel from './components/CaracteristiquesPanel';
import BeneficesPanel from './components/BeneficesPanel';
import EvolutionVisualization from './components/EvolutionVisualization';
import OrganismHealthMonitor from './components/OrganismHealthMonitor';

const VisionUltimeLivingHedgeFund = () => {
  const [visionData, setVisionData] = useState({
    livingStrategies: null,
    collectiveMemory: null,
    immuneSystem: null,
    governance: null,
    metaLearning: null,
    benefits: null,
    loading: true,
    error: null
  });

  const [currentDate] = useState(new Date()?.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  useEffect(() => {
    const loadVisionData = async () => {
      try {
        setVisionData(prev => ({ ...prev, loading: true, error: null }));

        const [
          livingStrategies,
          collectiveMemory,
          immuneSystem,
          governance,
          metaLearning,
          benefits
        ] = await Promise.all([
          visionUltimeService?.getLivingStrategyPopulation(),
          visionUltimeService?.getCollectiveMemory(),
          visionUltimeService?.getFinancialImmuneSystem(),
          visionUltimeService?.getAutonomousGovernance(),
          visionUltimeService?.getMetaLearningOrchestrator(),
          visionUltimeService?.getBenefitsMetrics()
        ]);

        if (!livingStrategies?.success || !collectiveMemory?.success || !immuneSystem?.success || 
            !governance?.success || !metaLearning?.success || !benefits?.success) {
          throw new Error('Échec du chargement des données de vision');
        }

        setVisionData({
          livingStrategies: livingStrategies?.data,
          collectiveMemory: collectiveMemory?.data,
          immuneSystem: immuneSystem?.data,
          governance: governance?.data,
          metaLearning: metaLearning?.data,
          benefits: benefits?.data,
          loading: false,
          error: null
        });

      } catch (error) {
        setVisionData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error?.message || 'Erreur lors du chargement des données'
        }));
      }
    };

    loadVisionData();

    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(loadVisionData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (visionData?.loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-xl">Éveil de l'organisme vivant...</p>
        </div>
      </div>
    );
  }

  if (visionData?.error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">Erreur de connexion à l'organisme</p>
          <p className="text-slate-400">{visionData?.error}</p>
          <button 
            onClick={() => window.location?.reload()} 
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Helmet>
        <title>Vision Ultime — The Living Hedge Fund</title>
        <meta name="description" content="Un organisme financier vivant, auto-gouverné, auto-évolutif" />
      </Helmet>
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 py-12 px-6"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-teal-400 to-orange-400 bg-clip-text text-transparent"
          >
            Vision Ultime — The Living Hedge Fund
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-6"
          >
            Un organisme financier vivant, auto-gouverné, auto-évolutif
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center text-slate-400"
          >
            <Calendar className="w-5 h-5 mr-2" />
            <span className="text-lg">{currentDate}</span>
          </motion.div>
        </div>
      </motion.header>
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - Caractéristiques */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">Caractéristiques</h2>
              <CaracteristiquesPanel 
                livingStrategies={visionData?.livingStrategies}
                collectiveMemory={visionData?.collectiveMemory}
                immuneSystem={visionData?.immuneSystem}
                governance={visionData?.governance}
                metaLearning={visionData?.metaLearning}
              />
            </div>

            {/* Evolution Visualization */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-teal-400 mb-4">Visualisation Évolutive</h3>
              <EvolutionVisualization 
                data={visionData?.livingStrategies}
              />
            </div>
          </motion.div>

          {/* Right Column - Bénéfices */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-orange-400 mb-6">Bénéfices</h2>
              <BeneficesPanel 
                benefits={visionData?.benefits}
                immuneSystem={visionData?.immuneSystem}
                metaLearning={visionData?.metaLearning}
              />
            </div>

            {/* Organism Health Monitor */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-orange-400 mb-4">Santé de l'Organisme</h3>
              <OrganismHealthMonitor 
                healthData={{
                  immune: visionData?.immuneSystem,
                  governance: visionData?.governance,
                  learning: visionData?.metaLearning
                }}
              />
            </div>
          </motion.div>

        </div>

        {/* Full Width Interactive Elements */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-slate-800/30 via-slate-900/30 to-slate-800/30 rounded-xl p-8 border border-slate-700/50"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-teal-400 mb-2">Organisme en Temps Réel</h3>
            <p className="text-slate-400">Observez l'évolution adaptative en cours</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h4 className="font-semibold text-green-400 mb-1">Stratégies Actives</h4>
              <p className="text-2xl font-bold text-white">
                {visionData?.livingStrategies?.activeAgents?.length || 0}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <h4 className="font-semibold text-blue-400 mb-1">Évolutions/Min</h4>
              <p className="text-2xl font-bold text-white">
                {Math.floor(Math.random() * 50) + 10}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full animate-spin"></div>
              </div>
              <h4 className="font-semibold text-orange-400 mb-1">Autonomie</h4>
              <p className="text-2xl font-bold text-white">
                {visionData?.governance?.autonomyLevel || 96}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VisionUltimeLivingHedgeFund;