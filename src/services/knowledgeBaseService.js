import { supabase } from '../lib/supabase';

class KnowledgeBaseService {
  // Get all reading materials with agent mappings
  async getAllReadingMaterials() {
    try {
      const { data, error } = await supabase?.rpc('get_reading_materials_with_agents');
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Search reading materials
  async searchReadingMaterials(searchTerm) {
    if (!searchTerm?.trim()) {
      return this.getAllReadingMaterials();
    }

    try {
      const { data, error } = await supabase?.rpc('search_reading_materials', { 
          search_term: searchTerm?.trim() 
        });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Get reading materials by difficulty level
  async getReadingMaterialsByDifficulty(level) {
    try {
      const { data, error } = await supabase?.from('reading_materials')?.select('*')?.eq('difficulty_level', level)?.order('priority_level', { ascending: true })?.order('title', { ascending: true });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Get reading materials by AI agent
  async getReadingMaterialsByAgent(agentName) {
    try {
      const { data, error } = await supabase?.from('reading_materials')?.select('*')?.contains('applies_to', [agentName])?.order('priority_level', { ascending: true });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Update reading progress
  async updateReadingProgress(materialId, progress) {
    try {
      const { data, error } = await supabase?.from('reading_materials')?.update({ reading_progress: Math.min(Math.max(progress, 0), 100) })?.eq('id', materialId)?.select()?.single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Get AI agents list (from existing ai_agents table)
  async getAIAgents() {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select('id, name, agent_category, agent_group, description, agent_status')?.order('name', { ascending: true });
      
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Get agent-specific recommendations
  async getAgentRecommendations(agentId) {
    try {
      // Get agent details first
      const { data: agent, error: agentError } = await supabase?.from('ai_agents')?.select('name, agent_category')?.eq('id', agentId)?.single();
      
      if (agentError) throw agentError;

      // Find reading materials for this agent
      const { data: materials, error: materialsError } = await supabase?.from('reading_materials')?.select('*')?.contains('applies_to', [agent?.name || ''])?.order('priority_level', { ascending: true });
      
      if (materialsError) throw materialsError;

      return { 
        data: {
          agent,
          recommendations: materials || []
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Get knowledge statistics
  async getKnowledgeStats() {
    try {
      const { data: materials, error } = await supabase?.from('reading_materials')?.select('difficulty_level, priority_level, reading_progress, applies_to');
      
      if (error) throw error;

      const stats = {
        totalBooks: materials?.length || 0,
        byDifficulty: {
          beginner: materials?.filter(m => m?.difficulty_level === 'beginner')?.length || 0,
          intermediate: materials?.filter(m => m?.difficulty_level === 'intermediate')?.length || 0,
          advanced: materials?.filter(m => m?.difficulty_level === 'advanced')?.length || 0
        },
        averageProgress: materials?.length ? 
          materials?.reduce((sum, m) => sum + (m?.reading_progress || 0), 0) / materials?.length : 0,
        agentCoverage: this.calculateAgentCoverage(materials)
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Helper method to calculate agent coverage
  calculateAgentCoverage(materials) {
    if (!materials?.length) return {};
    
    const agentCount = {};
    materials?.forEach(material => {
      if (material?.applies_to && Array.isArray(material?.applies_to)) {
        material?.applies_to?.forEach(agent => {
          agentCount[agent] = (agentCount?.[agent] || 0) + 1;
        });
      }
    });
    
    return agentCount;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
export default knowledgeBaseService;