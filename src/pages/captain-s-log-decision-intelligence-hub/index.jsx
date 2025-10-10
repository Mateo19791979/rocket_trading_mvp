import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Users, TrendingUp, MessageSquare, Search, Filter, Plus } from 'lucide-react';
import { captainsLogService } from '../../services/captainsLogService';
import SharedDecisionJournal from './components/SharedDecisionJournal';
import DecisionIntelligenceAnalytics from './components/DecisionIntelligenceAnalytics';
import AIHumanCollaboration from './components/AIHumanCollaboration';
import MissionMemoryIntegration from './components/MissionMemoryIntegration';
import DecisionArchive from './components/DecisionArchive';
import Icon from '@/components/AppIcon';


const CaptainsLogDecisionIntelligenceHub = () => {
  const [logEntries, setLogEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription with proper error handling
    const setupSubscription = async () => {
      try {
        if (captainsLogService && typeof captainsLogService?.subscribeToChanges === 'function') {
          const sub = captainsLogService?.subscribeToChanges((payload) => {
            console.log('Real-time update:', payload);
            loadData(); // Refresh data on changes
          });
          setSubscription(sub);
        } else {
          console.warn('subscribeToChanges method not available');
        }
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription && captainsLogService && typeof captainsLogService?.unsubscribeFromChanges === 'function') {
        captainsLogService?.unsubscribeFromChanges(subscription);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if service methods exist before calling
      if (!captainsLogService || typeof captainsLogService?.getAllEntries !== 'function') {
        console.error('captainsLogService.getAllEntries is not available');
        setLogEntries([]);
        setStats({ totalEntries: 0, humanEntries: 0, aiEntries: 0, topTags: [] });
        return;
      }

      if (typeof captainsLogService?.getDecisionStats !== 'function') {
        console.error('captainsLogService.getDecisionStats is not available');
        const entriesData = await captainsLogService?.getAllEntries();
        setLogEntries(entriesData || []);
        setStats({ totalEntries: entriesData?.length || 0, humanEntries: 0, aiEntries: 0, topTags: [] });
        return;
      }

      const [entriesData, statsData] = await Promise.all([
        captainsLogService?.getAllEntries(),
        captainsLogService?.getDecisionStats()
      ]);
      
      setLogEntries(entriesData || []);
      setStats(statsData || { totalEntries: 0, humanEntries: 0, aiEntries: 0, topTags: [] });
    } catch (error) {
      console.error('Error loading Captain Log data:', error);
      // Set fallback data to prevent crashes
      setLogEntries([]);
      setStats({ totalEntries: 0, humanEntries: 0, aiEntries: 0, topTags: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (entry, author = 'Matthieu', tags = []) => {
    try {
      if (!captainsLogService || typeof captainsLogService?.addEntry !== 'function') {
        console.error('captainsLogService.addEntry is not available');
        return;
      }

      // Fix: Use proper object parameter structure
      await captainsLogService?.addEntry({
        author,
        entry,
        tags,
        user_id: null // Will be resolved by the service
      });
      loadData();
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const filteredEntries = logEntries?.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry?.entry?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      entry?.author?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesAuthor = filterAuthor === 'all' || 
      (filterAuthor === 'human' && entry?.author === 'Matthieu') ||
      (filterAuthor === 'ai' && entry?.author !== 'Matthieu') ||
      entry?.author === filterAuthor;
    
    return matchesSearch && matchesAuthor;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <BookOpen className="w-6 h-6 animate-pulse" />
          <span>Loading Captain's Log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 mb-2">
              📔 Captain's Log & Decision Intelligence Hub
            </h1>
            <p className="text-gray-300">
              Mémoire narrative partagée • IA-Humain • Intelligence décisionnelle
            </p>
          </div>
          
          {/* Stats Overview */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stats?.totalEntries || 0}
              </div>
              <div className="text-sm text-gray-400">Total Entries</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats?.humanEntries || 0}
              </div>
              <div className="text-sm text-gray-400">Human</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-400">
                {stats?.aiEntries || 0}
              </div>
              <div className="text-sm text-gray-400">AI</div>
            </div>
          </div>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les décisions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e?.target?.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="all">Tous les auteurs</option>
              <option value="human">Humain (Matthieu)</option>
              <option value="ai">IA (AAS_Sentinel)</option>
            </select>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'journal', label: 'Decision Journal', icon: BookOpen },
          { id: 'collaboration', label: 'AI-Human Collaboration', icon: Users },
          { id: 'analytics', label: 'Decision Intelligence', icon: Brain },
          { id: 'archive', label: 'Critical Archive', icon: MessageSquare },
          { id: 'memory', label: 'Mission Memory', icon: TrendingUp }
        ]?.map(tab => {
          const Icon = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab?.id 
                  ? 'bg-blue-600 text-white' :'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab?.label}</span>
            </button>
          );
        })}
      </div>
      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === 'journal' && (
          <SharedDecisionJournal 
            entries={filteredEntries}
            onAddEntry={handleAddEntry}
            stats={stats}
          />
        )}
        
        {activeTab === 'collaboration' && (
          <AIHumanCollaboration 
            entries={filteredEntries}
            onAddEntry={handleAddEntry}
          />
        )}
        
        {activeTab === 'analytics' && (
          <DecisionIntelligenceAnalytics 
            entries={filteredEntries}
            stats={stats}
          />
        )}
        
        {activeTab === 'archive' && (
          <DecisionArchive 
            entries={filteredEntries}
          />
        )}
        
        {activeTab === 'memory' && (
          <MissionMemoryIntegration 
            entries={filteredEntries}
            stats={stats}
          />
        )}
      </div>
      {/* Quick Add Entry FAB */}
      <button
        onClick={() => {
          const entry = prompt('Ajouter une décision rapide:');
          if (entry) {
            handleAddEntry(entry, 'Matthieu', ['manual']);
          }
        }}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all"
        title="Ajouter une entrée rapide"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CaptainsLogDecisionIntelligenceHub;