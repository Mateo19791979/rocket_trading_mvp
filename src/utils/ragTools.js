/**
 * RAG Tools - Utility functions for AI Knowledge Vector Management
 * Enhanced for multi-book AAS integration
 */

import { AIVectorKnowledgeService } from '../services/aiVectorKnowledgeService';

/**
 * BOOK RECOMMENDATION ENGINE - AAS Intelligence Amplifier
 * Recommends which books to add next based on current knowledge gaps
 */
export class BookRecommendationEngine {
  
  static MASTER_BOOK_CATALOG = {
    // Core Foundation (Priority 1)
    'Warren Buffett - Letters to Shareholders': {
      topics: ['value_investing', 'long_term_strategy', 'business_analysis'],
      difficulty: 'intermediate',
      complementary: ['Benjamin Graham', 'Charlie Munger'],
      aas_impact: 'high'
    },
    'Benjamin Graham - The Intelligent Investor': {
      topics: ['value_investing', 'security_analysis', 'margin_of_safety'],
      difficulty: 'intermediate', 
      complementary: ['Warren Buffett', 'Joel Greenblatt'],
      aas_impact: 'high'
    },
    'Ray Dalio - Principles': {
      topics: ['systematic_investing', 'macro_strategy', 'risk_management'],
      difficulty: 'advanced',
      complementary: ['Howard Marks', 'David Swensen'],
      aas_impact: 'very_high'
    },
    'Ed Thorp - Beat the Dealer': {
      topics: ['quantitative_trading', 'probability', 'kelly_criterion'],
      difficulty: 'advanced',
      complementary: ['Jim Simons', 'Thomas Mazzoni'],
      aas_impact: 'very_high'
    },
    
    // Advanced Intelligence (Priority 2)
    'Daniel Kahneman - Thinking Fast and Slow': {
      topics: ['behavioral_economics', 'cognitive_biases', 'decision_making'],
      difficulty: 'intermediate',
      complementary: ['Peter Lynch', 'Nassim Taleb'],
      aas_impact: 'high'
    },
    'Nassim Taleb - The Black Swan': {
      topics: ['black_swan_events', 'antifragility', 'tail_risk'],
      difficulty: 'advanced',
      complementary: ['Ray Dalio', 'Howard Marks'],
      aas_impact: 'high'
    },
    'Howard Marks - The Most Important Thing': {
      topics: ['market_cycles', 'risk_assessment', 'contrarian_investing'],
      difficulty: 'advanced',
      complementary: ['Ray Dalio', 'Nassim Taleb'],
      aas_impact: 'high'
    },
    
    // Specialized Expertise (Priority 3)
    'Joel Greenblatt - The Little Book That Beats the Market': {
      topics: ['magic_formula', 'quantitative_value', 'special_situations'],
      difficulty: 'beginner',
      complementary: ['Benjamin Graham', 'Ed Thorp'],
      aas_impact: 'medium'
    },
    'David Swensen - Pioneering Portfolio Management': {
      topics: ['institutional_investing', 'asset_allocation', 'endowment_model'],
      difficulty: 'advanced',
      complementary: ['Ray Dalio', 'Jack Bogle'],
      aas_impact: 'medium'
    },
    'Jack Bogle - The Little Book of Common Sense Investing': {
      topics: ['index_investing', 'cost_efficiency', 'long_term_investing'],
      difficulty: 'beginner',
      complementary: ['David Swensen', 'Warren Buffett'],
      aas_impact: 'medium'
    }
  };
  
  /**
   * Analyze knowledge gaps and recommend next books
   */
  static async recommendNextBooks(currentMetrics, targetTopics = [], maxRecommendations = 5) {
    try {
      const recommendations = [];
      const currentTopics = Object.keys(currentMetrics?.topic_coverage || {});
      
      // Find missing critical topics
      const missingTopics = targetTopics?.filter(topic => 
        !currentTopics?.includes(topic)
      ) || [];
      
      // Score books based on knowledge gaps
      for (const [bookTitle, bookInfo] of Object.entries(this.MASTER_BOOK_CATALOG)) {
        let score = this.calculateBookScore(bookInfo, currentTopics, missingTopics);
        
        if (score > 0) {
          recommendations?.push({
            title: bookTitle,
            score,
            topics: bookInfo?.topics,
            aas_impact: bookInfo?.aas_impact,
            difficulty: bookInfo?.difficulty,
            reasoning: this.generateRecommendationReasoning(bookInfo, missingTopics)
          });
        }
      }
      
      // Sort by score and return top recommendations
      return recommendations
        ?.sort((a, b) => b?.score - a?.score)
        ?.slice(0, maxRecommendations);
      
    } catch (error) {
      console.error('Error generating book recommendations:', error);
      return [];
    }
  }
  
  static calculateBookScore(bookInfo, currentTopics, missingTopics) {
    let score = 0;
    
    // High score for filling knowledge gaps
    const topicGapFill = bookInfo?.topics?.filter(topic => 
      missingTopics?.includes(topic)
    )?.length || 0;
    score += topicGapFill * 30;
    
    // Medium score for AAS impact
    const impactMultiplier = {
      'very_high': 25,
      'high': 15,
      'medium': 8,
      'low': 3
    };
    score += impactMultiplier?.[bookInfo?.aas_impact] || 0;
    
    // Penalty for topics already well covered
    const redundancy = bookInfo?.topics?.filter(topic => 
      currentTopics?.includes(topic)
    )?.length || 0;
    score -= redundancy * 5;
    
    return Math.max(0, score);
  }
  
