import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, RefreshCw, Brain, Bot, User, Settings } from 'lucide-react';
import dialogueService from '../../../services/dialogueService';

const DialogueIAPanel = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('human');
  const [selectedChannel, setSelectedChannel] = useState('tripartite');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [stats, setStats] = useState({
    totalMessages: 0,
    recentMessages: 0,
    roleDistribution: []
  });
  const [isDemo, setIsDemo] = useState(false);
  const messagesEndRef = useRef(null);

  // Available roles and channels
  const roles = [
    { id: 'human', label: 'Human', icon: User, color: 'emerald' },
    { id: 'orchestrator', label: 'Orchestrateur', icon: Settings, color: 'blue' },
    { id: 'core_ai', label: 'Core IA', icon: Brain, color: 'purple' },
    { id: 'agent', label: 'Agent', icon: Bot, color: 'orange' }
  ];

  const channels = [
    { id: 'tripartite', label: 'Tripartite', description: 'Canal principal Human ↔ Orchestrateur ↔ IA' },
    { id: 'europe', label: 'Europe', description: 'Agents trading européens' },
    { id: 'us', label: 'US', description: 'Agents trading américains' },
    { id: 'asia', label: 'Asie', description: 'Agents trading asiatiques' },
    { id: 'execution', label: 'Exécution', description: 'Canal d\'exécution des trades' },
    { id: 'analysis', label: 'Analyse', description: 'Canal d\'analyse de marché' }
  ];

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      const { data, error } = await dialogueService?.getRecentMessages(200, selectedChannel === 'tripartite' ? null : selectedChannel);
      
      if (error) {
        // Use demo data on error
        const demoMessages = dialogueService?.getDemoMessages();
        setMessages(demoMessages || []);
        setIsDemo(true);
        setConnectionStatus('disconnected');
      } else {
        setMessages(data || []);
        setIsDemo(false);
        setConnectionStatus('connected');
        
        // Load stats
        const { data: statsData } = await dialogueService?.getDialogueStats();
        if (statsData) {
          setStats(statsData);
        }
      }
    } catch (err) {
      // Fallback to demo data
      const demoMessages = dialogueService?.getDemoMessages();
      setMessages(demoMessages || []);
      setIsDemo(true);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage?.trim()) return;

    try {
      if (isDemo) {
        // Add to demo messages
        const message = {
          id: `demo-${Date.now()}`,
          role: selectedRole,
          message: newMessage?.trim(),
          channel: selectedChannel,
          importance: 1,
          created_at: new Date()?.toISOString()
        };
        setMessages(prev => [message, ...prev]);
      } else {
        const { error } = await dialogueService?.sendMessage({
          role: selectedRole,
          message: newMessage?.trim(),
          channel: selectedChannel,
          importance: 1
        });
        
        if (error) {
          console.error('Failed to send message:', error);
          return;
        }
        
        // Message will be added via real-time subscription
      }
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!isDemo) {
      const subscription = dialogueService?.subscribeToDialogue(
        (payload) => {
          if (payload?.eventType === 'INSERT' && payload?.new) {
            setMessages(prev => [payload?.new, ...prev]);
          } else if (payload?.eventType === 'UPDATE' && payload?.new) {
            setMessages(prev => prev?.map(msg => 
              msg?.id === payload?.new?.id ? payload?.new : msg
            ));
          } else if (payload?.eventType === 'DELETE' && payload?.old) {
            setMessages(prev => prev?.filter(msg => msg?.id !== payload?.old?.id));
          }
        },
        selectedChannel === 'tripartite' ? null : selectedChannel
      );

      return () => {
        if (subscription) {
          dialogueService?.unsubscribeFromDialogue(selectedChannel === 'tripartite' ? 'all' : selectedChannel);
        }
      };
    }
  }, [selectedChannel, isDemo]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages on mount and channel change
  useEffect(() => {
    loadMessages();
  }, [selectedChannel]);

  // Get role configuration
  const getRoleConfig = (role) => {
    return roles?.find(r => r?.id === role) || roles?.[0];
  };

  // Get channel configuration
  const getChannelConfig = (channelId) => {
    return channels?.find(c => c?.id === channelId) || channels?.[0];
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp)?.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '--:--:--';
    }
  };

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500 animate-pulse';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
            Canal Communication Persistante v4.0
          </h2>
          <p className="text-gray-400 text-sm">
            Dialogue tripartite: Humain ↔ Orchestrateur ↔ IA Core
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs ${getConnectionStatusColor()}`}>
              {connectionStatus === 'connected' ? 'Connecté' : 
               connectionStatus === 'connecting'? 'Connexion...' : 'Déconnecté'}
            </span>
          </div>
          
          {/* Demo Mode Indicator */}
          {isDemo && (
            <span className="bg-orange-900/30 text-orange-400 px-2 py-1 rounded text-xs">
              Mode Démo
            </span>
          )}
          
          {/* Stats */}
          <div className="text-xs text-gray-500">
            {stats?.recentMessages} messages (72h)
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={loadMessages}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="flex flex-wrap gap-2">
        {channels?.map(channel => (
          <button
            key={channel?.id}
            onClick={() => setSelectedChannel(channel?.id)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              selectedChannel === channel?.id
                ? 'bg-blue-600 text-white' :'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title={channel?.description}
          >
            {channel?.label}
          </button>
        ))}
      </div>

      {/* Messages Display */}
      <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-y-auto">
        {messages?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucun message dans ce canal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages?.map((message) => {
              const roleConfig = getRoleConfig(message?.role);
              const IconComponent = roleConfig?.icon;
              
              return (
                <div
                  key={message?.id}
                  className="bg-gray-800 rounded-lg p-3 border-l-4"
                  style={{ borderLeftColor: `var(--color-${roleConfig?.color || 'gray'}-500, #6B7280)` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {IconComponent && (
                        <IconComponent className={`h-4 w-4 text-${roleConfig?.color || 'gray'}-500`} />
                      )}
                      <span className={`text-sm font-medium text-${roleConfig?.color || 'gray'}-400`}>
                        {roleConfig?.label}
                      </span>
                      {message?.channel && message?.channel !== 'tripartite' && (
                        <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">
                          {getChannelConfig(message?.channel)?.label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTime(message?.created_at)}
                    </span>
                  </div>
                  <p className="text-white text-sm">{message?.message}</p>
                  {message?.importance > 1 && (
                    <div className="mt-1">
                      <span className="bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded text-xs">
                        Priorité élevée
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex flex-col space-y-3">
          {/* Role and Channel Selection */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Rôle:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e?.target?.value)}
                className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600"
              >
                {roles?.map(role => (
                  <option key={role?.id} value={role?.id}>
                    {role?.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Canal:</label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e?.target?.value)}
                className="bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-600"
              >
                {channels?.map(channel => (
                  <option key={channel?.id} value={channel?.id}>
                    {channel?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e?.target?.value)}
              placeholder="Tapez votre message..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              rows="3"
              onKeyDown={(e) => {
                if (e?.key === 'Enter' && !e?.shiftKey) {
                  e?.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage?.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              title="Envoyer (Ctrl+Entrée)"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueIAPanel;