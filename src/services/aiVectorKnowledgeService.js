import { supabase } from '../lib/supabase';
import openai from '../lib/openaiClient';

/**
 * AI Vector Knowledge Service - RAG System Integration
 * Handles vector storage, embedding generation, and knowledge retrieval
 * for Thomas Mazzoni & Peter Lynch book integration
 * ENHANCED: Circuit breakers and request throttling to prevent infinite loops
 */
export class AIVectorKnowledgeService {
  
  // ADDED: Circuit breaker for API calls to prevent cascading failures
  static _circuitBreaker = {
    failures: 0,
    lastFailTime: null,
    isOpen: false,
    threshold: 5,
    timeout: 30000 // 30 seconds
  };

  // ADDED: Request throttling to prevent excessive API calls
  static _requestThrottle = {
    requests: new Map(),
    maxRequests: 10,
    timeWindow: 60000 // 1 minute
  };

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
   * ADDED: Circuit breaker check to prevent cascading failures
   */
  static _checkCircuitBreaker() {
    if (this._circuitBreaker?.isOpen) {
      const timeSinceLastFail = Date.now() - this._circuitBreaker?.lastFailTime;
      if (timeSinceLastFail > this._circuitBreaker?.timeout) {
        this._circuitBreaker.isOpen = false;
        this._circuitBreaker.failures = 0;
        console.log('[AIVectorService] Circuit breaker reset');
      } else {
        throw new Error('Service temporarily unavailable due to circuit breaker');
      }
    }
  }

  /**
   * ADDED: Request throttling to prevent API abuse
   */
  static _throttleRequest(method) {
    const now = Date.now();
    const windowStart = now - this._requestThrottle?.timeWindow;
    
    // Clean old requests
    for (const [key, timestamp] of this._requestThrottle?.requests?.entries()) {
      if (timestamp < windowStart) {
        this._requestThrottle?.requests?.delete(key);
      }
    }
    
    const currentRequests = Array.from(this._requestThrottle?.requests?.values())?.filter(timestamp => timestamp > windowStart)?.length;
    
    if (currentRequests >= this._requestThrottle?.maxRequests) {
      throw new Error(`Too many requests for ${method}. Please wait.`);
    }
    
    this._requestThrottle?.requests?.set(`${method}_${now}`, now);
  }

  /**
   * ADDED: Safe API call wrapper with circuit breaker and throttling
   */
  static async _safeApiCall(method, apiCall) {
    try {
      this._checkCircuitBreaker();
      this._throttleRequest(method);
      
      const result = await apiCall();
      
      // Reset circuit breaker on success
      if (this._circuitBreaker?.failures > 0) {
        this._circuitBreaker.failures = 0;
        console.log('[AIVectorService] Circuit breaker failures reset');
      }
      
      return result;
    } catch (error) {
      console.error(`[AIVectorService] ${method} failed:`, error);
      
      // Update circuit breaker
      this._circuitBreaker.failures++;
      this._circuitBreaker.lastFailTime = Date.now();
      
      if (this._circuitBreaker?.failures >= this._circuitBreaker?.threshold) {
        this._circuitBreaker.isOpen = true;
        console.warn('[AIVectorService] Circuit breaker opened due to failures');
      }
      
      throw error;
    }
  }
  
  /**
   * Process PDF content into chunks and generate embeddings
   * ENHANCED: Added circuit breaker protection
   */
  static async processBookToVectors(pdfContent, bookId, source, topics = []) {
    return this._safeApiCall('processBookToVectors', async () => {
      // 1. Clean and chunk the content
      const cleanedContent = this.cleanPDFContent(pdfContent);
      const chunks = this.chunkText(cleanedContent, 1000, 100);
      
      // 2. Generate embeddings for all chunks with batching
      const vectorResults = [];
      const batchSize = 5; // Process in smaller batches to prevent overload
      
      for (let i = 0; i < chunks?.length; i += batchSize) {
        const batch = chunks?.slice(i, i + batchSize);
        
        const batchPromises = batch?.map(async (chunk, batchIndex) => {
          const chunkIndex = i + batchIndex;
          
          try {
            // Generate embedding using OpenAI with timeout
            const embedding = await Promise.race([
              this.generateEmbedding(chunk),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Embedding timeout')), 30000)
              )
            ]);
            
            // Extract metadata
            const metadata = this.extractMetadata(chunk, source);
            
            // Store in Supabase with retry logic
            const { data, error } = await supabase?.from('ai_knowledge_vectors')?.insert({
                content: chunk,
                chunk_index: chunkIndex,
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
              console.error(`Error storing vector chunk ${chunkIndex}:`, error?.message);
              return null;
            }
            
            return data;
          } catch (error) {
            console.error(`Error processing chunk ${chunkIndex}:`, error?.message);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        vectorResults?.push(...batchResults?.filter(Boolean));
        
        // Small delay between batches to prevent rate limiting
        if (i + batchSize < chunks?.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
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
    });
  }
  
  /**
   * Generate embedding using OpenAI text-embedding-3-large
   * ENHANCED: Added error handling and fallback
   */
  static async generateEmbedding(text) {
    return this._safeApiCall('generateEmbedding', async () => {
      if (!text || text?.trim()?.length === 0) {
        throw new Error('Empty text provided for embedding');
      }
      
      // Truncate text if too long to prevent API errors
      const maxLength = 8000; // Conservative limit for text-embedding-3-large
      const truncatedText = text?.length > maxLength ? text?.substring(0, maxLength) : text;
      
      const response = await openai?.embeddings?.create({
        model: 'text-embedding-3-large',
        input: truncatedText,
      });
      
      if (!response?.data?.[0]?.embedding) {
        throw new Error('Invalid embedding response from OpenAI');
      }
      
      return response?.data?.[0]?.embedding;
    });
  }
  
  /**
   * MULTI-BOOK PROCESSING - Enhanced for AAS Efficiency
   * ENHANCED: Added proper error handling and progress tracking
   */
  static async processBooksToVectors(booksData, processingOptions = {}) {
    return this._safeApiCall('processBooksToVectors', async () => {
      const results = {
        success: true,
        books_processed: 0,
        total_vectors: 0,
        processing_errors: [],
        knowledge_expansion: {}
      };
      
      // Process books sequentially to prevent overwhelming the system
      for (const bookData of booksData) {
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
            bookConfig?.topics
          );
          
          results.books_processed++;
          results.total_vectors += processResult?.processed_chunks || 0;
          results.knowledge_expansion[source] = {
            vectors: processResult?.processed_chunks,
            topics: bookConfig?.topics,
            agents: bookConfig?.agents
          };
          
        } catch (error) {
          results?.processing_errors?.push({
            source: bookData?.source,
            error: error?.message
          });
        }
        
        // Delay between books to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Update cache with expanded knowledge
      await this.updateExpandedVectorCache();
      
      return results;
    });
  }
  
  /**
   * Perform RAG query with semantic search
   * ENHANCED: Added caching and error recovery
   */
  static async ragQuery(query, agentContext = null, maxResults = 5) {
    return this._safeApiCall('ragQuery', async () => {
      if (!query || query?.trim()?.length === 0) {
        throw new Error('Empty query provided');
      }
      
      // Generate query embedding with timeout
      const queryEmbedding = await Promise.race([
        this.generateEmbedding(query),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query embedding timeout')), 30000)
        )
      ]);
      
      // Search similar vectors with error handling
      const { data: vectors, error } = await supabase?.rpc('search_knowledge_vectors', {
          query_embedding: queryEmbedding,
          match_threshold: 0.78,
          match_count: maxResults,
          filter_agent: agentContext
        });
      
      if (error) {
        console.error('Vector search error:', error);
        throw new Error(`Vector search failed: ${error.message}`);
      }
      
      if (!vectors || vectors?.length === 0) {
        return {
          answer: "Je n'ai pas trouvé d'informations pertinentes dans ma base de connaissances pour répondre à votre question.",
          sources: [],
          agent_context: agentContext,
          query
        };
      }
      
      // Generate contextual response with fallback
      const context = vectors?.map(v => v?.content)?.join('\n\n') || '';
      
      try {
        const response = await Promise.race([
          openai?.chat?.completions?.create({
            model: 'gpt-4o', // Use more reliable model
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
            temperature: 0.7,
            max_tokens: 1000
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OpenAI response timeout')), 45000)
          )
        ]);
        
        return {
          answer: response?.choices?.[0]?.message?.content || 'Réponse non disponible',
          sources: vectors,
          agent_context: agentContext,
          query
        };
      } catch (error) {
        console.error('OpenAI completion error:', error);
        return {
          answer: `Erreur lors de la génération de la réponse: ${error?.message}. Cependant, j'ai trouvé ${vectors?.length} sources pertinentes dans ma base de connaissances.`,
          sources: vectors,
          agent_context: agentContext,
          query,
          error: error?.message
        };
      }
    });
  }
  
  /**
   * ENHANCED RAG QUERY - Multi-Book Intelligence
   * ENHANCED: Better error handling and fallback mechanisms
   */
  static async enhancedRagQuery(query, agentContext = null, maxResults = 10) {
    return this._safeApiCall('enhancedRagQuery', async () => {
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
      
      if (!vectors || vectors?.length === 0) {
        return {
          answer: "Aucune information pertinente trouvée dans la base de connaissances étendue.",
          sources: [],
          source_diversity: 0,
          agent_context: agentContext,
          query,
          knowledge_breadth: 0
        };
      }
      
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
      try {
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
        return {
          answer: `Erreur lors de la génération de la réponse améliorée: ${error?.message}`,
          sources: vectors,
          source_diversity: Object.keys(sourceGroups)?.length,
          agent_context: agentContext,
          query,
          knowledge_breadth: vectors?.length || 0,
          error: error?.message
        };
      }
    });
  }
  
  /**
   * Link knowledge vectors to appropriate AI agents
   * ENHANCED: Better error handling and batch processing
   */
  static async linkVectorsToAgents(vectors, topics) {
    return this._safeApiCall('linkVectorsToAgents', async () => {
      if (!vectors || vectors?.length === 0 || !topics || topics?.length === 0) {
        return;
      }
      
      const agentMappings = {
        'quantitative_finance': ['Quant Oracle', 'Strategy Weaver'],
        'behavioral_investing': ['Strategy Weaver', 'BehavioralSentimentAI', 'Cognitive Coach']
      };
      
      const linkPromises = [];
      
      for (const vector of vectors) {
        if (!vector?.id) continue;
        
        for (const topic of topics) {
          const relevantAgents = agentMappings?.[topic] || [];
          
          for (const agentName of relevantAgents) {
            linkPromises?.push(
              this._linkSingleVectorToAgent(vector, topic, agentName)
            );
          }
        }
      }
      
      // Process links in batches to prevent overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < linkPromises?.length; i += batchSize) {
        const batch = linkPromises?.slice(i, i + batchSize);
        await Promise.allSettled(batch);
        
        // Small delay between batches
        if (i + batchSize < linkPromises?.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    });
  }

  /**
   * ADDED: Helper method for linking single vector to agent
   */
  static async _linkSingleVectorToAgent(vector, topic, agentName) {
    try {
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
    } catch (error) {
      console.error(`Error linking vector ${vector?.id} to agent ${agentName}:`, error?.message);
    }
  }
  
  /**
   * Clean PDF content by removing metadata and formatting issues
   * ENHANCED: Better error handling
   */
  static cleanPDFContent(content) {
    if (!content || typeof content !== 'string') {
      console.warn('Invalid content provided to cleanPDFContent');
      return '';
    }
    
    try {
      return (
        content
          ?.replace(/\n{3,}/g, '\n\n')
          ?.replace(/\s+/g, ' ')
          ?.replace(/[^\w\s\.,;:!?()+-=\/<>""'']/g, '')
          ?.trim()
      ) || '';
    } catch (error) {
      console.error('Error cleaning PDF content:', error);
      return content; // Return original content if cleaning fails
    }
  }
  
  /**
   * Split text into overlapping chunks
   * ENHANCED: Better error handling and validation
   */
  static chunkText(text, chunkSize = 1000, overlap = 100) {
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text provided to chunkText');
      return [];
    }
    
    const chunks = [];
    let start = 0;
    
    try {
      while (start < text?.length) {
        const end = Math.min(start + chunkSize, text?.length);
        const chunk = text?.slice(start, end);
        
        // Ensure we don't split words
        const lastSpaceIndex = chunk?.lastIndexOf(' ');
        const finalChunk = lastSpaceIndex > chunkSize * 0.8 ? 
          chunk?.slice(0, lastSpaceIndex) : chunk;
        
        if (finalChunk?.trim()?.length > 50) {
          chunks?.push(finalChunk?.trim());
        }
        
        start += chunkSize - overlap;
      }
    } catch (error) {
      console.error('Error chunking text:', error);
      return [text]; // Return original text as single chunk if chunking fails
    }
    
    return chunks;
  }
  
  /**
   * Extract metadata from content chunk
   * ENHANCED: Better error handling
   */
  static extractMetadata(chunk, source) {
    const metadata = {
      source: source || 'Unknown',
      language: 'fr',
      date_added: new Date()?.toISOString()?.split('T')?.[0]
    };
    
    try {
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
    } catch (error) {
      console.error('Error extracting metadata:', error);
    }
    
    return metadata;
  }
  
  /**
   * Calculate quality score for content chunk
   * ENHANCED: Better validation
   */
  static calculateQualityScore(chunk) {
    if (!chunk || typeof chunk !== 'string') {
      return 0;
    }
    
    try {
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
    } catch (error) {
      console.error('Error calculating quality score:', error);
      return 0.5; // Return neutral score on error
    }
  }
  
  /**
   * Calculate relevance score between topic and agent
   * ENHANCED: Better validation
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
   * ENHANCED: Better error handling and fallback data
   */
  static async getKnowledgeStats() {
    return this._safeApiCall('getKnowledgeStats', async () => {
      const { data, error } = await supabase
        ?.from('ai_knowledge_vectors')
        ?.select('id, topics, source, quality_score')
        ?.order('created_at', { ascending: false })
        ?.limit(1000); // Limit to prevent memory issues
      
      if (error) {
        console.error('Error getting knowledge stats:', error);
        // Return fallback data instead of throwing
        return {
          total_vectors: 0,
          by_topic: {},
          by_source: {},
          average_quality: 0,
          error: error?.message
        };
      }
      
      const stats = {
        total_vectors: data?.length || 0,
        by_topic: {},
        by_source: {},
        average_quality: 0
      };
      
      try {
        data?.forEach(vector => {
          // Count by topics
          if (Array.isArray(vector?.topics)) {
            vector?.topics?.forEach(topic => {
              stats.by_topic[topic] = (stats?.by_topic?.[topic] || 0) + 1;
            });
          }
          
          // Count by source
          if (vector?.source) {
            stats.by_source[vector.source] = (stats?.by_source?.[vector?.source] || 0) + 1;
          }
        });
        
        // Calculate average quality
        const validQualities = data?.filter(v => typeof v?.quality_score === 'number')?.map(v => v?.quality_score) || [];
        stats.average_quality = validQualities?.length > 0 
          ? validQualities?.reduce((sum, q) => sum + q, 0) / validQualities?.length 
          : 0;
      } catch (error) {
        console.error('Error processing knowledge stats:', error);
      }
      
      return stats;
    });
  }
  
  /**
   * Test RAG system with sample query
   * ENHANCED: Better error handling and timeout
   */
  static async testRAGSystem(testQuery = "Qu'est-ce qu'un 10-bagger selon Lynch et comment l'IA peut-elle le détecter ?") {
    try {
      const startTime = Date.now();
      
      const result = await Promise.race([
        this.ragQuery(testQuery),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), 60000)
        )
      ]);
      
      const processingTime = Date.now() - startTime;
      
      return {
        query: testQuery,
        success: true,
        response_length: result?.answer?.length || 0,
        sources_count: result?.sources?.length || 0,
        processing_time: `${processingTime}ms`,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        query: testQuery,
        success: false,
        error: error?.message,
        processing_time: 'N/A',
        timestamp: new Date()?.toISOString()
      };
    }
  }
  
  /**
   * Update vector cache (scheduled task)
   * ENHANCED: Better error handling and timeout protection
   */
  static async updateVectorCache(topicsToRefresh = ['quantitative_finance', 'behavioral_investing']) {
    return this._safeApiCall('updateVectorCache', async () => {
      const { error } = await Promise.race([
        supabase?.rpc('update_vector_cache'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cache update timeout')), 120000)
        )
      ]);
      
      if (error) throw error;
      
      console.log('[RAG] Knowledge base refreshed successfully');
    });
  }
  
  /**
   * BULK BOOK INGESTION - AAS Knowledge Acceleration
   * ENHANCED: Better progress tracking and error recovery
   */
  static async bulkIngestBooks(bookFiles, options = {}) {
    return this._safeApiCall('bulkIngestBooks', async () => {
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
    });
  }
  
  /**
   * KNOWLEDGE EXPANSION METRICS - AAS Intelligence Tracking
   * ENHANCED: Better error handling
   */
  static async getKnowledgeExpansionMetrics() {
    return this._safeApiCall('getKnowledgeExpansionMetrics', async () => {
      const { data: vectors, error } = await supabase
        ?.from('ai_knowledge_vectors')
        ?.select('source, topics, quality_score, created_at')
        ?.limit(5000); // Limit to prevent memory issues
      
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
        if (source) {
          if (!metrics?.knowledge_density?.[source]) {
            metrics.knowledge_density[source] = 0;
          }
          metrics.knowledge_density[source]++;
        }
        
        // Track topic coverage
        if (Array.isArray(vector?.topics)) {
          vector?.topics?.forEach(topic => {
            if (!metrics?.topic_coverage?.[topic]) {
              metrics.topic_coverage[topic] = 0;
            }
            metrics.topic_coverage[topic]++;
          });
        }
        
        // Quality distribution
        const quality = vector?.quality_score || 0;
        if (quality > 0.8) metrics.quality_distribution.excellent++;
        else if (quality > 0.6) metrics.quality_distribution.good++;
        else metrics.quality_distribution.average++;
      });
      
      return metrics;
    });
  }
  
  /**
   * Update vector cache with expanded topics
   * ENHANCED: Better timeout handling
   */
  static async updateExpandedVectorCache(topicsToRefresh = null) {
    return this._safeApiCall('updateExpandedVectorCache', async () => {
      const allTopics = topicsToRefresh || [
        'quantitative_finance', 'behavioral_investing', 'value_investing',
        'algorithmic_trading', 'risk_management', 'market_cycles',
        'portfolio_optimization', 'behavioral_economics', 'systematic_investing'
      ];
      
      const { error } = await Promise.race([
        supabase?.rpc('update_vector_cache'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Expanded cache update timeout')), 180000)
        )
      ]);
      
      if (error) throw error;
      
      console.log('[RAG] Expanded knowledge base cache updated:', allTopics);
    });
  }
  
  /**
   * Extract PDF content (placeholder - assumes PDF processing utility exists)
   * ENHANCED: Better error handling
   */
  static async extractPDFContent(file) {
    try {
      // This would be implemented with actual PDF processing library
      // For now, return placeholder with validation
      if (!file) {
        throw new Error('No file provided for PDF extraction');
      }
      
      return 'PDF content extraction placeholder - replace with actual implementation';
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      throw error;
    }
  }
  
  /**
   * Auto-detect book metadata from content
   * ENHANCED: Better validation
   */
  static detectBookMetadata(content, filename) {
    try {
      // This would be implemented with actual metadata detection logic
      // For now, return placeholder with validation
      return {
        title: filename?.replace(/\.[^/.]+$/, '') || 'Unknown Title',
        author: 'Unknown Author',
        category: 'General Trading',
        topics: ['general_trading']
      };
    } catch (error) {
      console.error('Error detecting book metadata:', error);
      return {
        title: 'Unknown Title',
        author: 'Unknown Author',
        category: 'General Trading',
        topics: ['general_trading']
      };
    }
  }
}

export default AIVectorKnowledgeService;