  static generateRecommendationReasoning(bookInfo, missingTopics) {
    const reasons = [];
    
    const gapTopics = bookInfo?.topics?.filter(topic => 
      missingTopics?.includes(topic)
    );
    
    if (gapTopics?.length > 0) {
      reasons?.push(`Comble les lacunes: ${gapTopics?.join(', ')}`);
    }
    
    if (bookInfo?.aas_impact === 'very_high') {
      reasons?.push('Impact très élevé sur l\'AAS');
    }
    
    if (bookInfo?.complementary?.length > 0) {
      reasons?.push(`Synergie avec: ${bookInfo?.complementary?.slice(0, 2)?.join(', ')}`);
    }
    
    return reasons?.join(' • ');
  }
}

/**
 * KNOWLEDGE SYNTHESIS ENGINE - Multi-Book Intelligence Fusion
 */
export class KnowledgeSynthesisEngine {
  
  /**
   * Create cross-book knowledge synthesis
   */
  static async synthesizeKnowledge(topic, sourceBooks = [], maxSynthesis = 3) {
    try {
      const syntheses = [];
      
      // Generate synthesis queries that combine multiple authors
      const synthesisQueries = [
        `Comment ${sourceBooks?.[0]} et ${sourceBooks?.[1]} approchent-ils différemment ${topic} ?`,
        `Quelle synthèse innovante entre les approches de ${sourceBooks?.join(' et ')} sur ${topic} ?`,
        `Comment l'IA peut-elle combiner les insights de ${sourceBooks?.join(', ')} pour ${topic} ?`
      ];
      
      for (const query of synthesisQueries?.slice(0, maxSynthesis)) {
        try {
          const result = await AIVectorKnowledgeService?.ragQuery(query, null, 8);
          
          if (result?.answer) {
            syntheses?.push({
              query,
              synthesis: result?.answer,
              source_diversity: result?.source_diversity,
              knowledge_breadth: result?.knowledge_breadth
            });
          }
        } catch (error) {
          console.error(`Synthesis error for query: ${query}`, error);
        }
      }
      
      return syntheses;
      
    } catch (error) {
      console.error('Error in knowledge synthesis:', error);
      return [];
    }
  }
}

/**
 * AAS INTELLIGENCE METRICS - Performance Tracking
 */
export class AASIntelligenceMetrics {
  
  /**
   * Calculate AAS intelligence amplification from expanded knowledge
   */
  static async calculateIntelligenceAmplification() {
    try {
      const metrics = await AIVectorKnowledgeService?.getKnowledgeExpansionMetrics();
      
      const amplification = {
        knowledge_diversity_score: this.calculateDiversityScore(metrics),
        topic_coverage_score: this.calculateCoverageScore(metrics),
        quality_excellence_ratio: this.calculateQualityRatio(metrics),
        aas_efficiency_multiplier: 1.0,
        recommendations: []
      };
      
      // Calculate efficiency multiplier based on knowledge expansion
      amplification.aas_efficiency_multiplier = 
        1 + (amplification?.knowledge_diversity_score * 0.3) +
        (amplification?.topic_coverage_score * 0.4) +
        (amplification?.quality_excellence_ratio * 0.3);
      
      // Generate recommendations
      if (amplification?.topic_coverage_score < 0.7) {
        amplification?.recommendations?.push('Ajouter plus de livres pour couvrir les domaines manquants');
      }
      
      if (amplification?.quality_excellence_ratio < 0.6) {
        amplification?.recommendations?.push('Améliorer la qualité des vecteurs existants');
      }
      
      return amplification;
      
    } catch (error) {
      console.error('Error calculating intelligence amplification:', error);
      return null;
    }
  }
  
  static calculateDiversityScore(metrics) {
    const uniqueSources = metrics?.total_books || 0;
    return Math.min(uniqueSources / 15, 1.0); // Target: 15 diverse sources
  }
  
  static calculateCoverageScore(metrics) {
    const coveredTopics = Object.keys(metrics?.topic_coverage || {})?.length;
    return Math.min(coveredTopics / 25, 1.0); // Target: 25 topic areas
  }
  
  static calculateQualityRatio(metrics) {
    const total = metrics?.total_vectors || 1;
    const excellent = metrics?.quality_distribution?.excellent || 0;
    return excellent / total;
  }
}

/**
 * Utility functions
 */
export const ragTools = {
  BookRecommendationEngine,
  KnowledgeSynthesisEngine,
  AASIntelligenceMetrics,
  
  // Quick access functions
  async getRecommendations() {
    const metrics = await AIVectorKnowledgeService?.getKnowledgeExpansionMetrics();
    return BookRecommendationEngine?.recommendNextBooks(metrics);
  },
  
  async getIntelligenceScore() {
    return AASIntelligenceMetrics?.calculateIntelligenceAmplification();
  },
  
  async synthesizeTopic(topic, sources) {
    return KnowledgeSynthesisEngine?.synthesizeKnowledge(topic, sources);
  }
};

export default ragTools;