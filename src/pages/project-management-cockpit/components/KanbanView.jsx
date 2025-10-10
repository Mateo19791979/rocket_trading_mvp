import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { User, AlertTriangle, Calendar, MoreVertical, Edit3, Trash2, Flag } from 'lucide-react';

const KanbanView = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskEdit, 
  onTaskDelete, 
  getStatusIcon, 
  getPriorityColor 
}) => {
  const columns = [
    { 
      id: 'todo', 
      title: 'À faire', 
      color: 'border-gray-600 bg-gray-800/30',
      headerColor: 'text-gray-400' 
    },
    { 
      id: 'partiel', 
      title: 'Partiel', 
      color: 'border-yellow-600 bg-yellow-900/10',
      headerColor: 'text-yellow-400' 
    },
    { 
      id: 'termine', 
      title: 'Terminé', 
      color: 'border-green-600 bg-green-900/10',
      headerColor: 'text-green-400' 
    }
  ];

  const getTasksByStatus = (status) => {
    return tasks?.filter(task => task?.status === status) || [];
  };

  const handleDragEnd = async (taskId, newStatus) => {
    try {
      await onTaskUpdate?.(taskId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const isOverdue = (task) => {
    if (!task?.due_date || task?.status === 'termine') return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date?.getTime() - now?.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays === -1) return "Hier";
    if (diffDays < 0) return `${Math.abs(diffDays)} jours de retard`;
    return `Dans ${diffDays} jours`;
  };

  const TaskCard = ({ task }) => {
    const [showMenu, setShowMenu] = React.useState(false);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.02 }}
        className={`bg-gray-800 rounded-lg border ${
          isOverdue(task) ? 'border-red-500 bg-red-900/10' : 'border-gray-700'
        } p-4 cursor-move hover:border-gray-600 transition-all relative group`}
      >
        {/* Priority Indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
          task?.priority === 'haute' ? 'bg-red-400' :
          task?.priority === 'moyenne' ? 'bg-yellow-400' : 'bg-green-400'
        }`} />
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            {getStatusIcon?.(task?.status)}
            <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-300 font-medium">
              {task?.phase?.replace('_', ' ')?.toUpperCase()}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e?.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-gray-700 rounded-lg border border-gray-600 shadow-lg z-10 min-w-32">
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onTaskEdit?.(task);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded-t-lg"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Éditer</span>
                </button>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onTaskDelete?.(task?.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-600 rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Task Title */}
        <h3 className="font-medium text-white mb-2 line-clamp-2 pr-4">
          {task?.task_name}
        </h3>
        {/* Task Notes */}
        {task?.notes && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {task?.notes}
          </p>
        )}
        {/* Task Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <User className="w-3 h-3" />
            <span className="truncate max-w-20">{task?.responsible}</span>
          </div>

          {task?.due_date && (
            <div className={`flex items-center space-x-1 ${
              isOverdue(task) ? 'text-red-400' : 'text-gray-400'
            }`}>
              {isOverdue(task) && <AlertTriangle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              <span>{formatDueDate(task?.due_date)}</span>
            </div>
          )}
        </div>
        {/* Overdue Badge */}
        {isOverdue(task) && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            RETARD
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns?.map((column) => {
        const columnTasks = getTasksByStatus(column?.id);
        
        return (
          <div key={column?.id} className={`rounded-lg border ${column?.color} p-4 min-h-96`}>
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-4 ${column?.headerColor}`}>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg">{column?.title}</h2>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full font-medium">
                  {columnTasks?.length || 0}
                </span>
              </div>
              
              {column?.id === 'todo' && (
                <div className="flex items-center space-x-1 text-xs">
                  <Flag className="w-3 h-3" />
                  <span>{columnTasks?.filter(task => isOverdue(task))?.length || 0} retard</span>
                </div>
              )}
            </div>
            {/* Task List */}
            <Reorder.Group
              axis="y"
              values={columnTasks}
              onReorder={() => {}} // Handle reordering within column if needed
              className="space-y-3"
            >
              {columnTasks?.map((task) => (
                <Reorder.Item
                  key={task?.id}
                  value={task}
                  drag={false} // Disable dragging for now, can be enabled for advanced drag & drop
                  className="cursor-pointer"
                  onClick={() => onTaskEdit?.(task)}
                >
                  <TaskCard task={task} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {/* Empty State */}
            {columnTasks?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  {getStatusIcon?.(column?.id)}
                </div>
                <p className="text-sm">Aucune tâche</p>
                <p className="text-xs mt-1">Les tâches apparaîtront ici</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;