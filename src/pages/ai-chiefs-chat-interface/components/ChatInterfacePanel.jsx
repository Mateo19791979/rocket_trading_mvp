import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, MessageCircle, User, Bot, AlertCircle, Minimize2, Maximize2, Archive, MoreVertical, Copy, LogIn } from 'lucide-react';
import { aiChiefsChatService } from '../../../services/aiChiefsChatService';
import { useAuth } from '../../../contexts/AuthContext';

const ChatInterfacePanel = ({ chiefRole, onClose }) => {
  const { user, loading: authLoading, signInAsDemo } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState(null);
  const [attemptingLogin, setAttemptingLogin] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const subscriptionRef = useRef(null);

  const handleNewMessage = (payload) => {
    if (payload?.new) {
      setMessages(prev => [...prev, payload?.new]);
    }
  };

  useEffect(() => {
    if (user && chiefRole) {
      initializeChat();
    } else if (!authLoading && !user) {
      setLoading(false);
    }

    return () => {
      // Cleanup subscription
      if (subscriptionRef?.current) {
        aiChiefsChatService?.unsubscribeFromMessages(subscriptionRef?.current);
      }
    };
  }, [user, chiefRole, authLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('Session utilisateur invalide');
        return;
      }
      
      // Try to get existing conversations first
      const { data: conversations, error: convError } = await aiChiefsChatService?.getConversations(user?.id);
      if (convError) {
        throw new Error(`Erreur lors de la récupération des conversations: ${convError}`);
      }

      let activeConversation = conversations?.find(
        conv => conv?.chief_role === chiefRole && conv?.status === 'active'
      );

      // Create new conversation if none exists
      if (!activeConversation) {
        const { data: newConv, error: createError } = await aiChiefsChatService?.createConversation(
          user?.id, 
          chiefRole
        );
        
        if (createError) {
          throw new Error(`Erreur lors de la création de la conversation: ${createError}`);
        }
        activeConversation = newConv;
      }

      setConversation(activeConversation);

      // Load messages
      if (activeConversation) {
        const { data: msgData, error: msgError } = await aiChiefsChatService?.getMessages(activeConversation?.id);
        if (msgError) {
          console.warn('Error loading messages:', msgError);
          // Don't throw error for message loading, just log it
          setMessages([]);
        } else {
          setMessages(msgData || []);
        }

        // Subscribe to real-time updates
        subscriptionRef.current = aiChiefsChatService?.subscribeToMessages(
          activeConversation?.id,
          handleNewMessage
        );
      }

    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err?.message || 'Erreur lors de l\'initialisation du chat');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setAttemptingLogin(true);
      setError(null);
      
      const result = await signInAsDemo();
      if (result?.error) {
        setError('Erreur de connexion: ' + result?.error);
      }
      // The useEffect will detect the user change and initialize chat
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Erreur lors de la connexion démo');
    } finally {
      setAttemptingLogin(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage?.trim() || !conversation || sending) return;

    try {
      setSending(true);
      
      const { error } = await aiChiefsChatService?.sendMessage(
        conversation?.id,
        newMessage?.trim()
      );

      if (error) throw new Error(error);

      setNewMessage('');
      inputRef?.current?.focus();

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Erreur lors de l\'envoi du message: ' + err?.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleArchiveConversation = async () => {
    if (!conversation) return;

    try {
      await aiChiefsChatService?.updateConversationStatus(conversation?.id, 'archived');
      onClose?.();
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError('Erreur lors de l\'archivage');
    }
  };

  const copyMessageContent = (content) => {
    navigator.clipboard?.writeText(content);
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChiefInfo = () => {
    return aiChiefsChatService?.chiefRoles?.[chiefRole] || {};
  };

  const chiefInfo = getChiefInfo();

  if (authLoading || loading) {
    return (
      <div className="bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-teal-400 mr-2" />
          <span className="text-gray-300">
            {authLoading ? 'Vérification de l\'authentification...' : 'Initialisation de la conversation...'}
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Authentification requise</h3>
          <p className="text-gray-300 mb-4">
            Connectez-vous pour utiliser le chat avec les chefs IA
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-400 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          <div className="flex justify-center space-x-3 mt-6">
            <button
              onClick={handleDemoLogin}
              disabled={attemptingLogin}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {attemptingLogin ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>
                {attemptingLogin ? 'Connexion...' : 'Connexion Démo'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-[600px]'
    }`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{chiefInfo?.avatar}</div>
          <div>
            <h3 className="font-semibold text-white">{chiefInfo?.name}</h3>
            <p className="text-sm text-gray-400">{chiefInfo?.specialization}</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isMinimized ? "Agrandir" : "Réduire"}
            type="button"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          
          <div className="relative group">
            <button 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Plus d'options"
              type="button"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={(e) => {
                  e?.preventDefault();
                  e?.stopPropagation();
                  handleArchiveConversation();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 rounded-t-lg flex items-center space-x-2"
                type="button"
              >
                <Archive className="w-4 h-4" />
                <span>Archiver la conversation</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              console.log('Close button clicked'); // Debug log
              if (onClose && typeof onClose === 'function') {
                onClose();
              }
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-red-600 hover:bg-opacity-70 rounded transition-colors cursor-pointer select-none"
            title="Fermer le chat"
            type="button"
            style={{ minWidth: '32px', minHeight: '32px' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <>
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-900 bg-opacity-30 border-l-4 border-red-400">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
            {messages?.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">
                  Commencez une conversation avec {chiefInfo?.name}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {chiefInfo?.description}
                </p>
              </div>
            ) : (
              messages?.map((message) => (
                <div
                  key={message?.id}
                  className={`flex ${message?.sender_type === 'user_message' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg relative group ${
                      message?.sender_type === 'user_message' ? 'bg-blue-600 text-white'
                        : message?.sender_type === 'system_notification' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center space-x-2 mb-1">
                      {message?.sender_type === 'user_message' ? (
                        <User className="w-4 h-4" />
                      ) : message?.sender_type === 'system_notification' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {formatMessageTime(message?.created_at)}
                      </span>
                    </div>
                    
                    {/* Message Content */}
                    <div className="text-sm leading-relaxed">
                      {message?.content}
                    </div>

                    {/* Message Actions */}
                    <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyMessageContent(message?.content)}
                        className="p-1 bg-gray-800 rounded text-gray-400 hover:text-white"
                        title="Copier le message"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-600 p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e?.target?.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Écrivez votre message à ${chiefInfo?.name}...`}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                  rows="2"
                  disabled={sending}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage?.trim() || sending}
                className={`p-2 rounded-lg transition-colors ${
                  !newMessage?.trim() || sending
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {sending ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterfacePanel;