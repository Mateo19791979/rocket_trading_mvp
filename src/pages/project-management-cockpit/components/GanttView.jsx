import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, AlertTriangle } from 'lucide-react';

const GanttView = ({ tasks, onTaskEdit, getPriorityColor }) => {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate time scale based on view mode
  const timeScale = useMemo(() => {
    const scale = [];
    const startDate = new Date(currentDate);
    const periods = viewMode === 'week' ? 7 : 30;
    
    if (viewMode === 'week') {
      // Start from beginning of week
      startDate?.setDate(startDate?.getDate() - startDate?.getDay());
    } else {
      // Start from beginning of month
      startDate?.setDate(1);
    }

    for (let i = 0; i < periods; i++) {
      const date = new Date(startDate);
      date?.setDate(startDate?.getDate() + i);
      scale?.push(date);
    }
    
    return scale;
  }, [currentDate, viewMode]);

  const navigateTime = (direction) => {
    const newDate = new Date(currentDate);
    const amount = viewMode === 'week' ? 7 : 30;
    newDate?.setDate(newDate?.getDate() + (direction === 'next' ? amount : -amount));
    setCurrentDate(newDate);
  };

  const formatTimeHeader = (date) => {
    if (viewMode === 'week') {
      return date?.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short'
      });
    } else {
      return date?.toLocaleDateString('fr-FR', { 
        day: 'numeric'
      });
    }
  };

  const getTaskPosition = (task) => {
    if (!task?.due_date) return { left: '0%', width: '50px' };
    
    const taskDate = new Date(task.due_date);
    const startDate = timeScale?.[0];
    const endDate = timeScale?.[timeScale?.length - 1];
    
    // Calculate position as percentage
    const totalDuration = endDate?.getTime() - startDate?.getTime();
    const taskOffset = taskDate?.getTime() - startDate?.getTime();
    const leftPercent = Math.max(0, Math.min(100, (taskOffset / totalDuration) * 100));
    
    return {
      left: `${leftPercent}%`,
      width: '4px' // Milestone style for now
    };
  };

  const isOverdue = (task) => {
    if (!task?.due_date || task?.status === 'termine') return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'Pas de date';
    return new Date(dueDate)?.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const TaskBar = ({ task }) => {
    const position = getTaskPosition(task);
    const overdue = isOverdue(task);
    
    return (
      <div className="relative">
        {/* Task timeline indicator */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 rounded-full ${
            task?.status === 'termine' ? 'bg-green-400' :
            task?.status === 'partiel'? 'bg-yellow-400' : overdue ?'bg-red-400' : 'bg-gray-400'
          } ${position?.width === '4px' ? 'w-4 h-4' : 'h-6'} cursor-pointer hover:scale-110 transition-transform z-10`}
          style={{ left: position?.left }}
          onClick={() => onTaskEdit?.(task)}
          title={`${task?.task_name} - ${formatDueDate(task?.due_date)}`}
        />
        {/* Extended bar for duration (if we add duration support later) */}
        {position?.width !== '4px' && (
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 rounded ${
              task?.status === 'termine' ? 'bg-green-400/30 border-green-400' :
              task?.status === 'partiel'? 'bg-yellow-400/30 border-yellow-400' : overdue ?'bg-red-400/30 border-red-400' : 'bg-gray-400/30 border-gray-400'
            } border h-6`}
            style={{ left: position?.left, width: position?.width }}
          />
        )}
      </div>
    );
  };

  // Group tasks by phase for better organization
  const tasksByPhase = useMemo(() => {
    const grouped = {};
    tasks?.forEach(task => {
      const phase = task?.phase || 'other';
      if (!grouped?.[phase]) {
        grouped[phase] = [];
      }
      grouped?.[phase]?.push(task);
    });
    return grouped;
  }, [tasks]);

  const phaseLabels = {
    dns_ssl: 'DNS & SSL',
    infrastructure: 'Infrastructure',
    monitoring: 'Monitoring',
    deployment: 'Déploiement',
    testing: 'Tests',
    security: 'Sécurité',
    compliance: 'Conformité',
    documentation: 'Documentation'
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span>Vue Gantt</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'week' ?'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'month' ?'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Mois
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateTime('prev')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            
            <span className="text-white font-medium min-w-32 text-center">
              {currentDate?.toLocaleDateString('fr-FR', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            
            <button
              onClick={() => navigateTime('next')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-gray-400">À faire</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">Partiel</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Terminé</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded-full"></div>
            <span className="text-gray-400">En retard</span>
          </div>
        </div>
      </div>
      {/* Timeline */}
      <div className="flex border-b border-gray-700">
        {/* Task names column */}
        <div className="w-80 bg-gray-800/50 border-r border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">TÂCHES</h3>
        </div>
        
        {/* Time scale */}
        <div className="flex-1 relative">
          <div className="flex border-b border-gray-700">
            {timeScale?.map((date, index) => (
              <div
                key={index}
                className="flex-1 p-2 text-center border-r border-gray-700 last:border-r-0"
              >
                <span className="text-xs text-gray-400">
                  {formatTimeHeader(date)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Today indicator */}
          <div className="absolute top-0 bottom-0 w-px bg-blue-400 z-20" 
               style={{ 
                 left: `${((new Date()?.getTime() - timeScale?.[0]?.getTime()) / 
                          (timeScale?.[timeScale?.length - 1]?.getTime() - timeScale?.[0]?.getTime())) * 100}%` 
               }}>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-400 text-white text-xs px-1 rounded">
              Aujourd'hui
            </div>
          </div>
        </div>
      </div>
      {/* Task rows */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(tasksByPhase)?.map(([phase, phaseTasks]) => (
          <div key={phase}>
            {/* Phase header */}
            <div className="border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex">
                <div className="w-80 p-3 border-r border-gray-700">
                  <h4 className="font-semibold text-blue-400 text-sm uppercase tracking-wide">
                    {phaseLabels?.[phase] || phase}
                  </h4>
                  <p className="text-xs text-gray-500">{phaseTasks?.length} tâche(s)</p>
                </div>
                <div className="flex-1 relative bg-gray-900/20"></div>
              </div>
            </div>
            
            {/* Phase tasks */}
            {phaseTasks?.map((task) => (
              <motion.div
                key={task?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex">
                  {/* Task info */}
                  <div className="w-80 p-3 border-r border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm text-white font-medium truncate flex-1 mr-2">
                        {task?.task_name}
                      </h5>
                      <div className={`w-2 h-2 rounded-full ${
                        task?.priority === 'haute' ? 'bg-red-400' :
                        task?.priority === 'moyenne' ? 'bg-yellow-400' : 'bg-green-400'
                      }`} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span className="truncate">{task?.responsible}</span>
                      </div>
                      
                      {task?.due_date && (
                        <div className={`flex items-center space-x-1 ${
                          isOverdue(task) ? 'text-red-400' : ''
                        }`}>
                          {isOverdue(task) && <AlertTriangle className="w-3 h-3" />}
                          <Clock className="w-3 h-3" />
                          <span>{formatDueDate(task?.due_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="flex-1 relative h-16 bg-gray-900/20">
                    <TaskBar task={task} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
        
        {/* Empty state */}
        {Object.keys(tasksByPhase)?.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucune tâche à afficher</h3>
            <p className="text-sm">Ajoutez des tâches pour voir la timeline du projet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttView;