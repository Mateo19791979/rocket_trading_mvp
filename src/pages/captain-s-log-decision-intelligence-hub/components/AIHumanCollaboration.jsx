import React, { useState } from 'react';
import { Users, MessageCircle, Zap, Brain, GitMerge, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Icon from '@/components/AppIcon';


const AIHumanCollaboration = ({ entries, onAddEntry }) => {
  const [collaborationMode, setCollaborationMode] = useState('real_time');
  const [conflictResolution, setConflictResolution] = useState(null);

  // Analyze collaboration patterns
  const getCollaborationStats = () => {
    const humanEntries = entries?.filter(e => e?.author === 'Matthieu') || [];
    const aiEntries = entries?.filter(e => e?.author !== 'Matthieu') || [];
    
    return {
      humanCount: humanEntries?.length,
      aiCount: aiEntries?.length,
      totalEntries: entries?.length || 0,
      collaborationRatio: entries?.length ? (Math.min(humanEntries?.length, aiEntries?.length) / Math.max(humanEntries?.length, aiEntries?.length, 1)) * 100 : 0
    };
  };

  // Detect potential conflicts
  const detectConflicts = () => {
    const conflicts = [];
    const recentEntries = entries?.slice(0, 10) || [];
    
    // Simple conflict detection based on opposing tags
    const opposingTags = [
      ['freeze', 'unfreeze'],
      ['safe_mode', 'live_mode'],
      ['manual', 'automated'],
      ['caution', 'aggressive']
    ];

    recentEntries?.forEach((entry, index) => {
      const laterEntries = recentEntries?.slice(0, index);
      
      laterEntries?.forEach(laterEntry => {
        if (entry?.author !== laterEntry?.author) {
          opposingTags?.forEach(([tag1, tag2]) => {
            if (entry?.tags?.includes(tag1) && laterEntry?.tags?.includes(tag2)) {
              conflicts?.push({
                id: `${entry?.id}-${laterEntry?.id}`,
                entry1: entry,
                entry2: laterEntry,
                type: 'opposing_decision',
                description: `Décision opposée: ${tag1} vs ${tag2}`
              });
            }
          });
        }
      });
    });

    return conflicts?.slice(0, 3); // Limit to 3 most recent conflicts
  };

  const stats = getCollaborationStats();
  const conflicts = detectConflicts();

  const collaborationModes = [
    {
      id: 'real_time',
      name: 'Synchronisation Temps Réel',
      description: 'Décisions partagées instantanément',
      icon: Zap,
      active: true
    },
    {
      id: 'consensus',
      name: 'Mode Consensus',
      description: 'Validation croisée requise',
      icon: GitMerge,
      active: false
    },
    {
      id: 'autonomous',
      name: 'Autonomie Surveillée',
      description: 'IA autonome avec supervision',
      icon: Brain,
      active: true
    }
  ];

  const handleConflictResolution = (conflict, resolution) => {
    setConflictResolution({ conflict, resolution });
    
    // Log resolution decision
    onAddEntry(
      `Résolution de conflit: ${resolution}. Contexte: ${conflict?.description}`,
      'Matthieu',
      ['conflict_resolution', 'collaboration']
    );
  };

  const recentCollaborations = entries?.slice(0, 6)?.filter((entry, index) => {
    const nextEntry = entries?.[index + 1];
    return nextEntry && entry?.author !== nextEntry?.author;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Collaboration Overview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Collaboration Dashboard</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {stats?.humanCount}
            </div>
            <div className="text-sm text-gray-400">Décisions Humaines</div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gold-400 mb-2">
              {stats?.aiCount}
            </div>
            <div className="text-sm text-gray-400">Décisions IA</div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {Math.round(stats?.collaborationRatio)}%
            </div>
            <div className="text-sm text-gray-400">Ratio Collaboration</div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              {conflicts?.length}
            </div>
            <div className="text-sm text-gray-400">Conflits Actifs</div>
          </div>
        </div>
      </div>
      {/* Collaboration Modes */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <GitMerge className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">Modes de Collaboration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collaborationModes?.map((mode) => {
            const Icon = mode?.icon;
            return (
              <div
                key={mode?.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  mode?.active 
                    ? 'border-green-400 bg-green-400/10' :'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setCollaborationMode(mode?.id)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className={`w-6 h-6 ${mode?.active ? 'text-green-400' : 'text-gray-400'}`} />
                  <span className={`font-bold ${mode?.active ? 'text-white' : 'text-gray-300'}`}>
                    {mode?.name}
                  </span>
                  {mode?.active && (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                  )}
                </div>
                <p className="text-sm text-gray-400">{mode?.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Conflict Resolution */}
      {conflicts?.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Résolution de Conflits</h2>
          </div>

          <div className="space-y-4">
            {conflicts?.map((conflict, index) => (
              <div
                key={conflict?.id}
                className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-400"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      Conflit Détecté #{index + 1}
                    </h3>
                    <p className="text-red-400 mb-3">{conflict?.description}</p>
                    
                    <div className="space-y-2">
                      <div className="bg-gray-600 rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-green-400 font-bold">{conflict?.entry1?.author}</span>
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {new Date(conflict.entry1?.ts)?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-200 text-sm">{conflict?.entry1?.entry}</p>
                      </div>
                      
                      <div className="bg-gray-600 rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-gold-400 font-bold">{conflict?.entry2?.author}</span>
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">
                            {new Date(conflict.entry2?.ts)?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-200 text-sm">{conflict?.entry2?.entry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConflictResolution(conflict, 'Prioriser décision humaine')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold transition-all"
                  >
                    Prioriser Humain
                  </button>
                  <button
                    onClick={() => handleConflictResolution(conflict, 'Prioriser décision IA')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold transition-all"
                  >
                    Prioriser IA
                  </button>
                  <button
                    onClick={() => handleConflictResolution(conflict, 'Consensus hybride requis')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold transition-all"
                  >
                    Consensus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Recent Collaborations */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MessageCircle className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold">Collaborations Récentes</h2>
        </div>

        <div className="space-y-4">
          {recentCollaborations?.length > 0 ? (
            recentCollaborations?.map((entry, index) => {
              const nextEntry = entries?.[entries?.indexOf(entry) + 1];
              return (
                <div
                  key={entry?.id || index}
                  className="bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-gold-400 rounded-full flex items-center justify-center">
                      <GitMerge className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-white">
                      Échange {entry?.author} → {nextEntry?.author}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(entry?.ts)?.toLocaleString()}
                    </span>
                  </div>
                  <div className="ml-12">
                    <p className="text-gray-200 text-sm mb-2">{entry?.entry}</p>
                    {entry?.tags?.length > 0 && (
                      <div className="flex space-x-2">
                        {entry?.tags?.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Aucune collaboration récente détectée.</p>
              <p className="text-sm">Les échanges entre IA et humains apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIHumanCollaboration;