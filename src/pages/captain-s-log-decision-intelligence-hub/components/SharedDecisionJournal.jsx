import React, { useState } from 'react';
import { User, Bot, Calendar, Tag, MessageSquare, Plus, Save } from 'lucide-react';

const SharedDecisionJournal = ({ entries, onAddEntry, stats }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry: '',
    author: 'Matthieu',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag?.trim() && !newEntry?.tags?.includes(newTag?.trim())) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev?.tags, newTag?.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev?.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!newEntry?.entry?.trim()) return;
    
    try {
      await onAddEntry(newEntry?.entry, newEntry?.author, newEntry?.tags);
      setNewEntry({ entry: '', author: 'Matthieu', tags: [] });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `il y a ${minutes}m`;
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${days}j`;
  };

  const getAuthorIcon = (author) => {
    return author === 'Matthieu' ? User : Bot;
  };

  const getAuthorColor = (author) => {
    return author === 'Matthieu' ? 'text-green-400' : 'text-gold-400';
  };

  const tagColors = [
    'bg-blue-400/20 text-blue-400',
    'bg-green-400/20 text-green-400',
    'bg-yellow-400/20 text-yellow-400',
    'bg-red-400/20 text-red-400',
    'bg-purple-400/20 text-purple-400'
  ];

  const getTagColor = (tag) => {
    const hash = tag?.split('')?.reduce((a, b) => {
      a = ((a << 5) - a) + b?.charCodeAt(0);
      return a & a;
    }, 0);
    return tagColors?.[Math.abs(hash) % tagColors?.length];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Decision Journal Entries */}
      <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Journal des Décisions Partagé</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle entrée</span>
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {entries?.map((entry, index) => {
            const AuthorIcon = getAuthorIcon(entry?.author);
            return (
              <div
                key={entry?.id || index}
                className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-400"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full bg-gray-600 ${getAuthorColor(entry?.author)}`}>
                    <AuthorIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`font-bold ${getAuthorColor(entry?.author)}`}>
                        {entry?.author}
                      </span>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatTimeAgo(entry?.ts)}
                      </div>
                    </div>
                    
                    <p className="text-gray-200 mb-3 leading-relaxed">
                      {entry?.entry}
                    </p>
                    
                    {entry?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry?.tags?.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-2 py-1 rounded text-xs font-medium ${getTagColor(tag)}`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {entries?.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <p>Aucune entrée dans le journal pour le moment.</p>
            <p className="text-sm">Commencez par ajouter votre première décision.</p>
          </div>
        )}
      </div>
      {/* Stats and Recent Activity */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Statistiques Rapides</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total entrées</span>
              <span className="font-bold text-white">{stats?.totalEntries || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Décisions humaines</span>
              <span className="font-bold text-green-400">{stats?.humanEntries || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Décisions IA</span>
              <span className="font-bold text-gold-400">{stats?.aiEntries || 0}</span>
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Tags Populaires</h3>
          <div className="space-y-2">
            {Object.entries(stats?.tagDistribution || {})?.sort(([,a], [,b]) => b - a)?.slice(0, 5)?.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded ${getTagColor(tag)}`}>
                    #{tag}
                  </span>
                  <span className="text-gray-400 text-sm">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Decision Impact Timeline */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Activité Récente</h3>
          <div className="space-y-2">
            {stats?.recentActivity?.slice(0, 5)?.map((activity, index) => {
              const AuthorIcon = getAuthorIcon(activity?.author);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <AuthorIcon className={`w-4 h-4 ${getAuthorColor(activity?.author)}`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 truncate">
                      {activity?.entry?.substring(0, 40)}...
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Nouvelle Entrée de Décision</h3>
            
            <div className="space-y-4">
              {/* Author Selection */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Auteur</label>
                <select
                  value={newEntry?.author}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, author: e?.target?.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="Matthieu">Matthieu (Humain)</option>
                  <option value="AAS_Sentinel">AAS_Sentinel (IA)</option>
                </select>
              </div>

              {/* Entry Content */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Décision / Observation</label>
                <textarea
                  value={newEntry?.entry}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, entry: e?.target?.value }))}
                  placeholder="Décrivez la décision prise, son contexte et ses raisons..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e?.target?.value)}
                    onKeyPress={(e) => e?.key === 'Enter' && handleAddTag()}
                    placeholder="Ajouter un tag..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-all"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                
                {newEntry?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newEntry?.tags?.map((tag, index) => (
                      <span
                        key={index}
                        onClick={() => handleRemoveTag(tag)}
                        className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-sm cursor-pointer hover:bg-red-400/20 hover:text-red-400 transition-all"
                      >
                        #{tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!newEntry?.entry?.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-bold transition-all flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEntry({ entry: '', author: 'Matthieu', tags: [] });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-bold transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedDecisionJournal;