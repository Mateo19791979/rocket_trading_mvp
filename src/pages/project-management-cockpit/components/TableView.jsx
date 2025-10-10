import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Edit3, Trash2, Calendar, User, AlertTriangle, Filter, MoreVertical } from 'lucide-react';

const TableView = ({ 
  tasks, 
  onTaskEdit, 
  onTaskDelete, 
  onTaskUpdate, 
  getStatusIcon, 
  getPriorityColor 
}) => {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    
    return [...tasks]?.sort((a, b) => {
      let aVal = a?.[sortField];
      let bVal = b?.[sortField];
      
      // Handle different data types
      if (sortField === 'due_date' || sortField === 'created_at') {
        aVal = aVal ? new Date(aVal)?.getTime() : 0;
        bVal = bVal ? new Date(bVal)?.getTime() : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tasks, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected?.has(taskId)) {
      newSelected?.delete(taskId);
    } else {
      newSelected?.add(taskId);
    }
    setSelectedTasks(newSelected);
    setShowBulkActions(newSelected?.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedTasks?.size === sortedTasks?.length) {
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(sortedTasks?.map(task => task?.id));
      setSelectedTasks(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const promises = Array.from(selectedTasks)?.map(taskId =>
        onTaskUpdate?.(taskId, { status: newStatus })
      );
      await Promise.all(promises);
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const isOverdue = (task) => {
    if (!task?.due_date || task?.status === 'termine') return false;
    return new Date(task.due_date) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPhase = (phase) => {
    const phaseMap = {
      dns_ssl: 'DNS & SSL',
      infrastructure: 'Infrastructure',
      monitoring: 'Monitoring',
      deployment: 'Déploiement',
      testing: 'Tests',
      security: 'Sécurité',
      compliance: 'Conformité',
      documentation: 'Documentation'
    };
    return phaseMap?.[phase] || phase;
  };

  const formatStatus = (status) => {
    const statusMap = {
      todo: 'À faire',
      partiel: 'Partiel',
      termine: 'Terminé'
    };
    return statusMap?.[status] || status;
  };

  const formatPriority = (priority) => {
    const priorityMap = {
      haute: 'Haute',
      moyenne: 'Moyenne',
      basse: 'Basse'
    };
    return priorityMap?.[priority] || priority;
  };

  const SortableHeader = ({ field, children, className = '' }) => (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <div className="text-blue-400">
            {sortDirection === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
    </th>
  );

  const StatusBadge = ({ status, task }) => (
    <div className="flex items-center space-x-2">
      {getStatusIcon?.(status)}
      <select
        value={status}
        onChange={(e) => onTaskUpdate?.(task?.id, { status: e?.target?.value })}
        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={(e) => e?.stopPropagation()}
      >
        <option value="todo">À faire</option>
        <option value="partiel">Partiel</option>
        <option value="termine">Terminé</option>
      </select>
    </div>
  );

  const PriorityBadge = ({ priority }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor?.(priority)}`}>
      {formatPriority(priority)}
    </span>
  );

  const ActionMenu = ({ task }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e?.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
        {isOpen && (
          <div className="absolute right-0 top-8 bg-gray-700 rounded-lg border border-gray-600 shadow-lg z-10 min-w-32">
            <button
              onClick={(e) => {
                e?.stopPropagation();
                onTaskEdit?.(task);
                setIsOpen(false);
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
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-600 rounded-b-lg"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-900/20 border-b border-blue-900/50 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-300 font-medium">
                {selectedTasks?.size} tâche(s) sélectionnée(s)
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Actions groupées:</span>
                <button
                  onClick={() => handleBulkStatusUpdate('todo')}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                >
                  → À faire
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('partiel')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm"
                >
                  → Partiel
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('termine')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                >
                  → Terminé
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedTasks(new Set());
                setShowBulkActions(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedTasks?.size === sortedTasks?.length && sortedTasks?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <SortableHeader field="phase">Phase</SortableHeader>
              <SortableHeader field="task_name">Tâche</SortableHeader>
              <SortableHeader field="responsible">Responsable</SortableHeader>
              <SortableHeader field="status">Statut</SortableHeader>
              <SortableHeader field="priority">Priorité</SortableHeader>
              <SortableHeader field="due_date">Échéance</SortableHeader>
              <SortableHeader field="deadline_days">J+X</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedTasks?.map((task) => (
              <motion.tr
                key={task?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`hover:bg-gray-700 transition-colors cursor-pointer ${
                  isOverdue(task) ? 'bg-red-900/10 border-l-4 border-red-500' : ''
                } ${selectedTasks?.has(task?.id) ? 'bg-blue-900/20' : ''}`}
                onClick={() => onTaskEdit?.(task)}
              >
                <td className="px-6 py-4" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedTasks?.has(task?.id)}
                    onChange={() => handleSelectTask(task?.id)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                    {formatPhase(task?.phase)}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {isOverdue(task) && <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-medium text-white line-clamp-2">
                        {task?.task_name}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{task?.responsible}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e?.stopPropagation()}>
                  <StatusBadge status={task?.status} task={task} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={task?.priority} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center space-x-1 text-sm ${
                    isOverdue(task) ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(task?.due_date)}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-400">
                    J+{task?.deadline_days || 0}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400 line-clamp-2 max-w-xs">
                    {task?.notes || '-'}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e?.stopPropagation()}>
                  <ActionMenu task={task} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {sortedTasks?.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-400">Modifiez vos filtres ou ajoutez de nouvelles tâches</p>
        </div>
      )}
    </div>
  );
};

export default TableView;