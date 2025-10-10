import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Target,
  TrendingUp
} from 'lucide-react';



const StatsPanel = ({ stats }) => {
  const calculateProgress = () => {
    const total = stats?.total_tasks || 0;
    const completed = stats?.termine_tasks || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const StatBadge = ({ icon, value, label, color = 'text-gray-400', bgColor = 'bg-gray-700' }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${bgColor} rounded-lg px-3 py-2 flex items-center space-x-2 min-w-24`}
    >
      {React.createElement(icon, { className: `w-4 h-4 ${color}` })}
      <div className="text-center">
        <div className={`text-lg font-bold ${color}`}>
          {value || 0}
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {label}
        </div>
      </div>
    </motion.div>
  );

  const progress = calculateProgress();
  const progressColor = getProgressColor(progress);

  return (
    <div className="flex items-center space-x-4">
      {/* Progress Circle */}
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            className="text-gray-700"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            d="M18 3.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Progress circle */}
          <path
            className={progressColor}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${progress}, 100`}
            d="M18 3.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${progressColor}`}>
            {progress}%
          </span>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="flex items-center space-x-2">
        <StatBadge
          icon={BarChart3}
          value={stats?.total_tasks}
          label="Total"
          color="text-blue-400"
          bgColor="bg-blue-900/20"
        />

        <StatBadge
          icon={Clock}
          value={stats?.todo_tasks}
          label="À faire"
          color="text-gray-400"
          bgColor="bg-gray-700"
        />

        <StatBadge
          icon={TrendingUp}
          value={stats?.partiel_tasks}
          label="Partiel"
          color="text-yellow-400"
          bgColor="bg-yellow-900/20"
        />

        <StatBadge
          icon={CheckCircle2}
          value={stats?.termine_tasks}
          label="Terminé"
          color="text-green-400"
          bgColor="bg-green-900/20"
        />

        {stats?.overdue_tasks > 0 && (
          <StatBadge
            icon={AlertTriangle}
            value={stats?.overdue_tasks}
            label="Retard"
            color="text-red-400"
            bgColor="bg-red-900/20"
          />
        )}
      </div>

      {/* Completion Message */}
      {stats?.total_tasks > 0 && (
        <div className="text-sm text-gray-400">
          {progress === 100 ? (
            <div className="flex items-center space-x-1 text-green-400">
              <Target className="w-4 h-4" />
              <span className="font-medium">Projet terminé!</span>
            </div>
          ) : (
            <div>
              {stats?.termine_tasks || 0} / {stats?.total_tasks || 0} tâches
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsPanel;