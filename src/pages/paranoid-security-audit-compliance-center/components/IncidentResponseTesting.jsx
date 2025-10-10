import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Play, Pause, RotateCcw, CheckCircle, Users, Phone, Mail, Activity, Target, Zap } from 'lucide-react';

export default function IncidentResponseTesting({ securityOverview, onRefresh }) {
  const [activeScenario, setActiveScenario] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [responseTeam, setResponseTeam] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [runningTest, setRunningTest] = useState(false);

  useEffect(() => {
    loadIncidentResponseData();
  }, []);

  const loadIncidentResponseData = () => {
    // Load test scenarios and results
    setSimulations([
      {
        id: 1,
        name: 'Data Breach Response',
        type: 'data_breach',
        severity: 'critical',
        status: 'completed',
        lastRun: '2025-10-05T14:30:00Z',
        duration: 45,
        success_rate: 85,
        description: 'Simulated unauthorized access to customer database'
      },
      {
        id: 2,
        name: 'Ransomware Attack',
        type: 'malware',
        severity: 'critical',
        status: 'scheduled',
        lastRun: '2025-10-01T09:15:00Z',
        duration: 60,
        success_rate: 78,
        description: 'Encrypted file system with ransom demand'
      },
      {
        id: 3,
        name: 'DDoS Attack',
        type: 'availability',
        severity: 'high',
        status: 'running',
        lastRun: '2025-10-06T10:00:00Z',
        duration: 30,
        success_rate: 92,
        description: 'Large-scale distributed denial of service'
      },
      {
        id: 4,
        name: 'Insider Threat',
        type: 'insider',
        severity: 'high',
        status: 'pending',
        lastRun: '2025-09-28T16:45:00Z',
        duration: 90,
        success_rate: 71,
        description: 'Privileged user accessing unauthorized data'
      },
      {
        id: 5,
        name: 'API Compromise',
        type: 'application',
        severity: 'medium',
        status: 'completed',
        lastRun: '2025-10-04T11:20:00Z',
        duration: 35,
        success_rate: 88,
        description: 'Compromised API keys leading to data exposure'
      }
    ]);

    setResponseTeam([
      {
        id: 1,
        name: 'Sarah Chen',
        role: 'Incident Commander',
        contact: '+1-555-0101',
        email: 'sarah.chen@company.com',
        status: 'available',
        last_response_time: 3
      },
      {
        id: 2,
        name: 'Mike Rodriguez',
        role: 'Security Analyst',
        contact: '+1-555-0102',
        email: 'mike.rodriguez@company.com',
        status: 'available',
        last_response_time: 5
      },
      {
        id: 3,
        name: 'Emma Johnson',
        role: 'Legal Counsel',
        contact: '+1-555-0103',
        email: 'emma.johnson@company.com',
        status: 'busy',
        last_response_time: 12
      },
      {
        id: 4,
        name: 'David Kim',
        role: 'Technical Lead',
        contact: '+1-555-0104',
        email: 'david.kim@company.com',
        status: 'available',
        last_response_time: 7
      },
      {
        id: 5,
        name: 'Lisa Wang',
        role: 'Communications',
        contact: '+1-555-0105',
        email: 'lisa.wang@company.com',
        status: 'available',
        last_response_time: 4
      }
    ]);

    setProcedures([
      {
        id: 1,
        name: 'Incident Detection',
        status: 'automated',
        avg_time: 2,
        last_tested: '2025-10-05T14:30:00Z',
        success_rate: 95
      },
      {
        id: 2,
        name: 'Team Notification',
        status: 'manual',
        avg_time: 5,
        last_tested: '2025-10-05T14:32:00Z',
        success_rate: 92
      },
      {
        id: 3,
        name: 'Initial Assessment',
        status: 'manual',
        avg_time: 15,
        last_tested: '2025-10-05T14:35:00Z',
        success_rate: 88
      },
      {
        id: 4,
        name: 'Containment',
        status: 'semi-automated',
        avg_time: 20,
        last_tested: '2025-10-05T14:50:00Z',
        success_rate: 85
      },
      {
        id: 5,
        name: 'Evidence Collection',
        status: 'manual',
        avg_time: 45,
        last_tested: '2025-10-05T15:10:00Z',
        success_rate: 90
      },
      {
        id: 6,
        name: 'Recovery Planning',
        status: 'manual',
        avg_time: 30,
        last_tested: '2025-10-05T15:55:00Z',
        success_rate: 83
      }
    ]);

    setTestResults([
      {
        id: 1,
        scenario: 'Data Breach Response',
        date: '2025-10-05T14:30:00Z',
        duration: 45,
        team_response_time: 4,
        containment_time: 18,
        recovery_time: 23,
        overall_score: 85,
        issues: [
          'Delayed legal notification by 3 minutes',
          'Incomplete forensic evidence collection'
        ],
        improvements: [
          'Automated legal workflow needed',
          'Enhanced logging for forensics'
        ]
      }
    ]);
  };

  const runSecurityBreachSimulation = async (scenario) => {
    setRunningTest(true);
    setActiveScenario(scenario);
    
    // Simulate test execution
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Update progress here if needed
    }

    // Simulate test results
    const newResult = {
      id: Date.now(),
      scenario: scenario?.name,
      date: new Date()?.toISOString(),
      duration: Math.floor(Math.random() * 30) + 30,
      team_response_time: Math.floor(Math.random() * 5) + 2,
      containment_time: Math.floor(Math.random() * 15) + 10,
      recovery_time: Math.floor(Math.random() * 20) + 15,
      overall_score: Math.floor(Math.random() * 20) + 75,
      issues: [
        'Communication delay detected',
        'Resource allocation needs improvement'
      ],
      improvements: [
        'Implement automated escalation',
        'Enhance monitoring capabilities'
      ]
    };

    setTestResults([newResult, ...testResults]);
    setRunningTest(false);
    setActiveScenario(null);
    onRefresh?.();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'low': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'text-green-400 bg-green-900/30';
      case 'busy': return 'text-yellow-400 bg-yellow-900/30';
      case 'offline': return 'text-red-400 bg-red-900/30';
      case 'completed': return 'text-blue-400 bg-blue-900/30';
      case 'running': return 'text-orange-400 bg-orange-900/30';
      case 'scheduled': return 'text-purple-400 bg-purple-900/30';
      case 'pending': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getAutomationIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'automated': return <Zap className="w-4 h-4 text-green-400" />;
      case 'semi-automated': return <Activity className="w-4 h-4 text-yellow-400" />;
      case 'manual': return <Users className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Security Breach Simulation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Target className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Security Breach Simulation
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {runningTest && (
              <div className="flex items-center space-x-2 text-orange-400">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Test Running...</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {simulations?.map((scenario) => (
            <div key={scenario?.id} className="bg-gray-900/50 rounded-lg border border-gray-600/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="font-medium text-white">{scenario?.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(scenario?.severity)}`}>
                  {scenario?.severity}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4">{scenario?.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(scenario?.status)}`}>
                    {scenario?.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Success Rate</span>
                  <span className="text-white font-medium">{scenario?.success_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Duration</span>
                  <span className="text-white font-medium">{scenario?.duration}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Last Run</span>
                  <span className="text-white font-medium">
                    {new Date(scenario.lastRun)?.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => runSecurityBreachSimulation(scenario)}
                disabled={runningTest || scenario?.status === 'running'}
                className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded-lg text-red-300 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {scenario?.status === 'running' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Simulation</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Recovery Procedure Validation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <RotateCcw className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Recovery Procedure Validation
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Response Procedures</h4>
            <div className="space-y-3">
              {procedures?.map((procedure) => (
                <div key={procedure?.id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAutomationIcon(procedure?.status)}
                      <span className="text-gray-300 font-medium">{procedure?.name}</span>
                    </div>
                    <span className="text-sm text-white font-bold">{procedure?.success_rate}%</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Avg Time</div>
                      <div className="text-white font-medium">{procedure?.avg_time}m</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Tested</div>
                      <div className="text-white font-medium">
                        {new Date(procedure.last_tested)?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          procedure?.success_rate >= 90 ? 'bg-green-400' :
                          procedure?.success_rate >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${procedure?.success_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Recent Test Results</h4>
            <div className="space-y-3">
              {testResults?.map((result) => (
                <div key={result?.id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{result?.scenario}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result?.overall_score >= 90 ? 'text-green-400 bg-green-900/30' :
                      result?.overall_score >= 80 ? 'text-yellow-400 bg-yellow-900/30': 'text-red-400 bg-red-900/30'
                    }`}>
                      {result?.overall_score}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="text-center">
                      <div className="text-gray-400">Response</div>
                      <div className="text-blue-400 font-medium">{result?.team_response_time}m</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Contain</div>
                      <div className="text-orange-400 font-medium">{result?.containment_time}m</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Recover</div>
                      <div className="text-green-400 font-medium">{result?.recovery_time}m</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    {new Date(result.date)?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Emergency Response Protocol Verification */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Phone className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Emergency Response Protocol Verification
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Response Team</h4>
            <div className="space-y-3">
              {responseTeam?.map((member) => (
                <div key={member?.id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{member?.name}</div>
                        <div className="text-sm text-gray-400">{member?.role}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(member?.status)}`}>
                      {member?.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span>{member?.contact}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{member?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Response Time</span>
                    <span className="text-white font-medium">{member?.last_response_time}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Communication Channels</h4>
            <div className="space-y-3">
              {[
                { name: 'Primary Alert System', status: 'operational', response_time: '< 1 min' },
                { name: 'SMS Notification', status: 'operational', response_time: '< 2 min' },
                { name: 'Email Alerts', status: 'operational', response_time: '< 3 min' },
                { name: 'Slack Integration', status: 'degraded', response_time: '< 5 min' },
                { name: 'Phone Tree', status: 'operational', response_time: '< 10 min' }
              ]?.map((channel, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{channel?.name}</span>
                    <div className="flex items-center space-x-1">
                      {channel?.status === 'operational' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className={`text-xs ${
                        channel?.status === 'operational' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {channel?.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Response Time: {channel?.response_time}
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-white font-medium mt-6">Escalation Matrix</h4>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-300">Level 1 (0-15 min)</span>
                  <span className="text-blue-400">Security Team</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-300">Level 2 (15-30 min)</span>
                  <span className="text-orange-400">Management</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-300">Level 3 (30-60 min)</span>
                  <span className="text-red-400">Executive Team</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Level 4 (60+ min)</span>
                  <span className="text-purple-400">External Partners</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}