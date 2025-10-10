import { supabase } from '../lib/supabase';

/**
 * RAG Knowledge Base Service - Integrates with existing book_library schema
 */
class RAGKnowledgeBaseService {
  
  /**
   * Create embeddings (placeholder - would need server-side implementation)
   */
  async createEmbeddings(texts) {
    try {
      // This would need to be implemented server-side with actual OpenAI integration
      console.warn('Creating embeddings requires server-side implementation');
      return texts?.map(() => new Array(1536)?.fill(0)); // Mock embeddings
    } catch (error) {
      console.error('Error creating embeddings:', error);
      throw error;
    }
  }

  /**
   * Chunk text into smaller pieces for better embeddings
   */
  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let i = 0;
    
    while (i < text?.length) {
      const end = Math.min(text?.length, i + chunkSize);
      chunks?.push(text?.slice(i, end));
      i = end - overlap;
      if (i < 0) i = end;
    }
    
    return chunks;
  }

  /**
   * Calculate SHA256 hash for file deduplication
   */
  async calculateFileHash(fileBuffer) {
    const hashBuffer = await crypto.subtle?.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray?.map(b => b?.toString(16)?.padStart(2, '0'))?.join('');
  }

  /**
   * Upsert book metadata using existing book_library table
   */
  async upsertBookMeta({ title, author, year, tags, sourceUrl, fileBuffer }) {
    try {
      const fileSize = fileBuffer?.byteLength || 0;
      
      // Check if book already exists by title and author
      const { data: existing, error: checkError } = await supabase
        ?.from('book_library')
        ?.select('id')
        ?.eq('title', title)
        ?.eq('author', author)
        ?.maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existing?.id) {
        return { bookId: existing?.id, isDuplicate: true };
      }

      // Insert new book into book_library table
      const { data: inserted, error: insertError } = await supabase
        ?.from('book_library')
        ?.insert([{
          title,
          author,
          publication_year: year,
          isbn: null,
          document_format: 'pdf',
          file_size: fileSize,
          metadata: { tags, source_url: sourceUrl },
          processing_status: 'pending'
        }])
        ?.select('id')
        ?.single();
        
      if (insertError) throw insertError;
      
      return { bookId: inserted?.id, isDuplicate: false };
    } catch (error) {
      console.error('Error upserting book metadata:', error);
      throw error;
    }
  }

  /**
   * Ingest PDF using existing schema
   */
  async ingestPDF({ 
    fileBuffer, 
    title, 
    author, 
    year, 
    tags = [], 
    domains = ['QuantOracle', 'StrategyWeaver'], 
    onProgress 
  }) {
    try {
      onProgress?.({ stage: 'metadata', progress: 0 });
      
      // Step 1: Upsert book metadata
      const { bookId, isDuplicate } = await this.upsertBookMeta({
        title, author, year, tags, sourceUrl: null, fileBuffer
      });
      
      if (isDuplicate) {
        onProgress?.({ stage: 'complete', progress: 100, message: 'Book already exists' });
        return { bookId, chunks: 0, isDuplicate: true };
      }

      onProgress?.({ stage: 'parsing', progress: 20 });

      // Step 2: Create processing job
      const { data: job, error: jobError } = await supabase
        ?.from('book_processing_jobs')
        ?.insert([{
          book_id: bookId,
          processing_stage: 'ingesting',
          status: 'pending',
          progress_percentage: 0,
          stage_config: { domains, tags }
        }])
        ?.select('id')
        ?.single();
        
      if (jobError) throw jobError;

      onProgress?.({ stage: 'processing', progress: 50 });
      
      // Step 3: Create reading material entry
      const { data: material, error: materialError } = await supabase
        ?.from('reading_materials')
        ?.insert([{
          title,
          author,
          book_id: bookId,
          purpose: `Knowledge extraction for ${domains?.join(', ')} agents`,
          applies_to: domains,
          key_topics: tags,
          difficulty_level: 'advanced',
          priority_level: 1
        }])
        ?.select('id')
        ?.single();
        
      if (materialError) throw materialError;

      onProgress?.({ stage: 'complete', progress: 100 });
      
      return { bookId, chunks: 1, isDuplicate: false };
    } catch (error) {
      console.error('Error ingesting PDF:', error);
      throw error;
    }
  }

  /**
   * Search knowledge using existing reading_materials
   */
  async searchKnowledge({ query, domains = ['QuantOracle'], k = 8 }) {
    try {
      // Use existing search function
      const { data, error } = await supabase?.rpc('search_reading_materials', { 
        search_term: query
      });
      
      if (error) throw error;
      
      // Filter by domains if specified
      const filtered = data?.filter(item => 
        !domains?.length || 
        (item?.applies_to && domains?.some(domain => item?.applies_to?.includes(domain)))
      )?.slice(0, k);
      
      return filtered || [];
    } catch (error) {
      console.error('Error searching knowledge:', error);
      throw error;
    }
  }

  /**
   * Get knowledge base statistics
   */
  async getKnowledgeStats() {
    try {
      // Get statistics from reading_materials
      const { data: materials, error } = await supabase
        ?.from('reading_materials')
        ?.select('difficulty_level, priority_level, reading_progress, applies_to');
      
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

      return [stats]; // Return as array to match expected format
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      return [];
    }
  }

  /**
   * Get all books from book_library
   */
  async getBooks() {
    try {
      const { data, error } = await supabase
        ?.from('book_library')
        ?.select('*, reading_materials(id, purpose, applies_to, reading_progress)')
        ?.order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting books:', error);
      return [];
    }
  }

  /**
   * Get book details with processing info
   */
  async getBookChunks(bookId) {
    try {
      const { data, error } = await supabase
        ?.from('book_library')
        ?.select(`
          *,
          reading_materials(*),
          book_processing_jobs(*),
          strategy_extractions(*)
        `)
        ?.eq('id', bookId)
        ?.single();
        
      if (error) throw error;
      
      return data || {};
    } catch (error) {
      console.error('Error getting book details:', error);
      return {};
    }
  }

  /**
   * Delete book and all related data
   */
  async deleteBook(bookId) {
    try {
      const { error } = await supabase
        ?.from('book_library')
        ?.delete()
        ?.eq('id', bookId);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }

  /**
   * Helper method to calculate agent coverage
   */
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

export default new RAGKnowledgeBaseService();