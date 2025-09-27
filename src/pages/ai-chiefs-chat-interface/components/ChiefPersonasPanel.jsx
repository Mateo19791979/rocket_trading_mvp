import React, { useState, useEffect } from 'react';
import { Users, Target, Shield, Search, Zap, BarChart3, MessageCircle, Activity } from 'lucide-react';
import { aiChiefsChatService } from '../../../services/aiChiefsChatService';

const ChiefPersonasPanel = ({ onChiefSelect, selectedChief }) => {
  const [chiefs, setChiefs] = useState([]);
  const [chiefStats, setChiefStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChiefData();
  }, []);

  const loadChiefData = () => {
    try {
      setLoading(true);
      
      // Get chief roles from service
      const chiefRoles = aiChiefsChatService?.chiefRoles;
      const chiefList = Object.entries(chiefRoles)?.map(([key, info]) => ({
        id: key,
        ...info,
        status: 'active', // Mock status
        availability: Math.random() > 0.2 ? 'available' : 'busy' // Random availability
      }));

      setChiefs(chiefList);
      
      // Mock statistics for each chief
      const stats = {};
      chiefList?.forEach(chief => {
        stats[chief.id] = {
          conversations: Math.floor(Math.random() * 50) + 10,
          avgResponseTime: Math.floor(Math.random() * 5) + 1,
          successRate: Math.floor(Math.random() * 20) + 80
        };
      });
      setChiefStats(stats);
      
    } catch (error) {
      console.error('Error loading chief data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChiefIcon = (chiefId) => {
    const icons = {
      orchestrateur: Target,
      risque: Shield,
      recherche: Search,
      execution: Zap,
      donnees: BarChart3
    };
    return icons?.[chiefId] || Users;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-400' : 'text-red-400';
  };

  const getAvailabilityColor = (availability) => {
    return availability === 'available' ? 'bg-green-500' : 'bg-yellow-500';
  };

  const handleChiefClick = (chiefId) => {
    if (onChiefSelect) {
      onChiefSelect(chiefId);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Rôles (personas)
        </h2>
        <div className="text-gray-300">Chargement des chefs d'IA...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        Rôles (personas)
      </h2>
      <div className="space-y-3">
        {chiefs?.map((chief) => {
          const ChiefIcon = getChiefIcon(chief?.id);
          const stats = chiefStats?.[chief?.id] || {};
          
          return (
            <div
              key={chief?.id}
              onClick={() => handleChiefClick(chief?.id)}
              className={`
                p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg
                ${selectedChief === chief?.id 
                  ? 'border-orange-400 bg-orange-900 bg-opacity-30' :'border-gray-600 hover:border-gray-500 bg-gray-700 bg-opacity-30'
                }
              `}
            >
              {/* Chief Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="text-2xl">{chief?.avatar}</div>
                    <div 
                      className={`
                        absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700
                        ${getAvailabilityColor(chief?.availability)}
                      `}
                    ></div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{chief?.name}</h3>
                      <Activity className={`w-4 h-4 ${getStatusColor(chief?.status)}`} />
                    </div>
                    <p className="text-sm text-gray-300">{chief?.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{chief?.specialization}</p>
                  </div>
                </div>
                
                <MessageCircle 
                  className={`w-5 h-5 transition-colors ${
                    selectedChief === chief?.id ? 'text-orange-400' : 'text-gray-400'
                  }`}
                />
              </div>
              {/* Chief Statistics */}
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-600">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Conversations</div>
                  <div className="text-sm font-semibold text-white">{stats?.conversations || 0}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Temps moy.</div>
                  <div className="text-sm font-semibold text-white">{stats?.avgResponseTime || 0}s</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Succès</div>
                  <div className="text-sm font-semibold text-green-400">{stats?.successRate || 0}%</div>
                </div>
              </div>
              {/* Availability Status */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {chief?.availability === 'available' ? 'Disponible maintenant' : 'Occupé - Réponse différée'}
                </span>
                {selectedChief === chief?.id && (
                  <span className="text-orange-400 font-medium">Sélectionné</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer Info */}
      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg">
        <p className="text-xs text-blue-200 leading-relaxed">
          🎯 <strong>Conseil :</strong> Chaque chef d'IA possède une spécialisation unique. 
          Sélectionnez le chef correspondant à votre besoin pour obtenir des réponses optimisées.
        </p>
      </div>
    </div>
  );
};

export default ChiefPersonasPanel;