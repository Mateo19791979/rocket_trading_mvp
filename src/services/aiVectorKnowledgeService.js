import { supabase } from '../lib/supabase';
import openai from '../lib/openaiClient';

/**
 * AI Vector Knowledge Service - RAG System Integration
 * Handles vector storage, embedding generation, and knowledge retrieval
 * for Thomas Mazzoni & Peter Lynch book integration
 */
export class AIVectorKnowledgeService {
  
  /**
   * ENHANCED BOOK LIBRARY - Extended Knowledge Base for AAS
   * Adding 10+ world-class trading and AI books for maximum efficiency
   */
  static EXPANDED_BOOK_LIBRARY = {
    // Existing books
    'Thomas Mazzoni': {
      topics: ['quantitative_finance', 'derivatives', 'risk_management'],
      agents: ['Quant Oracle', 'Strategy Weaver', 'Risk Controller'],
      priority: 1
    },
    'Peter Lynch': {
      topics: ['behavioral_investing', 'fundamental_analysis', 'stock_picking'],
      agents: ['Strategy Weaver', 'BehavioralSentimentAI', 'Cognitive Coach'],
      priority: 1
    },
    
    // NEW ADDITIONS - World-Class Trading Knowledge
    'Warren Buffett': {
      topics: ['value_investing', 'long_term_strategy', 'business_analysis'],
      agents: ['Strategy Weaver', 'Value Investor AI', 'BehavioralSentimentAI'],
      priority: 1
    },
    'Benjamin Graham': {
      topics: ['value_investing', 'security_analysis', 'margin_of_safety'],
      agents: ['Strategy Weaver', 'Value Investor AI', 'Risk Controller'],
      priority: 1
    },
    'Joel Greenblatt': {
      topics: ['magic_formula', 'value_investing', 'special_situations'],
      agents: ['Strategy Weaver', 'Quant Oracle', 'Value Investor AI'],
      priority: 1
    },
    'Howard Marks': {
      topics: ['market_cycles', 'risk_assessment', 'contrarian_investing'],
      agents: ['Strategy Weaver', 'Market Cycle AI', 'Risk Controller'],
      priority: 1
    },
    'Ray Dalio': {
      topics: ['systematic_investing', 'macro_strategy', 'all_weather_portfolio'],
      agents: ['Strategy Weaver', 'Macro AI', 'Portfolio Optimizer'],
      priority: 1
    },
    'David Swensen': {
      topics: ['institutional_investing', 'asset_allocation', 'endowment_model'],
      agents: ['Portfolio Optimizer', 'Institutional AI', 'Strategy Weaver'],
      priority: 1
    },
    'Ed Thorp': {
      topics: ['quantitative_trading', 'probability', 'kelly_criterion'],
      agents: ['Quant Oracle', 'Strategy Weaver', 'Risk Controller'],
      priority: 1
    },
    'Jim Simons': {
      topics: ['algorithmic_trading', 'pattern_recognition', 'mathematical_models'],
      agents: ['Quant Oracle', 'Pattern Recognition AI', 'Strategy Weaver'],
      priority: 1
    },
    'Jack Bogle': {
      topics: ['index_investing', 'cost_efficiency', 'long_term_investing'],
      agents: ['Portfolio Optimizer', 'Cost Efficiency AI', 'Strategy Weaver'],
      priority: 2
    },
    'Daniel Kahneman': {
      topics: ['behavioral_economics', 'cognitive_biases', 'decision_making'],
      agents: ['BehavioralSentimentAI', 'Cognitive Coach', 'Bias Detector AI'],
      priority: 1
    },
    'Nassim Taleb': {
      topics: ['black_swan_events', 'antifragility', 'tail_risk'],
      agents: ['Risk Controller', 'Black Swan AI', 'Strategy Weaver'],
      priority: 1
    }
  };
  
