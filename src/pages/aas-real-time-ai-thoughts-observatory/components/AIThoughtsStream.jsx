import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Target, AlertCircle, ChevronDown, ChevronRight, Activity, Zap, BarChart3, MessageSquare } from 'lucide-react';
import { aasObservatoryService } from '../../../services/aasObservatoryService';

export default function AIThoughtsStream({ isActive, cognitiveMetrics }) {
  const [thoughts, setThoughts] = useState([]);
  const [expandedThoughts, setExpandedThoughts] = useState(new Set());
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const streamRef = useRef(null);

  const agents = ['newsminer', 'strategy_weaver', 'execution_guru', 'risk_controller', 'options_screener'];
  const outcomes = ['success', 'guard_blocked', 'error', 'canary_fail'];

  useEffect(() => {
    if (isActive) {
      loadThoughts();
      const interval = setInterval(loadThoughts, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [isActive, filterAgent, filterOutcome]);

  const loadThoughts = async () => {
    try {
      setIsLoading(true);
      const filters = {
        agent: filterAgent !== 'all' ? filterAgent : undefined,
        outcome: filterOutcome !== 'all' ? filterOutcome : undefined,
        limit: 50
      };
      
      const newThoughts = await aasObservatoryService?.getDecisionLogs(filters);
      setThoughts(newThoughts || []);
      
      // Auto-scroll to bottom for new thoughts
      if (streamRef?.current) {
        streamRef.current.scrollTop = streamRef?.current?.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to load AI thoughts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (thoughtId) => {
    setExpandedThoughts(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(thoughtId)) {
        newSet?.delete(thoughtId);
      } else {
        newSet?.add(thoughtId);
      }
      return newSet;
    });
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'success': return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'guard_blocked': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-900/30 border-red-500/30';
      case 'canary_fail': return 'text-orange-400 bg-orange-900/30 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
    }
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'newsminer': return <MessageSquare className="h-4 w-4" />;
      case 'strategy_weaver': return <Target className="h-4 w-4" />;
      case 'execution_guru': return <Zap className="h-4 w-4" />;
      case 'risk_controller': return <AlertCircle className="h-4 w-4" />;
      case 'options_screener': return <BarChart3 className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const calculateConfidenceScore = (thought) => {
    // Calculate confidence based on output data, tools used, and outcome
    let confidence = 50;
    
    if (thought?.outcome === 'success') confidence += 30;
    if (thought?.tools && Object.keys(thought?.tools)?.length > 0) confidence += 10;
    if (thought?.output && Object.keys(thought?.output)?.length > 2) confidence += 10;
    
    return Math.min(confidence, 100);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Thoughts Stream</h3>
            <p className="text-gray-400 text-sm">Live cognitive activity feeds</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${
            isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
          }`} />
          <span className="text-xs text-gray-400">
            {isActive ? 'Live Streaming' : 'Paused'}
          </span>
        </div>
      </div>
      {/* Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e?.target?.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Agents</option>
          {agents?.map(agent => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>
        
        <select
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e?.target?.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Outcomes</option>
          {outcomes?.map(outcome => (
            <option key={outcome} value={outcome}>{outcome}</option>
          ))}
        </select>
      </div>
      {/* Thoughts Stream */}
      <div 
        ref={streamRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        <AnimatePresence>
          {thoughts?.map((thought) => {
            const isExpanded = expandedThoughts?.has(thought?.id);
            let confidence = calculateConfidenceScore(thought);
            
            return (
              <motion.div
                key={thought?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gray-600 rounded">
                      {getAgentIcon(thought?.agent)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium text-sm">
                          {thought?.agent || 'Unknown Agent'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs border ${getOutcomeColor(thought?.outcome)}`}>
                          {thought?.outcome || 'pending'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {thought?.task || 'No task specified'} • {formatTimestamp(thought?.ts)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-400">
                      {confidence}% confidence
                    </div>
                    <button
                      onClick={() => toggleExpanded(thought?.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {/* Confidence Bar */}
                <div className="mb-3">
                  <div className="h-1 bg-gray-600 rounded-full">
                    <div 
                      className={`h-1 rounded-full transition-all ${
                        confidence >= 80 ? 'bg-green-400' : 
                        confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
                {/* Expandable Decision Tree */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {/* Input */}
                      {thought?.input && (
                        <div className="bg-gray-800/50 rounded p-3">
                          <h5 className="text-xs font-medium text-blue-400 mb-2">INPUT</h5>
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(thought?.input, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Tools */}
                      {thought?.tools && (
                        <div className="bg-gray-800/50 rounded p-3">
                          <h5 className="text-xs font-medium text-purple-400 mb-2">TOOLS USED</h5>
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(thought?.tools, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Output */}
                      {thought?.output && (
                        <div className="bg-gray-800/50 rounded p-3">
                          <h5 className="text-xs font-medium text-green-400 mb-2">OUTPUT</h5>
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(thought?.output, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Human Feedback */}
                      {thought?.human_feedback && (
                        <div className="bg-gray-800/50 rounded p-3">
                          <h5 className="text-xs font-medium text-yellow-400 mb-2">HUMAN FEEDBACK</h5>
                          <p className="text-xs text-gray-300">{thought?.human_feedback}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {thoughts?.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No AI thoughts detected</p>
            <p className="text-gray-500 text-sm">Waiting for cognitive activity...</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <Activity className="h-6 w-6 mx-auto text-blue-400 animate-spin mb-2" />
            <p className="text-gray-400 text-sm">Loading thoughts...</p>
          </div>
        )}
      </div>
      {/* Stream Stats */}
      <div className="mt-4 pt-4 border-t border-gray-600/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-gray-400">{cognitiveMetrics?.thoughtsPerMinute || 0}/min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">{cognitiveMetrics?.averageConfidence || 0}% avg</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-gray-400">{cognitiveMetrics?.criticalDecisions || 0} critical</span>
            </div>
          </div>
          <div className="text-gray-500">
            {thoughts?.length || 0} thoughts loaded
          </div>
        </div>
      </div>
    </div>
  );
}