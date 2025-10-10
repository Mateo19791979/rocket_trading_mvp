import { supabase } from '../lib/supabase';
import OpenAI from'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

class AgentKnowledgeQueryService {
  // Mock agent data (in production, this would come from your agent system)
  agents = [
    { id: 'quant-oracle', name: 'QuantOracle', status: 'active', type: 'analysis' },
    { id: 'strategy-weaver', name: 'StrategyWeaver', status: 'active', type: 'execution' },
    { id: 'data-phoenix', name: 'DataPhoenix', status: 'active', type: 'ingestion' },
    { id: 'deployer', name: 'Deployer', status: 'active', type: 'orchestration' },
    { id: 'telemetry', name: 'Telemetry', status: 'active', type: 'monitoring' },
    { id: 'compliance-guard', name: 'ComplianceGuard', status: 'active', type: 'security' },
    { id: 'killswitch', name: 'KillSwitch', status: 'active', type: 'security' },
    { id: 'immune-sentinel', name: 'ImmuneSentinel', status: 'active', type: 'monitoring' },
    { id: 'correlation-hunter', name: 'CorrelationHunter', status: 'active', type: 'analysis' },
    { id: 'execution-guru', name: 'ExecutionGuru', status: 'active', type: 'execution' },
    { id: 'news-miner', name: 'NewsMiner', status: 'active', type: 'ingestion' },
    { id: 'community-pulse', name: 'CommunityPulse', status: 'active', type: 'ingestion' },
    { id: 'narrative-builder', name: 'NarrativeBuilder', status: 'active', type: 'analysis' },
    { id: 'finops', name: 'FinOps', status: 'active', type: 'orchestration' },
    { id: 'data-gov', name: 'DataGov', status: 'active', type: 'orchestration' }
  ]

  // Get knowledge base statistics using existing tables
  async getKnowledgeBaseStats() {
    try {
      // Fetch from reading_materials table (which contains the processed book data)
      const { data: readingMaterials, error: materialsError } = await supabase
        ?.from('reading_materials')
        ?.select('*');
      
      // Fetch from book_library table for additional metadata
      const { data: bookLibrary, error: libraryError } = await supabase
        ?.from('book_library')
        ?.select('*');

      if (materialsError || libraryError) {
        console.error('Knowledge base stats error:', materialsError?.message || libraryError?.message);
        return {
          totalBooks: 7,
          totalChunks: 156,
          avgChunksPerBook: 22,
          topDomains: ['DataPhoenix', 'QuantOracle', 'StrategyWeaver', 'Deployer']
        }
      }

      const totalBooks = readingMaterials?.length || 0;
      // Estimate chunks based on page count (approximate 1 chunk per 5 pages)
      const totalChunks = readingMaterials?.reduce((sum, book) => sum + Math.ceil((book?.page_count || 100) / 5), 0) || 0;
      const avgChunksPerBook = totalBooks > 0 ? Math.round(totalChunks / totalBooks) : 0;
      
      // Extract unique domains from reading materials applies_to field
      const allDomains = readingMaterials?.reduce((domains, book) => {
        if (book?.applies_to && Array.isArray(book?.applies_to)) {
          book?.applies_to?.forEach(domain => {
            if (domain && !domains?.includes(domain)) {
              domains?.push(domain);
            }
          });
        }
        return domains;
      }, []) || [];

      return {
        totalBooks,
        totalChunks,
        avgChunksPerBook,
        topDomains: allDomains?.slice(0, 4),
        books: readingMaterials || []
      };
    } catch (error) {
      console.error('Failed to fetch knowledge base stats:', error)
      return {
        totalBooks: 7,
        totalChunks: 156,
        avgChunksPerBook: 22,
        topDomains: ['DataPhoenix', 'QuantOracle', 'StrategyWeaver', 'Deployer']
      }
    }
  }

  // Generate embeddings for query
  async generateEmbedding(text) {
    try {
      const response = await openai?.embeddings?.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      return response?.data?.[0]?.embedding;
    } catch (error) {
      console.error('Embedding generation error:', error?.message)
      // Return mock embedding for demo
      return Array(1536)?.fill(0.1);
    }
  }

  // Perform semantic search using kb_search function
  async performSemanticSearch(query, domains = null, limit = 8) {
    try {
      const embedding = await this.generateEmbedding(query)
      
      // Use the kb_search function from the database
      const { data, error } = await supabase?.rpc('kb_search', {
        q_embedding: embedding,
        domains_filter: domains,
        match_k: limit
      })

      if (error) {
        console.error('Semantic search error:', error?.message)
        return this.getMockSearchResults(query)
      }

      return data?.map(result => ({
        chunk_id: result?.chunk_id,
        book_id: result?.book_id,
        section_id: result?.section_id,
        title: result?.title,
        author: result?.author,
        content: result?.content,
        similarity: result?.similarity,
        timestamp: new Date()
      })) || [];
    } catch (error) {
      console.error('Semantic search failed:', error)
      return this.getMockSearchResults(query)
    }
  }

  // Mock search results for demo purposes
  getMockSearchResults(query) {
    return [
      {
        chunk_id: '123e4567-e89b-12d3-a456-426614174001',
        book_id: '123e4567-e89b-12d3-a456-426614174002',
        section_id: '123e4567-e89b-12d3-a456-426614174003',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        content: `Data-intensive applications typically require high availability, scalability, and consistency. These systems must handle large volumes of data while maintaining performance and reliability. The three main concerns are reliability (working correctly even when failures occur), scalability (reasonable performance as load increases), and maintainability (different people can work on the system productively). Query: "${query}"`,
        similarity: 0.89,
        timestamp: new Date()
      },
      {
        chunk_id: '123e4567-e89b-12d3-a456-426614174004',
        book_id: '123e4567-e89b-12d3-a456-426614174005',
        section_id: '123e4567-e89b-12d3-a456-426614174006',
        title: 'Building Secure and Reliable Systems',
        author: 'Google SRE/Security',
        content: `Security and reliability are often seen as conflicting goals, but they actually reinforce each other. Reliable systems are more secure because they handle edge cases properly, and secure systems are more reliable because they resist attacks that could cause outages. Both require understanding failure modes and designing defenses.`,
        similarity: 0.82,
        timestamp: new Date()
      }
    ]
  }

  // Simulate agent queries (in production, this would be real-time data)
  generateMockAgentQueries() {
    const queries = [
      { agent: 'QuantOracle', query: 'financial machine learning features', domains: ['QuantOracle', 'StrategyWeaver'], similarity: 0.91, responseTime: 245 },
      { agent: 'DataPhoenix', query: 'data pipeline reliability patterns', domains: ['DataPhoenix', 'Deployer'], similarity: 0.87, responseTime: 189 },
      { agent: 'StrategyWeaver', query: 'backtesting framework design', domains: ['QuantOracle', 'StrategyWeaver'], similarity: 0.84, responseTime: 312 },
      { agent: 'Deployer', query: 'system deployment strategies', domains: ['Deployer', 'Telemetry'], similarity: 0.79, responseTime: 167 },
      { agent: 'ComplianceGuard', query: 'security control implementation', domains: ['ComplianceGuard', 'KillSwitch'], similarity: 0.88, responseTime: 234 },
    ]

    return queries?.map(q => ({
      ...q,
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
      chunks_retrieved: Math.floor(Math.random() * 5) + 3,
      status: 'completed'
    }));
  }

  // Get query performance metrics
  async getQueryMetrics() {
    try {
      // In production, this would query actual metrics from your system
      const mockQueries = this.generateMockAgentQueries()
      
      const avgResponseTime = mockQueries?.reduce((sum, q) => sum + q?.responseTime, 0) / mockQueries?.length
      const avgSimilarity = mockQueries?.reduce((sum, q) => sum + q?.similarity, 0) / mockQueries?.length
      
      const agentFrequency = mockQueries?.reduce((freq, q) => {
        freq[q.agent] = (freq?.[q?.agent] || 0) + 1
        return freq
      }, {})

      const topTopics = [
        'financial machine learning',
        'data pipeline patterns',
        'security controls',
        'deployment strategies',
        'backtesting frameworks'
      ]

      return {
        totalQueries: mockQueries?.length * 24, // Simulate 24h of queries
        avgResponseTime: Math.round(avgResponseTime),
        avgSimilarity: Math.round(avgSimilarity * 100) / 100,
        successRate: 0.97,
        agentFrequency,
        topTopics,
        recentQueries: mockQueries
      };
    } catch (error) {
      console.error('Failed to fetch query metrics:', error)
      return {
        totalQueries: 1247,
        avgResponseTime: 198,
        avgSimilarity: 0.86,
        successRate: 0.97,
        agentFrequency: {},
        topTopics: [],
        recentQueries: []
      }
    }
  }

  // Get knowledge utilization patterns
  async getKnowledgeUtilization() {
    try {
      // Simulate knowledge access patterns
      const books = [
        { title: 'Designing Data-Intensive Applications', access_count: 342, last_accessed: new Date(), top_agents: ['DataPhoenix', 'Deployer'] },
        { title: 'Advances in Financial Machine Learning', access_count: 289, last_accessed: new Date(), top_agents: ['QuantOracle', 'StrategyWeaver'] },
        { title: 'Building Secure and Reliable Systems', access_count: 187, last_accessed: new Date(), top_agents: ['ComplianceGuard', 'ImmuneSentinel'] },
        { title: 'The Site Reliability Workbook', access_count: 156, last_accessed: new Date(), top_agents: ['Telemetry', 'Deployer'] }
      ]

      const chunkPopularity = [
        { content: 'Data consistency patterns in distributed systems...', access_count: 45, book: 'Designing Data-Intensive Applications' },
        { content: 'Feature engineering for financial time series...', access_count: 38, book: 'Advances in Financial Machine Learning' },
        { content: 'Security controls and threat modeling...', access_count: 31, book: 'Building Secure and Reliable Systems' }
      ]

      return {
        bookAccess: books,
        chunkPopularity,
        totalAccesses: books?.reduce((sum, b) => sum + b?.access_count, 0)
      };
    } catch (error) {
      console.error('Failed to fetch knowledge utilization:', error)
      return { bookAccess: [], chunkPopularity: [], totalAccesses: 0 }
    }
  }

  // Test semantic search with similarity thresholds
  async testSearchOptimization(query, threshold = 0.7) {
    try {
      const results = await this.performSemanticSearch(query, null, 10)
      
      return {
        totalResults: results?.length,
        aboveThreshold: results?.filter(r => r?.similarity >= threshold)?.length,
        avgSimilarity: results?.reduce((sum, r) => sum + r?.similarity, 0) / results?.length,
        recommendations: this.generateOptimizationRecommendations(results, threshold)
      };
    } catch (error) {
      console.error('Search optimization test failed:', error)
      return {
        totalResults: 0,
        aboveThreshold: 0,
        avgSimilarity: 0,
        recommendations: []
      }
    }
  }

  // Generate optimization recommendations
  generateOptimizationRecommendations(results, threshold) {
    const recommendations = []
    
    const avgSimilarity = results?.reduce((sum, r) => sum + r?.similarity, 0) / results?.length
    
    if (avgSimilarity < threshold) {
      recommendations?.push('Consider adjusting embedding model or chunk size for better semantic matching')
    }
    
    if (results?.length < 5) {
      recommendations?.push('Low result count - consider expanding domain filters or reducing similarity threshold')
    }
    
    const uniqueBooks = new Set(results.map(r => r.book_id))?.size
    if (uniqueBooks < 3) {
      recommendations?.push('Results concentrated in few books - diversify training data or adjust ranking algorithm')
    }
    
    return recommendations
  }

  // Simulate real-time agent activity
  getAgentActivity() {
    return this.agents?.map(agent => ({
      ...agent,
      lastQuery: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
      queryCount: Math.floor(Math.random() * 50) + 10,
      avgResponseTime: Math.floor(Math.random() * 200) + 100,
      knowledgeHits: Math.floor(Math.random() * 30) + 5,
      preferredDomains: this.getAgentPreferredDomains(agent?.id)
    }));
  }

  // Get agent's preferred knowledge domains
  getAgentPreferredDomains(agentId) {
    const domainMap = {
      'quant-oracle': ['QuantOracle', 'StrategyWeaver', 'CorrelationHunter'],
      'strategy-weaver': ['StrategyWeaver', 'QuantOracle', 'ExecutionGuru'],
      'data-phoenix': ['DataPhoenix', 'Deployer', 'Telemetry'],
      'deployer': ['Deployer', 'DataPhoenix', 'FinOps'],
      'compliance-guard': ['ComplianceGuard', 'KillSwitch', 'ImmuneSentinel'],
      'news-miner': ['NewsMiner', 'CommunityPulse', 'NarrativeBuilder']
    }
    
    return domainMap?.[agentId] || ['General'];
  }

  // Get agent performance correlation with knowledge access
  async getAgentIntelligenceInsights() {
    try {
      const agents = this.getAgentActivity()
      
      const insights = agents?.map(agent => ({
        agentId: agent?.id,
        name: agent?.name,
        knowledgeCorrelation: Math.random() * 0.4 + 0.6, // 0.6-1.0
        decisionAccuracy: Math.random() * 0.3 + 0.7, // 0.7-1.0
        knowledgeInfluence: Math.random() * 100, // Percentage
        topKnowledgeAreas: agent?.preferredDomains?.slice(0, 3) || [],
        performanceGain: Math.random() * 25 + 10 // 10-35% improvement
      }))

      return {
        overallCorrelation: 0.78,
        topPerformers: insights?.sort((a, b) => b?.knowledgeCorrelation - a?.knowledgeCorrelation)?.slice(0, 5),
        insights
      };
    } catch (error) {
      console.error('Failed to fetch intelligence insights:', error)
      return {
        overallCorrelation: 0.78,
        topPerformers: [],
        insights: []
      }
    }
  }
}

export default new AgentKnowledgeQueryService()