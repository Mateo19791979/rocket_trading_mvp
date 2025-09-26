import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Circle, Clock, AlertTriangle, Server, Shield, Rocket, BarChart3, FileText, Target, Download } from 'lucide-react';
import Header from '../../components/ui/Header';

const GlobalAITraderRoadmapChecklist = () => {
  const [checkedItems, setCheckedItems] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [activeItem, setActiveItem] = useState('roadmap');

  useEffect(() => {
    // Auto-generate current date
    const now = new Date();
    const formatted = now?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    });
    setCurrentDate(formatted);
  }, []);

  const handleItemCheck = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev?.[itemId]
    }));
  };

  const weeklyTasks = {
    week1: {
      title: "Semaine 1 — Fondations",
      icon: Server,
      color: "bg-blue-600",
      tasks: [
        {
          id: "services-folder",
          text: "Ajouter dossier /services (+5 micro-APIs) au repo",
          priority: "high"
        },
        {
          id: "docker-compose",
          text: "docker-compose.yml (ports 18000–18005) à la racine",
          priority: "high"
        },
        {
          id: "env-example",
          text: ".env.example (front + back) : VITE_SUPABASE_*, CORS_ORIGIN, IB_HOST/PORT/CLIENT_ID",
          priority: "medium"
        },
        {
          id: "agent-status-grid",
          text: "Brancher AgentStatusGrid → /status (live, plus de mock)",
          priority: "high"
        }
      ]
    },
    week2: {
      title: "Semaine 2 — Données & Sécurité",
      icon: Shield,
      color: "bg-orange-600",
      tasks: [
        {
          id: "ibkr-feed",
          text: "Remplacer mock CSV par feed IBKR (lecture) dans Data Phoenix",
          priority: "high"
        },
        {
          id: "supabase-rls",
          text: "Activer RLS Supabase + policies minimales (lecture par user)",
          priority: "high"
        },
        {
          id: "cors-security",
          text: "Durcir CORS + rate-limit /orders ; audit logs",
          priority: "medium"
        }
      ]
    },
    week3: {
      title: "Semaine 3 — Démo & Scale",
      icon: Rocket,
      color: "bg-teal-600",
      tasks: [
        {
          id: "mvp-unified",
          text: "Page \"MVP Unified\" (Poster + Kanban + Bus Monitor) dans Rocket.new",
          priority: "high"
        },
        {
          id: "auto-refresh",
          text: "Auto-refresh 30s, export PDF",
          priority: "medium"
        },
        {
          id: "pre-prod",
          text: "Pré-prod: smoke tests, latence, uptime, fallback IBKR",
          priority: "high"
        }
      ]
    }
  };

  const definitionOfDone = [
    "/status live affiché dans Rocket.new",
    "2 stratégies simples → signaux réels", 
    "Plan d'action /plan cohérent (WAIT/OPEN_LONG_CALL/REDUCE)",
    "Export PDF démo + logs minimal"
  ];

  const kpis = [
    { label: "Uptime dashboard", target: ">95%", current: "97.2%", status: "good" },
    { label: "Temps réponse /status", target: "< 400 ms", current: "287 ms", status: "good" },
    { label: "Démos bout-à-bout", target: "2", current: "1", status: "warning" }
  ];

  const getCompletionPercentage = (weekTasks) => {
    const completed = weekTasks?.filter(task => checkedItems?.[task?.id])?.length || 0;
    return Math.round((completed / weekTasks?.length) * 100);
  };

  const getOverallProgress = () => {
    const allTasks = Object.values(weeklyTasks)?.flatMap(week => week?.tasks);
    const completed = allTasks?.filter(task => checkedItems?.[task?.id])?.length || 0;
    return Math.round((completed / allTasks?.length) * 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            GlobalAI Trader — Roadmap & Checklist
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Ordre d'exécution concret (2–3 semaines)
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Progression Générale</h2>
            <span className="text-2xl font-bold text-blue-400">{getOverallProgress()}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Weekly Tasks */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Target className="w-6 h-6 mr-3 text-blue-400" />
              Planning d'Exécution
            </h2>

            {Object.entries(weeklyTasks)?.map(([weekKey, week]) => {
              const IconComponent = week?.icon;
              const completion = getCompletionPercentage(week?.tasks);
              
              return (
                <div key={weekKey} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  {/* Week Header */}
                  <div className={`${week?.color} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-6 h-6 text-white" />
                        <h3 className="text-lg font-semibold text-white">{week?.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{completion}%</span>
                        <div className="w-12 bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tasks List */}
                  <div className="p-4 space-y-3">
                    {week?.tasks?.map((task, index) => (
                      <div key={task?.id} className="flex items-start space-x-3 group">
                        <button
                          onClick={() => handleItemCheck(task?.id)}
                          className="mt-0.5 transition-colors"
                        >
                          {checkedItems?.[task?.id] ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-400">
                              {index + 1})
                            </span>
                            <AlertTriangle className={`w-4 h-4 ${getPriorityColor(task?.priority)}`} />
                          </div>
                          <p className={`text-sm leading-relaxed transition-colors ${
                            checkedItems?.[task?.id] 
                              ? 'text-gray-500 line-through' : 'text-gray-200'
                          }`}>
                            {task?.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Definition of Done & KPIs */}
          <div className="space-y-6">
            {/* Definition of Done */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                Definition of Done (MVP)
              </h3>
              <div className="space-y-3">
                {definitionOfDone?.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-200 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* KPIs Section */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                KPIs
              </h3>
              <div className="space-y-4">
                {kpis?.map((kpi, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-200 font-medium">{kpi?.label}</span>
                      <span className={`font-semibold ${getStatusColor(kpi?.status)}`}>
                        {kpi?.current}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Cible: {kpi?.target}</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          kpi?.status === 'good' ? 'bg-green-400' :
                          kpi?.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export & Actions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-orange-400" />
                Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Exporter en PDF</span>
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors text-sm">
                    Sauvegarder
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg transition-colors text-sm">
                    Partager
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Status */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-teal-400" />
                Statut Temps Réel
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-200">Services actifs</span>
                  <span className="text-green-400 font-semibold">3/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-200">Pipeline CI/CD</span>
                  <span className="text-yellow-400 font-semibold">En cours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-200">Tests E2E</span>
                  <span className="text-red-400 font-semibold">Échec</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAITraderRoadmapChecklist;