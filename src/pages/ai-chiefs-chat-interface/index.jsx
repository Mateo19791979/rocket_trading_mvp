import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { aiChiefsChatService } from '../../services/aiChiefsChatService';

// Components
import ChiefPersonasPanel from './components/ChiefPersonasPanel';
import AuthorizedToolsPanel from './components/AuthorizedToolsPanel';
import SecurityLoggingPanel from './components/SecurityLoggingPanel';
import DeploymentPanel from './components/DeploymentPanel';
import ChatInterfacePanel from './components/ChatInterfacePanel';

const AIChiefsChatInterface = () => {
  const [selectedChief, setSelectedChief] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [availableTools, setAvailableTools] = useState([]);
  
  useEffect(() => {
    // Update date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    loadInitialData();

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load available tools
      const { data: tools, error } = await aiChiefsChatService?.getAvailableTools();
      if (!error && tools) {
        setAvailableTools(tools);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChiefSelection = (chiefRole) => {
    setSelectedChief(chiefRole);
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('fr-FR', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    }) || '';
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    }) || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement de l'interface des Chefs d'IA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="relative px-8 py-6">
        {/* Background image overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 rounded-lg"
          style={{
            backgroundImage: 'url(/assets/images/Plaquette_Chat_Chefs_IA-1759006667997.jpg)'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Date and time in top right */}
          <div className="absolute top-0 right-0 flex items-center space-x-4 text-sm text-blue-200">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(currentDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(currentDate)}</span>
            </div>
          </div>

          {/* Title and subtitle */}
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white mb-2">
              Chat Chefs d'IA
            </h1>
            <p className="text-xl text-blue-100">
              Parler à l'Orchestrateur, au Risque, à la Recherche, à l'Exécution et aux Données
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* AI Chief Personas */}
            <ChiefPersonasPanel 
              onChiefSelect={handleChiefSelection}
              selectedChief={selectedChief}
            />
            
            {/* Authorized Tools */}
            <AuthorizedToolsPanel tools={availableTools} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Security & Logging */}
            <SecurityLoggingPanel />
            
            {/* Deployment */}
            <DeploymentPanel />
          </div>
        </div>

        {/* Chat Interface (Full Width when active) */}
        {selectedChief && (
          <div className="mt-8">
            <ChatInterfacePanel 
              chiefRole={selectedChief}
              onClose={() => setSelectedChief(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChiefsChatInterface;