import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Shield, Target, Eye, BarChart3, Users, Server, Database } from 'lucide-react';


export default function SecurityAssessmentDashboard({ securityOverview, onRefresh }) {
  const [vulnerabilityTrends, setVulnerabilityTrends] = useState([]);
  const [threatModelData, setThreatModelData] = useState(null);
  const [securityMetrics, setSecurityMetrics] = useState({});
  const [riskAssessment, setRiskAssessment] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate loading dashboard data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data based on security overview
      generateThreatModelData();
      generateSecurityMetrics();
      generateRiskAssessment();
      generateVulnerabilityTrends();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateThreatModelData = () => {
    setThreatModelData({
      attack_vectors: [
        { name: 'Web Application', severity: 'high', likelihood: 75, impact: 85 },
        { name: 'API Endpoints', severity: 'critical', likelihood: 65, impact: 90 },
        { name: 'Database', severity: 'high', likelihood: 45, impact: 95 },
        { name: 'Infrastructure', severity: 'medium', likelihood: 55, impact: 70 },
        { name: 'Social Engineering', severity: 'medium', likelihood: 30, impact: 60 },
        { name: 'Supply Chain', severity: 'high', likelihood: 25, impact: 85 }
      ],
      threat_actors: [
        { type: 'Script Kiddies', capability: 30, motivation: 40, opportunity: 80 },
        { type: 'Cybercriminals', capability: 75, motivation: 90, opportunity: 65 },
        { type: 'Nation State', capability: 95, motivation: 60, opportunity: 40 },
        { type: 'Insider Threat', capability: 60, motivation: 30, opportunity: 85 }
      ]
    });
  };

  const generateSecurityMetrics = () => {
    const baseScore = securityOverview?.security_posture?.score || 75;
    setSecurityMetrics({
      overall_posture: baseScore,
      vulnerability_density: Math.max(0, 100 - baseScore),
      incident_response_time: Math.random() * 30 + 10, // minutes
      patch_coverage: Math.min(100, baseScore + Math.random() * 20),
      security_awareness: Math.random() * 40 + 60,
      threat_detection_rate: Math.random() * 30 + 70,
      false_positive_rate: Math.random() * 15 + 5
    });
  };

  const generateRiskAssessment = () => {
    setRiskAssessment({
      critical_risks: Math.floor(Math.random() * 5) + 1,
      high_risks: Math.floor(Math.random() * 10) + 5,
      medium_risks: Math.floor(Math.random() * 20) + 10,
      low_risks: Math.floor(Math.random() * 15) + 8,
      risk_appetite_threshold: 70,
      current_risk_score: Math.random() * 30 + 40
    });
  };

  const generateVulnerabilityTrends = () => {
    const trends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date?.setDate(date?.getDate() - i);
      trends?.push({
        date: date?.toISOString()?.split('T')?.[0],
        critical: Math.floor(Math.random() * 5),
        high: Math.floor(Math.random() * 15) + 5,
        medium: Math.floor(Math.random() * 25) + 10,
        low: Math.floor(Math.random() * 20) + 15
      });
    }
    setVulnerabilityTrends(trends);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-900/30';
      case 'high': return 'text-orange-400 bg-orange-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-400' };
    if (score >= 60) return { level: 'High', color: 'text-orange-400' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-green-400' };
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-800/50 rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="h-24 bg-gray-700/30 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Real-time Vulnerability Detection */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Real-time Vulnerability Detection
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Critical Vulnerabilities</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">
              {riskAssessment?.critical_risks || 0}
            </div>
            <div className="text-xs text-red-300">Immediate action required</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">High Priority</span>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {riskAssessment?.high_risks || 0}
            </div>
            <div className="text-xs text-orange-300">Review within 24h</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Medium Risk</span>
              <BarChart3 className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {riskAssessment?.medium_risks || 0}
            </div>
            <div className="text-xs text-yellow-300">Review within 7 days</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Low Priority</span>
              <TrendingDown className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {riskAssessment?.low_risks || 0}
            </div>
            <div className="text-xs text-green-300">Scheduled maintenance</div>
          </div>
        </div>

        {/* Vulnerability Trend Chart */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">30-Day Vulnerability Trends</h4>
          <div className="h-40 flex items-end space-x-1">
            {vulnerabilityTrends?.slice(-14)?.map((day, index) => {
              const total = day?.critical + day?.high + day?.medium + day?.low;
              const maxHeight = 140;
              const height = (total / 50) * maxHeight;
              
              return (
                <div key={index} className="flex-1 flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-red-500/50 via-orange-500/50 via-yellow-500/50 to-green-500/50 rounded-t"
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {new Date(day.date)?.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Threat Modeling Analysis */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Threat Modeling Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Attack Vectors</h4>
            <div className="space-y-3">
              {threatModelData?.attack_vectors?.map((vector, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(vector?.severity)?.split(' ')?.[0]}`}></div>
                      <span className="text-gray-300 font-medium">{vector?.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(vector?.severity)}`}>
                      {vector?.severity}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Likelihood</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                          <div
                            className="bg-orange-400 h-1.5 rounded-full"
                            style={{ width: `${vector?.likelihood}%` }}
                          ></div>
                        </div>
                        <span className="text-orange-400 text-xs">{vector?.likelihood}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400 mb-1">Impact</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                          <div
                            className="bg-red-400 h-1.5 rounded-full"
                            style={{ width: `${vector?.impact}%` }}
                          ></div>
                        </div>
                        <span className="text-red-400 text-xs">{vector?.impact}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Threat Actors</h4>
            <div className="space-y-3">
              {threatModelData?.threat_actors?.map((actor, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-medium">{actor?.type}</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Capability</span>
                      <span className="text-blue-400">{actor?.capability}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Motivation</span>
                      <span className="text-yellow-400">{actor?.motivation}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Opportunity</span>
                      <span className="text-red-400">{actor?.opportunity}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-700/50">
                    <div className="text-xs text-gray-400">Threat Level</div>
                    <div className={`text-sm font-medium ${getRiskLevel((actor?.capability + actor?.motivation + actor?.opportunity) / 3)?.color}`}>
                      {getRiskLevel((actor?.capability + actor?.motivation + actor?.opportunity) / 3)?.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Security Posture Visualization */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Security Posture Visualization
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Security Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Overall Posture', value: securityMetrics?.overall_posture, color: 'blue', icon: Shield },
                { name: 'Patch Coverage', value: securityMetrics?.patch_coverage, color: 'green', icon: Server },
                { name: 'Threat Detection', value: securityMetrics?.threat_detection_rate, color: 'orange', icon: Eye },
                { name: 'Security Awareness', value: securityMetrics?.security_awareness, color: 'purple', icon: Users }
              ]?.map((metric, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <metric.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{metric?.name}</span>
                    </div>
                    <span className="text-white font-bold">{Math.round(metric?.value)}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric?.color === 'blue' ? 'bg-blue-400' :
                        metric?.color === 'green' ? 'bg-green-400' :
                        metric?.color === 'orange'? 'bg-orange-400' : 'bg-purple-400'
                      }`}
                      style={{ width: `${metric?.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Risk Distribution</h4>
            <div className="space-y-3">
              {[
                { level: 'Critical', count: riskAssessment?.critical_risks, color: 'bg-red-400' },
                { level: 'High', count: riskAssessment?.high_risks, color: 'bg-orange-400' },
                { level: 'Medium', count: riskAssessment?.medium_risks, color: 'bg-yellow-400' },
                { level: 'Low', count: riskAssessment?.low_risks, color: 'bg-green-400' }
              ]?.map((risk, index) => {
                const total = riskAssessment?.critical_risks + riskAssessment?.high_risks + 
                            riskAssessment?.medium_risks + riskAssessment?.low_risks;
                const percentage = total > 0 ? (risk?.count / total) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${risk?.color}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{risk?.level}</span>
                        <span className="text-white font-medium">{risk?.count}</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${risk?.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Risk Assessment Scoring */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Risk Assessment Scoring
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Risk Categories</h4>
            <div className="space-y-4">
              {[
                { category: 'Application Security', current: 78, target: 85, trend: 'up' },
                { category: 'Infrastructure Security', current: 82, target: 90, trend: 'up' },
                { category: 'Data Protection', current: 91, target: 95, trend: 'stable' },
                { category: 'Access Management', current: 88, target: 92, trend: 'up' },
                { category: 'Incident Response', current: 74, target: 85, trend: 'down' },
                { category: 'Compliance', current: 85, target: 90, trend: 'up' }
              ]?.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">{category?.category}</span>
                      {category?.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                      {category?.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                      {category?.trend === 'stable' && <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-white">{category?.current}%</span>
                      <span className="text-gray-400">Target: {category?.target}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="relative w-full h-2">
                      <div
                        className={`absolute h-2 rounded-full ${
                          category?.current >= category?.target 
                            ? 'bg-green-400' 
                            : category?.current >= category?.target * 0.8 
                              ? 'bg-yellow-400' :'bg-red-400'
                        }`}
                        style={{ width: `${category?.current}%` }}
                      ></div>
                      <div
                        className="absolute h-2 border-r-2 border-gray-300"
                        style={{ left: `${category?.target}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-4">Overall Risk Score</h4>
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-gray-700/50 rounded-full"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    background: `conic-gradient(from 0deg, ${
                      riskAssessment?.current_risk_score > 70 ? '#ef4444' :
                      riskAssessment?.current_risk_score > 50 ? '#f59e0b': '#10b981'
                    } ${riskAssessment?.current_risk_score * 3.6}deg, transparent ${riskAssessment?.current_risk_score * 3.6}deg)`
                  }}
                ></div>
                <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {Math.round(riskAssessment?.current_risk_score)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current</span>
                  <span className="text-white">{Math.round(riskAssessment?.current_risk_score)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Threshold</span>
                  <span className="text-yellow-400">{riskAssessment?.risk_appetite_threshold}%</span>
                </div>
                <div className="pt-2 border-t border-gray-700/50">
                  <span className={`font-medium ${getRiskLevel(riskAssessment?.current_risk_score)?.color}`}>
                    {getRiskLevel(riskAssessment?.current_risk_score)?.level} Risk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}