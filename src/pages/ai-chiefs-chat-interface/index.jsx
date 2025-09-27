import React, { useState } from 'react';
import { Shield, Activity, Rocket, LogIn } from 'lucide-react';
import ChiefPersonasPanel from './components/ChiefPersonasPanel';
import AuthorizedToolsPanel from './components/AuthorizedToolsPanel';
import SecurityLoggingPanel from './components/SecurityLoggingPanel';
import DeploymentPanel from './components/DeploymentPanel';
import ChatInterfacePanel from './components/ChatInterfacePanel';
import { useAuth } from '../../contexts/AuthContext';

const AiChiefsChatInterface = () => {
  const [activeChat, setActiveChat] = useState(null);
  const { user, signInAsDemo, loading: authLoading } = useAuth();

  const handleStartChat = (chiefRole) => {
    setActiveChat(chiefRole);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleDemoLogin = async () => {
    const { error } = await signInAsDemo();
    if (error) {
      console.error('Demo login failed:', error);
      // Handle error - could show a toast or error message
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Chat Chefs d'IA
              </h1>
              <p className="text-lg text-gray-300">
                Parler à l'Orchestrateur, au Risque, à la Recherche, à l'Exécution et aux Données
              </p>
              <div className="text-sm text-gray-400 mt-1">
                {new Date()?.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            {/* Authentication Status */}
            <div className="flex items-center space-x-4">
              {authLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                  <span className="text-gray-300 text-sm">Chargement...</span>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 text-sm">
                    Connecté: {user?.user_metadata?.full_name || user?.email}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleDemoLogin}
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Demo Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            <ChiefPersonasPanel 
              onStartChat={handleStartChat}
              onChiefSelect={handleStartChat}
              selectedChief={activeChat}
            />
            <AuthorizedToolsPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SecurityLoggingPanel />
            <DeploymentPanel />
          </div>
        </div>

        {/* Chat Interface Overlay */}
        {activeChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <ChatInterfacePanel
                chiefRole={activeChat}
                onClose={handleCloseChat}
              />
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="mt-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Système opérationnel</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span className="text-gray-300">5 chefs disponibles</span>
              </div>

              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Mode sécurisé</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Rocket className="w-4 h-4 text-orange-400" />
              <span className="text-gray-300">Trading MVP v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChiefsChatInterface;