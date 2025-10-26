import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, AlertTriangle, CheckCircle, XCircle, Rocket } from 'lucide-react';

export default function DeploymentChecklistPanel({ systemHealth }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [deploymentScore, setDeploymentScore] = useState(0);

  const checklistItems = [
    {
      id: 'backend-launch',
      title: 'Launch Backend Service',
      description: 'Start Node.js or FastAPI on port 8001',
      command: 'pm2 start server/index.js --name api-core',
      priority: 'critical',
      autoCheck: systemHealth?.backend === 'healthy'
    },
    {
      id: 'local-test',
      title: 'Test Local Endpoint',
      description: 'Verify backend responds on localhost',
      command: 'curl http://127.0.0.1:8001/health',
      priority: 'critical',
      autoCheck: false
    },
    {
      id: 'nginx-config',
      title: 'Update Nginx Configuration',
      description: 'Apply proxy configuration and reload',
      command: 'nginx -t && systemctl reload nginx',
      priority: 'critical',
      autoCheck: systemHealth?.nginx === 'healthy'
    },
    {
      id: 'production-test',
      title: 'Verify Production Endpoint',
      description: 'Test API through production domain',
      command: 'curl -I https://trading-mvp.com/api/health',
      priority: 'critical',
      autoCheck: false
    },
    {
      id: 'env-config',
      title: 'Environment Variables',
      description: 'Verify .env configuration',
      command: 'Check VITE_API_BASE_URL in .env',
      priority: 'high',
      autoCheck: false
    },
    {
      id: 'frontend-build',
      title: 'Frontend Rebuild',
      description: 'Rebuild with updated API configuration',
      command: 'npm run build',
      priority: 'high',
      autoCheck: false
    },
    {
      id: 'diagnostic-page',
      title: 'Diagnostic Page Test',
      description: 'Verify /diagnostic shows green status',
      command: 'Open /diagnostic in browser',
      priority: 'medium',
      autoCheck: false
    },
    {
      id: 'ssl-check',
      title: 'SSL Certificate Validation',
      description: 'Confirm HTTPS endpoints work',
      command: 'curl -I https://trading-mvp.com/api/security/tls/health',
      priority: 'medium',
      autoCheck: false
    }
  ];

  useEffect(() => {
    // Auto-check items based on system health
    const autoChecked = {};
    checklistItems?.forEach(item => {
      if (item?.autoCheck) {
        autoChecked[item.id] = true;
      }
    });
    setCheckedItems(prevState => ({ ...prevState, ...autoChecked }));
  }, [systemHealth]);

  useEffect(() => {
    // Calculate deployment readiness score
    const totalItems = checklistItems?.length;
    const checkedCount = Object.values(checkedItems)?.filter(Boolean)?.length;
    const score = Math.round((checkedCount / totalItems) * 100);
    setDeploymentScore(score);
  }, [checkedItems]);

  const toggleItem = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev?.[id]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-700/50';
      case 'high':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
      case 'medium':
        return 'text-blue-400 bg-blue-900/20 border-blue-700/50';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />;
      case 'high':
        return <AlertTriangle className="w-3 h-3" />;
      case 'medium':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <CheckCircle className="w-3 h-3" />;
    }
  };

  const getDeploymentStatus = () => {
    if (deploymentScore >= 90) return { status: 'ready', color: 'text-green-400', message: 'Ready for Production' };
    if (deploymentScore >= 70) return { status: 'almost', color: 'text-yellow-400', message: 'Almost Ready' };
    if (deploymentScore >= 50) return { status: 'progress', color: 'text-blue-400', message: 'In Progress' };
    return { status: 'not-ready', color: 'text-red-400', message: 'Not Ready' };
  };

  const deploymentStatus = getDeploymentStatus();

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Rocket className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Deployment Checklist</h3>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${deploymentStatus?.color}`}>
            {deploymentScore}%
          </div>
          <div className="text-xs text-gray-400">{deploymentStatus?.message}</div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Deployment Progress</span>
          <span className="text-sm text-gray-400">
            {Object.values(checkedItems)?.filter(Boolean)?.length} / {checklistItems?.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${deploymentScore}%` }}
          ></div>
        </div>
      </div>
      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems?.map((item) => (
          <div
            key={item?.id}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              checkedItems?.[item?.id] 
                ? 'bg-green-900/20 border-green-700/50' :'bg-slate-900/50 border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => toggleItem(item?.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {checkedItems?.[item?.id] ? (
                  <CheckSquare className="w-5 h-5 text-green-400" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-medium ${checkedItems?.[item?.id] ? 'text-green-300' : 'text-white'}`}>
                    {item?.title}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item?.priority)}`}>
                    {getPriorityIcon(item?.priority)}
                    <span className="ml-1">{item?.priority?.toUpperCase()}</span>
                  </span>
                  {item?.autoCheck && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400 border border-blue-700/50">
                      Auto
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{item?.description}</p>
                
                <div className="bg-gray-900 rounded p-2">
                  <code className="text-xs text-green-400">{item?.command}</code>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Deployment Status */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {deploymentStatus?.status === 'ready' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="font-medium text-white">Production Readiness</span>
          </div>
          <div className={`font-medium ${deploymentStatus?.color}`}>
            {deploymentStatus?.message}
          </div>
        </div>
        
        {deploymentScore >= 90 && (
          <div className="mt-3 p-3 bg-green-900/20 rounded-lg border border-green-700/50">
            <div className="text-sm text-green-300">
              🚀 Your API infrastructure is ready for production deployment!
            </div>
          </div>
        )}
        
        {deploymentScore < 90 && (
          <div className="mt-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
            <div className="text-sm text-yellow-300">
              ⚠️ Complete remaining critical items before deploying to production.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}