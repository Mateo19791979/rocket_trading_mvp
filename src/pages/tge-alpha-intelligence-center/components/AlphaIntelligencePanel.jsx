import React, { useMemo } from 'react';
import { TrendingUp, Star, DollarSign, Clock, Target, Trophy, Zap, Brain, BarChart3, PieChart, Activity } from 'lucide-react';

export default function AlphaIntelligencePanel({ events, statistics }) {
  // Calculate alpha opportunities
  const alphaAnalysis = useMemo(() => {
    if (!events?.length) return { opportunities: [], insights: [] };

    const upcomingEvents = events?.filter(event => event?.status === 'upcoming');
    
    // Score events based on various factors
    const scoredEvents = upcomingEvents?.map(event => {
      let score = 0;
      let factors = [];

      // Time-based scoring (earlier = higher score)
      if (event?.tge_datetime) {
        const daysUntil = (new Date(event.tge_datetime) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysUntil <= 7) {
          score += 30;
          factors?.push('Imminent launch');
        } else if (daysUntil <= 30) {
          score += 20;
          factors?.push('Near-term opportunity');
        }
      }

      // Funding amount scoring
      if (event?.raise_goal_usd) {
        if (event?.raise_goal_usd >= 10000000) {
          score += 25;
          factors?.push('Large funding round');
        } else if (event?.raise_goal_usd >= 1000000) {
          score += 15;
          factors?.push('Significant funding');
        }
      }

      // Price attractiveness
      if (event?.price_usd) {
        if (event?.price_usd <= 0.1) {
          score += 20;
          factors?.push('Low entry price');
        }
      }

      // Stage preference (earlier stages = higher potential)
      if (event?.sale_stage) {
        const stage = event?.sale_stage?.toLowerCase();
        if (stage?.includes('seed') || stage?.includes('private')) {
          score += 30;
          factors?.push('Early stage access');
        } else if (stage?.includes('ido') || stage?.includes('public')) {
          score += 15;
          factors?.push('Public sale access');
        }
      }

      // Chain preference
      if (event?.chain) {
        const chain = event?.chain?.toLowerCase();
        if (['ethereum', 'polygon', 'bsc']?.includes(chain)) {
          score += 10;
          factors?.push('Established chain');
        }
      }

      // Quality indicators
      if (event?.website && event?.twitter && event?.telegram) {
        score += 15;
        factors?.push('Strong online presence');
      }

      return {
        ...event,
        alpha_score: Math.min(100, score),
        score_factors: factors
      };
    })?.sort((a, b) => b?.alpha_score - a?.alpha_score);

    const topOpportunities = scoredEvents?.slice(0, 5);

    // Generate insights
    const insights = [
      {
        type: 'market_trend',
        title: 'DeFi Dominance',
        description: `${events?.filter(e => e?.tags?.some(tag => tag?.toLowerCase()?.includes('defi')))?.length} DeFi projects in pipeline`,
        icon: TrendingUp,
        color: 'text-green-400'
      },
      {
        type: 'timing',
        title: 'Near-term Launches',
        description: `${upcomingEvents?.filter(e => {
          const days = (new Date(e.tge_datetime) - new Date()) / (1000 * 60 * 60 * 24);
          return days <= 14;
        })?.length} TGEs launching within 2 weeks`,
        icon: Clock,
        color: 'text-orange-400'
      },
      {
        type: 'funding',
        title: 'High-Value Rounds',
        description: `${events?.filter(e => e?.raise_goal_usd >= 5000000)?.length} projects raising $5M+`,
        icon: DollarSign,
        color: 'text-blue-400'
      },
      {
        type: 'chains',
        title: 'Multi-Chain Strategy',
        description: `Projects spanning ${new Set(events.map(e => e.chain).filter(Boolean))?.size} different chains`,
        icon: Activity,
        color: 'text-purple-400'
      }
    ];

    return { opportunities: topOpportunities, insights };
  }, [events]);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    })?.format(amount);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    if (score >= 40) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getTimeUntilTGE = (dateString) => {
    if (!dateString) return 'TBD';
    
    const tgeDate = new Date(dateString);
    const now = new Date();
    const diff = tgeDate?.getTime() - now?.getTime();
    
    if (diff < 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Alpha Intelligence Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Alpha Intelligence</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Top Alpha Opportunities</span>
            </h3>

            {alphaAnalysis?.opportunities?.map((opportunity, index) => (
              <div key={opportunity?.id || index} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium text-sm">
                        {opportunity?.project_name}
                      </span>
                      {opportunity?.symbol && (
                        <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                          {opportunity?.symbol}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {opportunity?.sale_stage} • {getTimeUntilTGE(opportunity?.tge_datetime)}
                    </div>
                  </div>

                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getScoreColor(opportunity?.alpha_score)}`}>
                    {opportunity?.alpha_score}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <span className="text-green-400 ml-1">{formatCurrency(opportunity?.price_usd)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Raise:</span>
                    <span className="text-blue-400 ml-1">{formatCurrency(opportunity?.raise_goal_usd)}</span>
                  </div>
                </div>

                {opportunity?.score_factors?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {opportunity?.score_factors?.slice(0, 2)?.map((factor, idx) => (
                      <span 
                        key={idx} 
                        className="px-1.5 py-0.5 bg-gray-600 text-gray-300 text-xs rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {alphaAnalysis?.opportunities?.length === 0 && (
              <div className="text-center py-6">
                <Star className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No alpha opportunities detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Market Insights Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Market Insights</h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {alphaAnalysis?.insights?.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-8 h-8 bg-gray-600/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <insight.icon className={`w-4 h-4 ${insight?.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white mb-1">{insight?.title}</h4>
                <p className="text-xs text-gray-400">{insight?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Statistics Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Avg Alpha Score</div>
              <div className="text-lg font-bold text-white">
                {alphaAnalysis?.opportunities?.length > 0 
                  ? Math.round(alphaAnalysis?.opportunities?.reduce((sum, opp) => sum + opp?.alpha_score, 0) / alphaAnalysis?.opportunities?.length)
                  : 0
                }
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">High-Potential Events</div>
              <div className="text-lg font-bold text-green-400">
                {alphaAnalysis?.opportunities?.filter(opp => opp?.alpha_score >= 70)?.length}
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Next 7 Days</div>
              <div className="text-lg font-bold text-orange-400">
                {events?.filter(event => {
                  if (!event?.tge_datetime) return false;
                  const days = (new Date(event.tge_datetime) - new Date()) / (1000 * 60 * 60 * 24);
                  return days <= 7 && days > 0;
                })?.length || 0}
              </div>
            </div>
          </div>

          <div className="bg-gray-700/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">Investment Focus</span>
            </div>
            <div className="space-y-2">
              {events && events?.length > 0 ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">DeFi Protocols</span>
                    <span className="text-green-400">
                      {Math.round((events?.filter(e => e?.tags?.some(tag => tag?.toLowerCase()?.includes('defi')))?.length / events?.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Gaming & NFT</span>
                    <span className="text-purple-400">
                      {Math.round((events?.filter(e => e?.tags?.some(tag => ['gaming', 'nft', 'game']?.includes(tag?.toLowerCase())))?.length / events?.length) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">Infrastructure</span>
                    <span className="text-blue-400">
                      {Math.round((events?.filter(e => e?.tags?.some(tag => ['infrastructure', 'layer']?.includes(tag?.toLowerCase())))?.length / events?.length) * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400">No data available</div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-teal-500/10 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Alpha Alert</span>
            </div>
            <p className="text-xs text-gray-300">
              {alphaAnalysis?.opportunities?.length > 0
                ? `${alphaAnalysis?.opportunities?.filter(opp => opp?.alpha_score >= 80)?.length} high-alpha opportunities detected with scores above 80.`
                : 'Monitor for new opportunities with automated screening.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}