  /**
   * Process PDF content into chunks and generate embeddings
   * @param {string} pdfContent - Raw PDF text content
   * @param {string} bookId - Book library ID
   * @param {string} source - Book source (Thomas Mazzoni, Peter Lynch)
   * @param {string[]} topics - Topic tags for categorization
   * @returns {Promise<Object>} Processing results
   */
  static async processBookToVectors(pdfContent, bookId, source, topics = []) {
    try {
      // 1. Clean and chunk the content
      const cleanedContent = this.cleanPDFContent(pdfContent);
      const chunks = this.chunkText(cleanedContent, 1000, 100);
      
      // 2. Generate embeddings for all chunks
      const vectorResults = [];
      
      for (let i = 0; i < chunks?.length; i++) {
        const chunk = chunks?.[i];
        
        // Generate embedding using OpenAI
        const embedding = await this.generateEmbedding(chunk);
        
        // Extract metadata
        const metadata = this.extractMetadata(chunk, source);
        
        // Store in Supabase
        const { data, error } = await supabase?.from('ai_knowledge_vectors')?.insert({
            content: chunk,
            chunk_index: i,
            embedding,
            metadata,
            source,
            topics,
            book_id: bookId,
            chunk_size: 1000,
            overlap_size: 100,
            quality_score: this.calculateQualityScore(chunk)
          })?.select()?.single();
        
        if (error) {
          console.error(`Error storing vector chunk ${i}:`, error?.message);
          continue;
        }
        
        vectorResults?.push(data);
      }
      
      // 3. Link vectors to appropriate AI agents
      await this.linkVectorsToAgents(vectorResults, topics);
      
      return {
        success: true,
        processed_chunks: vectorResults?.length,
        total_chunks: chunks?.length,
        topics,
        source
      };
      
    } catch (error) {
      console.error('Error processing book to vectors:', error);
      throw error;
    }
  }
  
  /**
   * Generate embedding using OpenAI text-embedding-3-large
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} Embedding vector
   */
  static async generateEmbedding(text) {
    try {
      const response = await openai?.embeddings?.create({
        model: 'text-embedding-3-large',
        input: text,
      });
      
      return response?.data?.[0]?.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }
  
  /**
   * MULTI-BOOK PROCESSING - Enhanced for AAS Efficiency
   * Process multiple books simultaneously for maximum knowledge density
   */
  static async processBooksToVectors(booksData, processingOptions = {}) {
    try {
      const results = {
        success: true,
        books_processed: 0,
        total_vectors: 0,
        processing_errors: [],
        knowledge_expansion: {}
      };
      
      // Process books in parallel for efficiency
      const bookPromises = booksData?.map(async (bookData) => {
        try {
          const { pdfContent, bookId, source, customTopics } = bookData;
          
          // Get book configuration
          const bookConfig = this.EXPANDED_BOOK_LIBRARY?.[source] || {
            topics: customTopics || ['general_trading'],
            agents: ['Strategy Weaver'],
            priority: 2
          };
          
          // Enhanced processing with book-specific optimization
          const processResult = await this.processBookToVectors(
            pdfContent, 
            bookId, 
            source, 
            bookConfig?.topics,
            {
              priority: bookConfig?.priority,
              target_agents: bookConfig?.agents,
              enhanced_chunking: true,
              quality_threshold: 0.7,
              ...processingOptions
            }
          );
          
          results.books_processed++;
          results.total_vectors += processResult?.processed_chunks || 0;
          results.knowledge_expansion[source] = {
            vectors: processResult?.processed_chunks,
            topics: bookConfig?.topics,
            agents: bookConfig?.agents
          };
          
          return processResult;
          
        } catch (error) {
          results?.processing_errors?.push({
            source: bookData?.source,
            error: error?.message
          });
          return null;
        }
      });
      
      await Promise.all(bookPromises);
      
      // Update cache with expanded knowledge
      await this.updateExpandedVectorCache();
      
      return results;
      
    } catch (error) {
      console.error('Error in multi-book processing:', error);
      throw error;
    }
  }
  
  /**
   * Perform RAG query with semantic search
   * @param {string} query - User query
   * @param {string} agentContext - Agent context for filtering
   * @param {number} maxResults - Maximum results to return
   * @returns {Promise<Object>} RAG query results
   */
  static async ragQuery(query, agentContext = null, maxResults = 5) {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search similar vectors
      const { data: vectors, error } = await supabase?.rpc('search_knowledge_vectors', {
          query_embedding: queryEmbedding,
          match_threshold: 0.78,
          match_count: maxResults,
          filter_agent: agentContext
        });
      
      if (error) {
        throw error;
      }
      
      // Generate contextual response
      const context = vectors?.map(v => v?.content)?.join('\n\n') || '';
      
      const response = await openai?.chat?.completions?.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en trading quantitatif et comportemental. Utilise les connaissances de Thomas Mazzoni (finance quantitative) et Peter Lynch (investissement comportemental) pour répondre aux questions.
            
Context disponible:
${context}

Réponds en français avec une approche combinant rigueur mathématique et intuition de marché.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        reasoning_effort: 'high',
        verbosity: 'medium'
      });
      
      return {
        answer: response?.choices?.[0]?.message?.content,
        sources: vectors,
        agent_context: agentContext,
        query
      };
      
    } catch (error) {
      console.error('Error in RAG query:', error);
      throw error;
    }
  }
  
  /**
   * ENHANCED RAG QUERY - Multi-Book Intelligence
   * Leverages expanded knowledge base for superior AI responses
   */
  static async enhancedRagQuery(query, agentContext = null, maxResults = 10) {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search across expanded knowledge base
      const { data: vectors, error } = await supabase?.rpc('search_knowledge_vectors', {
          query_embedding: queryEmbedding,
          match_threshold: 0.75, // Slightly lower for more diverse results
          match_count: maxResults,
          filter_agent: agentContext
        });
      
      if (error) throw error;
      
      // Enhanced context building from multiple sources
      const contextSections = vectors?.map(v => ({
        content: v?.content,
        source: v?.source,
        topics: v?.topics,
        similarity: v?.similarity
      })) || [];
      
      // Group by source for balanced context
      const sourceGroups = contextSections?.reduce((acc, section) => {
        const source = section?.source;
        if (!acc?.[source]) acc[source] = [];
        acc?.[source]?.push(section);
        return acc;
      }, {});
      
      // Build multi-source context
      const enhancedContext = Object.entries(sourceGroups)
        ?.map(([source, sections]) => {
          const topContent = sections?.slice(0, 2)?.map(s => s?.content)?.join('\n\n');
          return `## ${source}:\n${topContent}`;
        })?.join('\n\n');
      
      // Enhanced AI response with multi-book knowledge
      const response = await openai?.chat?.completions?.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert trading IA avec accès à une bibliothèque étendue des meilleurs livres de finance.

Sources disponibles: ${vectors?.map(v => v?.source)?.filter((v, i, arr) => arr?.indexOf(v) === i)?.join(', ')}

CONTEXTE MULTI-SOURCES:
${enhancedContext}

Instructions:
- Combine les insights de TOUS les auteurs disponibles
- Créer des synthèses innovantes entre approches quantitatives et comportementales
- Donner des recommandations concrètes pour l'AAS
- Citer les sources spécifiques
- Adapter au contexte agent: ${agentContext || 'généraliste'}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      
      return {
        answer: response?.choices?.[0]?.message?.content,
        sources: vectors,
        source_diversity: Object.keys(sourceGroups)?.length,
        agent_context: agentContext,
        query,
        knowledge_breadth: vectors?.length || 0
      };
      
    } catch (error) {
      console.error('Error in enhanced RAG query:', error);
      throw error;
    }
  }
  
  /**
   * Link knowledge vectors to appropriate AI agents
   * @param {Array} vectors - Processed vectors
   * @param {string[]} topics - Topic categories
   */
  static async linkVectorsToAgents(vectors, topics) {
    try {
      const agentMappings = {
        'quantitative_finance': ['Quant Oracle', 'Strategy Weaver'],
        'behavioral_investing': ['Strategy Weaver', 'BehavioralSentimentAI', 'Cognitive Coach']
      };
      
      for (const vector of vectors) {
        for (const topic of topics) {
          const relevantAgents = agentMappings?.[topic] || [];
          
          for (const agentName of relevantAgents) {
            // Find agent by name
            const { data: agent } = await supabase?.from('ai_agents')?.select('id')?.eq('name', agentName)?.single();
            
            if (agent) {
              await supabase?.from('ai_agent_knowledge_links')?.insert({
                  agent_id: agent?.id,
                  vector_id: vector?.id,
                  relevance_score: this.calculateRelevanceScore(topic, agentName),
                  agent_name: agentName,
                  knowledge_category: topic,
                  priority_level: topic === 'quantitative_finance' ? 1 : 2
                });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error linking vectors to agents:', error);
    }
  }
  
  /**
   * Clean PDF content by removing metadata and formatting issues
   * @param {string} content - Raw PDF content
   * @returns {string} Cleaned content
   */
  static cleanPDFContent(content) {
    return (
      // Remove unwanted characters
      // Normalize whitespace
      // Remove excessive newlines
      (content?.replace(/\n{3,}/g, '\n\n')?.replace(/\s+/g, ' ')?.replace(/[^\w\s\.,;:!?()+-=\/<>""'']/g, '')?.trim())
    );
  }
  
  /**
   * Split text into overlapping chunks
   * @param {string} text - Text to chunk
   * @param {number} chunkSize - Size of each chunk
   * @param {number} overlap - Overlap between chunks
   * @returns {string[]} Array of text chunks
   */
  static chunkText(text, chunkSize = 1000, overlap = 100) {
    const chunks = [];
    let start = 0;
    
    while (start < text?.length) {
      const end = Math.min(start + chunkSize, text?.length);
      const chunk = text?.slice(start, end);
      
      // Ensure we don't split words
      const lastSpaceIndex = chunk?.lastIndexOf(' ');
      const finalChunk = lastSpaceIndex > chunkSize * 0.8 ? 
        chunk?.slice(0, lastSpaceIndex) : chunk;
      
      chunks?.push(finalChunk);
      start += chunkSize - overlap;
    }
    
    return chunks?.filter(chunk => chunk?.trim()?.length > 50); // Filter very short chunks
  }
  
  /**
   * Extract metadata from content chunk
   * @param {string} chunk - Text chunk
   * @param {string} source - Book source
   * @returns {Object} Extracted metadata
   */
  static extractMetadata(chunk, source) {
    const metadata = {
      source,
      language: 'fr',
      date_added: '2025-10-09'
    };
    
    // Extract concepts based on source
    if (source === 'Thomas Mazzoni') {
      metadata.topics = ['quantitative_finance'];
      if (chunk?.includes('Black-Scholes')) metadata.concept = 'Black-Scholes';
      if (chunk?.includes('volatilité')) metadata.concept = 'volatility_modeling';
      if (chunk?.includes('diffusion')) metadata.concept = 'stochastic_processes';
    } else if (source === 'Peter Lynch') {
      metadata.topics = ['behavioral_investing'];
      if (chunk?.includes('10-bagger')) metadata.concept = '10-bagger';
      if (chunk?.includes('psychologie')) metadata.concept = 'market_psychology';
      if (chunk?.includes('consommateur')) metadata.concept = 'consumer_signals';
    }
    
    return metadata;
  }
  
  /**
   * Calculate quality score for content chunk
   * @param {string} chunk - Text chunk
   * @returns {number} Quality score (0-1)
   */
  static calculateQualityScore(chunk) {
    let score = 0.5; // Base score
    
    // Increase score for mathematical content
    if (chunk?.match(/[=+\-*/()]/g)) score += 0.2;
    
    // Increase score for key trading terms
    const tradingTerms = ['stratégie', 'trading', 'bourse', 'investissement', 'risque'];
    const matches = tradingTerms?.filter(term => chunk?.toLowerCase()?.includes(term));
    score += matches?.length * 0.1;
    
    // Decrease score for very short or repetitive content
    if (chunk?.length < 100) score -= 0.3;
    
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Calculate relevance score between topic and agent
   * @param {string} topic - Knowledge topic
   * @param {string} agentName - AI agent name
   * @returns {number} Relevance score
   */
  static calculateRelevanceScore(topic, agentName) {
    const relevanceMatrix = {
      'quantitative_finance': {
        'Quant Oracle': 0.95,
        'Strategy Weaver': 0.85,
        'Cognitive Coach': 0.60
      },
      'behavioral_investing': {
        'Strategy Weaver': 0.90,
        'BehavioralSentimentAI': 0.95,
        'Cognitive Coach': 0.80,
        'Quant Oracle': 0.50
      }
    };
    
    return relevanceMatrix?.[topic]?.[agentName] || 0.50;
  }
  
  /**
   * Get knowledge vectors count and statistics
   * @returns {Promise<Object>} Knowledge base statistics
   */
  static async getKnowledgeStats() {
    try {
      const { data, error } = await supabase?.from('ai_knowledge_vectors')?.select('id, topics, source, quality_score')?.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const stats = {
        total_vectors: data?.length || 0,
        by_topic: {},
        by_source: {},
        average_quality: 0
      };
      
      data?.forEach(vector => {
        // Count by topics
        vector?.topics?.forEach(topic => {
          stats.by_topic[topic] = (stats?.by_topic?.[topic] || 0) + 1;
        });
        
        // Count by source
        stats.by_source[vector.source] = (stats?.by_source?.[vector?.source] || 0) + 1;
      });
      
      // Calculate average quality
      const totalQuality = data?.reduce((sum, v) => sum + (v?.quality_score || 0), 0) || 0;
      stats.average_quality = data?.length > 0 ? totalQuality / data?.length : 0;
      
      return stats;
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      throw error;
    }
  }
  
  /**
   * Test RAG system with sample query
   * @param {string} testQuery - Test query
   * @returns {Promise<Object>} Test results
   */
  static async testRAGSystem(testQuery = "Qu'est-ce qu'un 10-bagger selon Lynch et comment l'IA peut-elle le détecter ?") {
    try {
      const result = await this.ragQuery(testQuery);
      
      return {
        query: testQuery,
        success: true,
        response_length: result?.answer?.length || 0,
        sources_count: result?.sources?.length || 0,
        processing_time: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        query: testQuery,
        success: false,
        error: error?.message,
        processing_time: new Date()?.toISOString()
      };
    }
  }
  
  /**
   * Update vector cache (scheduled task)
   * @param {string[]} topicsToRefresh - Topics to refresh
   * @returns {Promise<void>}
   */
  static async updateVectorCache(topicsToRefresh = ['quantitative_finance', 'behavioral_investing']) {
    try {
      const { error } = await supabase?.rpc('update_vector_cache');
      
      if (error) throw error;
      
      console.log('[RAG] Knowledge base refreshed successfully');
    } catch (error) {
      console.error('[RAG] Cache update failed:', error);
      throw error;
    }
  }
  
  /**
   * BULK BOOK INGESTION - AAS Knowledge Acceleration
   * Upload and process multiple PDF books in one operation
   */
  static async bulkIngestBooks(bookFiles, options = {}) {
    try {
      const results = {
        ingested: 0,
        failed: 0,
        total_vectors: 0,
        processing_log: []
      };
      
      for (const bookFile of bookFiles) {
        try {
          // Extract PDF content (assuming PDF processing utility exists)
          const pdfContent = await this.extractPDFContent(bookFile?.file);
          
          // Auto-detect book metadata
          const metadata = this.detectBookMetadata(pdfContent, bookFile?.filename);
          
          // Create book library entry
          const { data: bookEntry, error: bookError } = await supabase
            ?.from('book_library')
            ?.insert({
              title: metadata?.title,
              author: metadata?.author,
              category: metadata?.category,
              language: 'fr',
              file_path: bookFile?.path,
              processing_status: 'processing'
            })
            ?.select()
            ?.single();
          
          if (bookError) throw bookError;
          
          // Process to vectors
          const processResult = await this.processBookToVectors(
            pdfContent,
            bookEntry?.id,
            metadata?.author,
            metadata?.topics || ['general_trading']
          );
          
          results.ingested++;
          results.total_vectors += processResult?.processed_chunks || 0;
          results?.processing_log?.push({
            book: metadata?.title,
            author: metadata?.author,
            vectors: processResult?.processed_chunks,
            status: 'success'
          });
          
          // Update book status
          await supabase
            ?.from('book_library')
            ?.update({ processing_status: 'completed' })
            ?.eq('id', bookEntry?.id);
          
        } catch (error) {
          results.failed++;
          results?.processing_log?.push({
            book: bookFile?.filename,
            status: 'failed',
            error: error?.message
          });
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Error in bulk book ingestion:', error);
      throw error;
    }
  }
  
  /**
   * KNOWLEDGE EXPANSION METRICS - AAS Intelligence Tracking
   */
  static async getKnowledgeExpansionMetrics() {
    try {
      const { data: vectors, error } = await supabase
        ?.from('ai_knowledge_vectors')
        ?.select('source, topics, quality_score, created_at');
      
      if (error) throw error;
      
      const metrics = {
        total_books: new Set(vectors?.map(v => v?.source))?.size || 0,
        total_vectors: vectors?.length || 0,
        knowledge_density: {},
        topic_coverage: {},
        quality_distribution: {
          excellent: 0, // > 0.8
          good: 0,      // 0.6-0.8
          average: 0    // < 0.6
        },
        recent_additions: vectors?.filter(v => 
          new Date(v?.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )?.length || 0
      };
      
      // Calculate knowledge density by source
      vectors?.forEach(vector => {
        const source = vector?.source;
        if (!metrics?.knowledge_density?.[source]) {
          metrics.knowledge_density[source] = 0;
        }
        metrics.knowledge_density[source]++;
        
        // Track topic coverage
        vector?.topics?.forEach(topic => {
          if (!metrics?.topic_coverage?.[topic]) {
            metrics.topic_coverage[topic] = 0;
          }
          metrics.topic_coverage[topic]++;
        });
        
        // Quality distribution
        const quality = vector?.quality_score || 0;
        if (quality > 0.8) metrics.quality_distribution.excellent++;
        else if (quality > 0.6) metrics.quality_distribution.good++;
        else metrics.quality_distribution.average++;
      });
      
      return metrics;
      
    } catch (error) {
      console.error('Error getting expansion metrics:', error);
      throw error;
    }
  }
  
  /**
   * Update vector cache with expanded topics
   */
  static async updateExpandedVectorCache(topicsToRefresh = null) {
    try {
      const allTopics = topicsToRefresh || [
        'quantitative_finance', 'behavioral_investing', 'value_investing',
        'algorithmic_trading', 'risk_management', 'market_cycles',
        'portfolio_optimization', 'behavioral_economics', 'systematic_investing'
      ];
      
      const { error } = await supabase?.rpc('update_vector_cache');
      if (error) throw error;
      
      console.log('[RAG] Expanded knowledge base cache updated:', allTopics);
      
    } catch (error) {
      console.error('[RAG] Expanded cache update failed:', error);
      throw error;
    }
  }
  
  /**
   * Extract PDF content (placeholder - assumes PDF processing utility exists)
   * @param {File} file - PDF file
   * @returns {Promise<string>} PDF text content
   */
  static async extractPDFContent(file) {
    // This would be implemented with actual PDF processing library
    // For now, return placeholder
    return 'PDF content extraction placeholder';
  }
  
  /**
   * Auto-detect book metadata from content
   * @param {string} content - PDF content
   * @param {string} filename - Book filename
   * @returns {Object} Detected metadata
   */
  static detectBookMetadata(content, filename) {
    // This would be implemented with actual metadata detection logic
    // For now, return placeholder
    return {
      title: filename?.replace(/\.[^/.]+$/, ''),
      author: 'Unknown Author',
      category: 'General Trading',
      topics: ['general_trading']
    };
  }
}

export default AIVectorKnowledgeService;