import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Calendar, Table, Download, Upload, Plus, Filter, Search, Clock, AlertCircle, CheckCircle2, Circle, Target } from 'lucide-react';
import KanbanView from './components/KanbanView';
import GanttView from './components/GanttView';
import TableView from './components/TableView';
import TaskEditModal from './components/TaskEditModal';
import ImportModal from './components/ImportModal';
import StatsPanel from './components/StatsPanel';
import projectManagementService from '../../services/projectManagementService';

const ProjectManagementCockpit = () => {
  // State management
  const [currentView, setCurrentView] = useState('kanban');
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    phase: '',
    status: '',
    priority: '',
    responsible: '',
    search: '',
    showOverdue: false
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data
  useEffect(() => {
    loadProjects();
  }, []);

  // Load project tasks when project changes
  useEffect(() => {
    if (currentProject?.id) {
      loadProjectTasks(currentProject?.id);
      loadProjectStats(currentProject?.id);
    }
  }, [currentProject]);

  // Apply filters when tasks or filters change
  useEffect(() => {
    applyFilters();
  }, [tasks, filters, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await projectManagementService?.getProjects('current_user_id');
      
      if (error) {
        setError(error);
        return;
      }

      setProjects(data || []);
      if (data?.length > 0) {
        setCurrentProject(data?.[0]);
      }
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projectId) => {
    try {
      const { data, error } = await projectManagementService?.getProjectTasks(projectId);
      
      if (error) {
        setError(error);
        return;
      }

      setTasks(data || []);
    } catch (err) {
      setError(err?.message);
    }
  };

  const loadProjectStats = async (projectId) => {
    try {
      const { data, error } = await projectManagementService?.getProjectStats(projectId);
      
      if (error) {
        console.warn('Stats not available:', error);
        return;
      }

      setProjectStats(data);
    } catch (err) {
      console.warn('Failed to load stats:', err?.message);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    // Apply search
    if (searchTerm?.trim()) {
      filtered = filtered?.filter(task =>
        task?.task_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        task?.notes?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        task?.responsible?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Apply filters
    if (filters?.phase) {
      filtered = filtered?.filter(task => task?.phase === filters?.phase);
    }

    if (filters?.status) {
      filtered = filtered?.filter(task => task?.status === filters?.status);
    }

    if (filters?.priority) {
      filtered = filtered?.filter(task => task?.priority === filters?.priority);
    }

    if (filters?.responsible?.trim()) {
      filtered = filtered?.filter(task =>
        task?.responsible?.toLowerCase()?.includes(filters?.responsible?.toLowerCase())
      );
    }

    if (filters?.showOverdue) {
      const now = new Date();
      filtered = filtered?.filter(task =>
        task?.due_date && 
        new Date(task.due_date) < now && 
        task?.status !== 'termine'
      );
    }

    setFilteredTasks(filtered);
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const { error } = await projectManagementService?.updateTask(taskId, updates);
      
      if (error) {
        setError(error);
        return;
      }

      // Refresh data
      await loadProjectTasks(currentProject?.id);
      await loadProjectStats(currentProject?.id);
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      if (!currentProject?.id) return;

      const { error } = await projectManagementService?.createTask({
        ...taskData,
        project_id: currentProject?.id
      });
      
      if (error) {
        setError(error);
        return;
      }

      // Refresh data
      await loadProjectTasks(currentProject?.id);
      await loadProjectStats(currentProject?.id);
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      const { error } = await projectManagementService?.deleteTask(taskId);
      
      if (error) {
        setError(error);
        return;
      }

      // Refresh data
      await loadProjectTasks(currentProject?.id);
      await loadProjectStats(currentProject?.id);
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleCSVExport = async () => {
    try {
      if (!currentProject?.id) return;

      const { data, error } = await projectManagementService?.exportTasksToCSV(currentProject?.id);
      
      if (error) {
        setError(error);
        return;
      }

      // Download CSV file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL?.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject?.name}-tasks.csv`;
      link?.click();
      window.URL?.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleCSVImport = async (csvData) => {
    try {
      if (!currentProject?.id) return;

      const { data, error } = await projectManagementService?.importTasksFromCSV(
        currentProject?.id,
        csvData,
        'current_user_id'
      );
      
      if (error) {
        setError(error);
        return;
      }

      // Show import results
      const message = `Import terminé: ${data?.imported || 0} tâches importées, ${data?.failed || 0} échecs`;
      alert(message);

      // Refresh data
      await loadProjectTasks(currentProject?.id);
      await loadProjectStats(currentProject?.id);
      setShowImportModal(false);
    } catch (err) {
      setError(err?.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'partiel':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'termine':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'haute':
        return 'text-red-400 bg-red-400/10';
      case 'moyenne':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'basse':
        return 'text-green-400 bg-green-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du cockpit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Title and Project Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">MVP Trading Bot</h1>
                  <p className="text-sm text-gray-400">Cockpit de Déploiement</p>
                </div>
              </div>
              
              {projects?.length > 1 && (
                <select
                  value={currentProject?.id || ''}
                  onChange={(e) => {
                    const project = projects?.find(p => p?.id === e?.target?.value);
                    setCurrentProject(project);
                  }}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {projects?.map(project => (
                    <option key={project?.id} value={project?.id}>
                      {project?.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Stats Badges */}
            <StatsPanel stats={projectStats} />

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </button>
              
              <button
                onClick={handleCSVExport}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Tâche</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 border-b border-gray-700">
            {[
              { id: 'kanban', label: 'Kanban', icon: BarChart3 },
              { id: 'gantt', label: 'Gantt', icon: Calendar },
              { id: 'table', label: 'Tableau', icon: Table }
            ]?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setCurrentView(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  currentView === tab?.id
                    ? 'border-blue-400 text-blue-400' :'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab?.label}</span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher des tâches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                
                <select
                  value={filters?.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e?.target?.value }))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="todo">À faire</option>
                  <option value="partiel">Partiel</option>
                  <option value="termine">Terminé</option>
                </select>
                
                <select
                  value={filters?.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e?.target?.value }))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">Toutes priorités</option>
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                </select>
                
                <select
                  value={filters?.phase}
                  onChange={(e) => setFilters(prev => ({ ...prev, phase: e?.target?.value }))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">Toutes phases</option>
                  <option value="dns_ssl">DNS & SSL</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="deployment">Deployment</option>
                  <option value="testing">Testing</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters?.showOverdue}
                  onChange={(e) => setFilters(prev => ({ ...prev, showOverdue: e?.target?.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-gray-300">Retard uniquement</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'kanban' && (
              <KanbanView
                tasks={filteredTasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
                onTaskDelete={handleTaskDelete}
                getStatusIcon={getStatusIcon}
                getPriorityColor={getPriorityColor}
              />
            )}
            
            {currentView === 'gantt' && (
              <GanttView
                tasks={filteredTasks}
                onTaskEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
                getPriorityColor={getPriorityColor}
              />
            )}
            
            {currentView === 'table' && (
              <TableView
                tasks={filteredTasks}
                onTaskEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
                onTaskDelete={handleTaskDelete}
                onTaskUpdate={handleTaskUpdate}
                getStatusIcon={getStatusIcon}
                getPriorityColor={getPriorityColor}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Modals */}
      <TaskEditModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={editingTask ? handleTaskUpdate : handleTaskCreate}
      />
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
};

export default ProjectManagementCockpit;