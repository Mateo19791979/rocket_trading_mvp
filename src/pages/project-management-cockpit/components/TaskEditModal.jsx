import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Flag, Clock, FileText } from 'lucide-react';

const TaskEditModal = ({ isOpen, onClose, task, onSave }) => {
  const [formData, setFormData] = useState({
    phase: 'documentation',
    task_name: '',
    responsible: '',
    status: 'todo',
    priority: 'moyenne',
    deadline_days: 1,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Initialize form data when task or modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setFormData({
          phase: task?.phase || 'documentation',
          task_name: task?.task_name || '',
          responsible: task?.responsible || '',
          status: task?.status || 'todo',
          priority: task?.priority || 'moyenne',
          deadline_days: task?.deadline_days || 1,
          notes: task?.notes || ''
        });
      } else {
        // Creating new task
        setFormData({
          phase: 'documentation',
          task_name: '',
          responsible: '',
          status: 'todo',
          priority: 'moyenne',
          deadline_days: 1,
          notes: ''
        });
      }
      setErrors({});
    }
  }, [task, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.task_name?.trim()) {
      newErrors.task_name = 'Le nom de la tâche est requis';
    }

    if (!formData?.responsible?.trim()) {
      newErrors.responsible = 'Le responsable est requis';
    }

    if (!formData?.deadline_days || formData?.deadline_days < 1) {
      newErrors.deadline_days = 'L\'échéance doit être au moins 1 jour';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (task) {
        // Update existing task
        await onSave?.(task?.id, formData);
      } else {
        // Create new task
        await onSave?.(formData);
      }
      
      onClose?.();
    } catch (error) {
      console.error('Failed to save task:', error);
      // You might want to show an error message here
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose?.();
    }
  };

  const phaseOptions = [
    { value: 'dns_ssl', label: 'DNS & SSL' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'deployment', label: 'Déploiement' },
    { value: 'testing', label: 'Tests' },
    { value: 'security', label: 'Sécurité' },
    { value: 'compliance', label: 'Conformité' },
    { value: 'documentation', label: 'Documentation' }
  ];

  const statusOptions = [
    { value: 'todo', label: 'À faire' },
    { value: 'partiel', label: 'Partiel' },
    { value: 'termine', label: 'Terminé' }
  ];

  const priorityOptions = [
    { value: 'haute', label: 'Haute' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'basse', label: 'Basse' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="w-full max-w-2xl bg-gray-800 rounded-xl border border-gray-700 shadow-2xl"
              onClick={(e) => e?.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <span>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</span>
                </h2>
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de la tâche *
                  </label>
                  <input
                    type="text"
                    value={formData?.task_name}
                    onChange={(e) => handleChange('task_name', e?.target?.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.task_name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Décrivez la tâche à accomplir..."
                  />
                  {errors?.task_name && (
                    <p className="mt-1 text-sm text-red-400">{errors?.task_name}</p>
                  )}
                </div>

                {/* Row 1: Phase and Responsible */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phase
                    </label>
                    <select
                      value={formData?.phase}
                      onChange={(e) => handleChange('phase', e?.target?.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {phaseOptions?.map(option => (
                        <option key={option?.value} value={option?.value}>
                          {option?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Responsable *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData?.responsible}
                        onChange={(e) => handleChange('responsible', e?.target?.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors?.responsible ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Qui est responsable?"
                      />
                    </div>
                    {errors?.responsible && (
                      <p className="mt-1 text-sm text-red-400">{errors?.responsible}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData?.status}
                      onChange={(e) => handleChange('status', e?.target?.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions?.map(option => (
                        <option key={option?.value} value={option?.value}>
                          {option?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priorité
                    </label>
                    <div className="relative">
                      <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={formData?.priority}
                        onChange={(e) => handleChange('priority', e?.target?.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {priorityOptions?.map(option => (
                          <option key={option?.value} value={option?.value}>
                            {option?.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Échéance (jours) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      min="1"
                      value={formData?.deadline_days}
                      onChange={(e) => handleChange('deadline_days', parseInt(e?.target?.value) || 1)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors?.deadline_days ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Nombre de jours"
                    />
                  </div>
                  {errors?.deadline_days && (
                    <p className="mt-1 text-sm text-red-400">{errors?.deadline_days}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-400">
                    Échéance calculée: {new Date(Date.now() + formData.deadline_days * 24 * 60 * 60 * 1000)?.toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes et détails
                  </label>
                  <textarea
                    value={formData?.notes}
                    onChange={(e) => handleChange('notes', e?.target?.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ajoutez des détails, liens, ou instructions supplémentaires..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={saving}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{task ? 'Modifier' : 'Créer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskEditModal;