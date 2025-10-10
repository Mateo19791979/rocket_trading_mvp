import React, { useState } from 'react';
import { Shield, Settings, AlertTriangle, CheckCircle, RefreshCw, Zap, Target, Lock } from 'lucide-react';

export default function AutonomousGovernancePanel({ governanceData, aiAgents, decisionLogs, onRefreshData }) {
  const [selectedTab, setSelectedTab] = useState('governance');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tabs = [
    { id: 'governance', name: 'Self-Governance', icon: Shield },
    { id: 'authority', name: 'Decision Authority', icon: Target },
    { id: 'safety', name: 'Safety Override', icon: Lock }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const calculateGovernanceMetrics = () => {
    const totalModifications = governanceData?.self_modifications?.length;
    const successfulModifications = governanceData?.self_modifications?.filter(mod => mod?.success)?.length;
    const averageConstraintAdherence = governanceData?.ethical_constraints?.length > 0
      ? Math.round(governanceData?.ethical_constraints?.reduce((sum, constraint) => sum + constraint?.adherence_score, 0) / governanceData?.ethical_constraints?.length)
      : 0;
    const averageAuthorityLevel = governanceData?.decision_authority?.length > 0
      ? Math.round(governanceData?.decision_authority?.reduce((sum, auth) => sum + auth?.authority_level, 0) / governanceData?.decision_authority?.length)
      : 0;

    return {
      modificationSuccessRate: totalModifications > 0 ? Math.round((successfulModifications / totalModifications) * 100) : 0,
      constraintAdherence: averageConstraintAdherence,
      averageAuthority: averageAuthorityLevel,
      safetyOverrides: governanceData?.safety_overrides?.length
    };
  };

  const metrics = calculateGovernanceMetrics();

  const renderGovernanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-green-400" />
        Self-Modification Protocols
      </h3>

      {/* Governance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Modification Success</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.modificationSuccessRate}%</div>
          <div className="mt-2 bg-gray-600 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              style={{ width: `${metrics?.modificationSuccessRate}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Constraint Adherence</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.constraintAdherence}%</div>
          <div className="mt-2 bg-gray-600 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: `${metrics?.constraintAdherence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Self-Modification History */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Recent Self-Modifications</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {governanceData?.self_modifications?.slice(0, 6)?.map((modification, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    modification?.success ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {modification?.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {modification?.type || 'Parameter Tuning'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(modification.timestamp)?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${modification?.success ? 'text-green-400' : 'text-red-400'}`}>
                    {modification?.success ? 'Success' : 'Failed'}
                  </div>
                  <div className="text-xs text-gray-400">Status</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethical Constraint Management */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Ethical Constraint Management</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">Risk Threshold Limits</span>
              </div>
              <span className="text-sm text-green-400">Active</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Position Size Controls</span>
              </div>
              <span className="text-sm text-green-400">Active</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Ethical Trading Rules</span>
              </div>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuthorityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-400" />
        Decision Authority Escalation
      </h3>

      {/* Authority Levels */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Average Authority Level</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-purple-400">{metrics?.averageAuthority}%</div>
            <div className="text-sm text-gray-400">Autonomous Decision Authority</div>
          </div>
          <div className="bg-gray-600 rounded-full h-4">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              style={{ width: `${metrics?.averageAuthority}%` }}
            />
          </div>
        </div>
      </div>

      {/* Agent Authority Distribution */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Agent Authority Distribution</h4>
        <div className="space-y-3">
          {governanceData?.decision_authority?.slice(0, 5)?.map((authority, index) => {
            const authorityLevel = authority?.authority_level;
            const levelName = authorityLevel > 80 ? 'Full Autonomy' :
                            authorityLevel > 60 ? 'High Authority' :
                            authorityLevel > 40 ? 'Moderate Authority' :
                            authorityLevel > 20 ? 'Limited Authority' : 'Supervised';
            
            const levelColor = authorityLevel > 80 ? 'text-red-400' :
                             authorityLevel > 60 ? 'text-purple-400' :
                             authorityLevel > 40 ? 'text-blue-400' :
                             authorityLevel > 20 ? 'text-green-400' : 'text-yellow-400';

            return (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Agent {authority?.agent_id?.slice(0, 8) || `#${index + 1}`}
                      </div>
                      <div className={`text-xs ${levelColor}`}>
                        {levelName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {authorityLevel}%
                    </div>
                    <div className="text-xs text-gray-400">Authority</div>
                  </div>
                </div>
                <div className="mt-2 bg-gray-600 rounded-full h-2">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${authorityLevel}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSafetyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Lock className="w-5 h-5 text-red-400" />
        Safety Override Capabilities
      </h3>

      {/* Safety Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{metrics?.safetyOverrides}</div>
            <div className="text-sm text-gray-400">Safety Overrides Today</div>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.max(0, 10 - metrics?.safetyOverrides)}
            </div>
            <div className="text-sm text-gray-400">Remaining Override Capacity</div>
          </div>
        </div>
      </div>

      {/* Safety Override History */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Recent Safety Overrides</h4>
        {governanceData?.safety_overrides?.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {governanceData?.safety_overrides?.slice(0, 6)?.map((override, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {override?.override_reason || 'Safety Threshold Exceeded'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(override.timestamp)?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-400">Override</div>
                    <div className="text-xs text-gray-400">Action Taken</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">No safety overrides required today</p>
            <p className="text-gray-500 text-xs">All AI agents operating within safe parameters</p>
          </div>
        )}
      </div>

      {/* Safety Controls */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Active Safety Controls</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Emergency Stop Protocol</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Ready</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Risk Escalation Monitor</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Autonomous Override Authority</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-yellow-400">Restricted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-green-500/30">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Autonomous Governance</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Update</span>
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-1">Self-Modification & Safety Override Management</p>
      </div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs?.map((tab) => {
          const IconComponent = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setSelectedTab(tab?.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === tab?.id
                  ? 'text-green-400 border-b-2 border-green-400' :'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconComponent className="w-4 h-4" />
                {tab?.name}
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-6">
        {selectedTab === 'governance' && renderGovernanceTab()}
        {selectedTab === 'authority' && renderAuthorityTab()}
        {selectedTab === 'safety' && renderSafetyTab()}
      </div>
    </div>
  );
}