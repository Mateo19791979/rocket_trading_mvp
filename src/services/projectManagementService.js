import { supabase } from '../lib/supabase.js';

class ProjectManagementService {
  // Project CRUD operations
  async getProjects(userId) {
    try {
      const { data, error } = await supabase?.from('projects')?.select(`
          *,
          project_stats(total_tasks, todo_tasks, partiel_tasks, termine_tasks, overdue_tasks)
        `)?.eq('owner_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createProject(projectData) {
    try {
      const { data, error } = await supabase?.from('projects')?.insert([projectData])?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateProject(projectId, updates) {
    try {
      const { data, error } = await supabase?.from('project_tasks')?.update(updates)?.eq('id', projectId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Task CRUD operations
  async getProjectTasks(projectId) {
    try {
      const { data, error } = await supabase?.from('project_tasks')?.select('*')?.eq('project_id', projectId)?.order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createTask(taskData) {
    try {
      const { data, error } = await supabase?.from('project_tasks')?.insert([taskData])?.select()?.single();

      if (error) throw error;
      
      // Update project stats after task creation
      if (data?.project_id) {
        await this.updateProjectStats(data?.project_id);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateTask(taskId, updates) {
    try {
      const { data, error } = await supabase?.from('project_tasks')?.update(updates)?.eq('id', taskId)?.select()?.single();

      if (error) throw error;
      
      // Update project stats after task update
      if (data?.project_id) {
        await this.updateProjectStats(data?.project_id);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async deleteTask(taskId) {
    try {
      // Get project_id before deletion for stats update
      const { data: task } = await supabase?.from('project_tasks')?.select('project_id')?.eq('id', taskId)?.single();

      const { error } = await supabase?.from('project_tasks')?.delete()?.eq('id', taskId);

      if (error) throw error;
      
      // Update project stats after deletion
      if (task?.project_id) {
        await this.updateProjectStats(task?.project_id);
      }
      
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  }

  // Batch update task status (for Kanban drag and drop)
  async updateTaskStatus(taskId, newStatus) {
    try {
      const { data, error } = await supabase?.from('project_tasks')?.update({ status: newStatus })?.eq('id', taskId)?.select()?.single();

      if (error) throw error;
      
      if (data?.project_id) {
        await this.updateProjectStats(data?.project_id);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Statistics and reporting
  async getProjectStats(projectId) {
    try {
      const { data, error } = await supabase?.from('project_stats')?.select('*')?.eq('project_id', projectId)?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateProjectStats(projectId) {
    try {
      const { error } = await supabase?.rpc('update_project_stats', { project_uuid: projectId });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  }

  // CSV Import functionality
  async importTasksFromCSV(projectId, csvData, userId) {
    try {
      const results = {
        imported: 0,
        failed: 0,
        errors: []
      };

      for (const row of csvData) {
        try {
          const taskData = {
            project_id: projectId,
            phase: row?.Phase?.toLowerCase()?.replace(/[^a-z]/g, '_') || 'documentation',
            task_name: row?.Tâche || row?.Task || 'Untitled Task',
            responsible: row?.Responsable || row?.Responsible || 'Unassigned',
            status: this.mapStatus(row?.Statut || row?.Status || 'À faire'),
            priority: this.mapPriority(row?.Priorité || row?.Priority || 'Moyenne'),
            deadline_days: parseInt(row?.['Échéance (jours)'] || row?.['Deadline (days)'] || '1'),
            notes: row?.Notes || ''
          };

          const { error } = await supabase?.from('project_tasks')?.insert([taskData]);

          if (error) {
            results.failed++;
            results?.errors?.push(`Row ${results?.imported + results?.failed + 1}: ${error?.message}`);
          } else {
            results.imported++;
          }
        } catch (rowError) {
          results.failed++;
          results?.errors?.push(`Row ${results?.imported + results?.failed + 1}: ${rowError?.message}`);
        }
      }

      // Log the import
      await supabase?.from('csv_import_logs')?.insert({
          project_id: projectId,
          imported_by: userId,
          filename: 'csv_import.csv',
          records_imported: results?.imported,
          records_failed: results?.failed,
          error_details: results?.errors?.length > 0 ? { errors: results?.errors } : null
        });

      // Update project stats
      await this.updateProjectStats(projectId);

      return { data: results, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // CSV Export functionality
  async exportTasksToCSV(projectId) {
    try {
      const { data: tasks, error } = await supabase?.from('project_tasks')?.select('*')?.eq('project_id', projectId)?.order('created_at', { ascending: true });

      if (error) throw error;

      const csvHeaders = [
        'Phase',
        'Tâche',
        'Responsable',
        'Statut',
        'Priorité',
        'Échéance (jours)',
        'Notes'
      ];

      const csvRows = tasks?.map(task => [
        this.formatPhaseForExport(task?.phase),
        task?.task_name,
        task?.responsible,
        this.formatStatusForExport(task?.status),
        this.formatPriorityForExport(task?.priority),
        task?.deadline_days,
        task?.notes || ''
      ]) || [];

      const csvContent = [csvHeaders, ...csvRows]?.map(row => row?.map(field => `"${(field || '')?.toString()?.replace(/"/g, '""')}"`)?.join(','))?.join('\n');

      return { data: csvContent, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Filter and search functionality
  async getFilteredTasks(projectId, filters = {}) {
    try {
      let query = supabase?.from('project_tasks')?.select('*')?.eq('project_id', projectId);

      if (filters?.phase) {
        query = query?.eq('phase', filters?.phase);
      }

      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.priority) {
        query = query?.eq('priority', filters?.priority);
      }

      if (filters?.responsible) {
        query = query?.ilike('responsible', `%${filters?.responsible}%`);
      }

      if (filters?.search) {
        query = query?.or(`task_name.ilike.%${filters?.search}%,notes.ilike.%${filters?.search}%`);
      }

      if (filters?.overdue) {
        query = query?.lt('due_date', new Date()?.toISOString())?.neq('status', 'termine');
      }

      const { data, error } = await query?.order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Utility methods for data mapping
  mapStatus(status) {
    const statusMap = {
      'À faire': 'todo',
      'Todo': 'todo',
      'Partiel': 'partiel',
      'Partial': 'partiel',
      'En cours': 'partiel',
      'In Progress': 'partiel',
      'Terminé': 'termine',
      'Complete': 'termine',
      'Done': 'termine'
    };
    return statusMap?.[status] || 'todo';
  }

  mapPriority(priority) {
    const priorityMap = {
      'Haute': 'haute',
      'High': 'haute',
      'Moyenne': 'moyenne',
      'Medium': 'moyenne',
      'Basse': 'basse',
      'Low': 'basse'
    };
    return priorityMap?.[priority] || 'moyenne';
  }

  formatPhaseForExport(phase) {
    const phaseMap = {
      'dns_ssl': 'DNS & SSL',
      'infrastructure': 'Infrastructure',
      'monitoring': 'Monitoring',
      'deployment': 'Deployment',
      'testing': 'Testing',
      'security': 'Security',
      'compliance': 'Compliance',
      'documentation': 'Documentation'
    };
    return phaseMap?.[phase] || phase;
  }

  formatStatusForExport(status) {
    const statusMap = {
      'todo': 'À faire',
      'partiel': 'Partiel',
      'termine': 'Terminé'
    };
    return statusMap?.[status] || status;
  }

  formatPriorityForExport(priority) {
    const priorityMap = {
      'haute': 'Haute',
      'moyenne': 'Moyenne',
      'basse': 'Basse'
    };
    return priorityMap?.[priority] || priority;
  }

  // Real-time subscriptions for live updates
  subscribeToProjectChanges(projectId, onTaskChange) {
    const channel = supabase?.channel(`project_${projectId}`)?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          onTaskChange?.(payload);
        }
      )?.subscribe();

    return channel;
  }

  unsubscribeFromChanges(channel) {
    supabase?.removeChannel(channel);
  }
}

const projectManagementService = new ProjectManagementService();
export default projectManagementService;