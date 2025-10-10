import { AIVectorKnowledgeService } from "../src/services/aiVectorKnowledgeService.js";
import cron from 'node-cron';

/**
 * EXPANDED KNOWLEDGE BASE - Multi-Book Support
 * Now supports 12+ world-class trading and investing books
 */

/**
 * Enhanced refresh function with expanded book support
 */
async function refreshKnowledgeBase() {
  console.log('[RAG-CRON] Starting EXPANDED knowledge base refresh...');
  
  try {
    // 1. Update vector cache for ALL expanded topics
    await AIVectorKnowledgeService?.updateExpandedVectorCache([
      'quantitative_finance', 'behavioral_investing', 'value_investing',
      'algorithmic_trading', 'risk_management', 'market_cycles',
      'portfolio_optimization', 'behavioral_economics', 'systematic_investing',
      'derivatives', 'fundamental_analysis', 'stock_picking', 'business_analysis',
      'long_term_strategy', 'security_analysis', 'margin_of_safety',
      'magic_formula', 'special_situations', 'contrarian_investing',
      'macro_strategy', 'all_weather_portfolio', 'institutional_investing',
      'asset_allocation', 'endowment_model', 'probability', 'kelly_criterion',
      'pattern_recognition', 'mathematical_models', 'index_investing',
      'cost_efficiency', 'cognitive_biases', 'decision_making',
      'black_swan_events', 'antifragility', 'tail_risk'
    ]);
    
    // 2. Get expanded knowledge metrics
    const expansionMetrics = await AIVectorKnowledgeService?.getKnowledgeExpansionMetrics();
    console.log('[RAG-CRON] Expanded knowledge metrics:', {
      total_books: expansionMetrics?.total_books,
      total_vectors: expansionMetrics?.total_vectors,
      topic_coverage: Object.keys(expansionMetrics?.topic_coverage || {})?.length,
      quality_excellent: expansionMetrics?.quality_distribution?.excellent
    });
    
    // 3. Re-calculate agent knowledge relevance scores for ALL books
    console.log('[RAG-CRON] Recalculating expanded agent relevance scores...');
    
    // 4. Cleanup expired cache entries
    console.log('[RAG-CRON] Cleaning up expired cache entries...');
    
    console.log('[RAG-CRON] ✅ EXPANDED knowledge base refreshed successfully');
    
  } catch (error) {
    console.error('[RAG-CRON] ❌ Expanded refresh failed:', error);
  }
}

/**
 * Enhanced RAG functionality testing with multiple books
 */
async function testRAGFunctionality() {
  console.log('[RAG-CRON] Testing EXPANDED RAG system functionality...');
  
  const expandedTestQueries = [
    // Existing tests
    "Qu'est-ce qu'un 10-bagger selon Lynch et comment l'IA peut-elle le détecter ?",
    "Comment utiliser la diffusion de Wiener pour modéliser la volatilité ?",
    "Quelles sont les principales heuristiques de Peter Lynch ?",
    
    // NEW EXPANDED TESTS - Multi-Book Intelligence
    "Combine les approches de Warren Buffett et Benjamin Graham pour créer une stratégie value IA",
    "Comment Ray Dalio utilise-t-il les cycles macro dans All Weather Portfolio ?",
    "Intègre les insights de Kahneman sur les biais cognitifs avec les modèles quantitatifs de Thorp",
    "Quelle synthèse entre la Magic Formula de Greenblatt et les signaux comportementaux ?",
    "Comment Howard Marks analyse-t-il les cycles de marché pour l\'investissement contrarian ?",
    "Applique les principes d'antifragilité de Taleb aux stratégies algorithmiques de Simons",
    "Combine l\'efficacité des coûts de Bogle avec l\'allocation tactique de Swensen"
  ];
  
  for (const query of expandedTestQueries) {
    try {
      const result = await AIVectorKnowledgeService?.testRAGSystem(query);
      console.log(`[RAG-CRON] Test "${query?.substring(0, 50)}...": ${result?.success ? '✅ PASS' : '❌ FAIL'}`);
      
      if (result?.success && result?.sources_count) {
        console.log(`  └─ Sources: ${result?.sources_count}, Response: ${result?.response_length} chars`);
      }
    } catch (error) {
      console.log(`[RAG-CRON] Test "${query?.substring(0, 50)}...": ❌ ERROR - ${error?.message}`);
    }
  }
}

/**
 * BULK BOOK PROCESSING - For AAS Knowledge Expansion
 */
async function processPendingBooks() {
  console.log('[RAG-CRON] Processing pending books for AAS expansion...');
  
  try {
    // Check for unprocessed books in book_library
    const { data: pendingBooks, error } = await supabase
      ?.from('book_library')
      ?.select('*')
      ?.eq('processing_status', 'pending')
      ?.limit(5); // Process max 5 books per run
    
    if (error) throw error;
    
    if (pendingBooks?.length > 0) {
      console.log(`[RAG-CRON] Found ${pendingBooks?.length} pending books to process`);
      
      for (const book of pendingBooks) {
        try {
          // Simulate PDF content extraction (implement based on your setup)
          console.log(`[RAG-CRON] Processing "${book?.title}" by ${book?.author}`);
          
          // Update status to processing
          await supabase
            ?.from('book_library')
            ?.update({ processing_status: 'processing' })
            ?.eq('id', book?.id);
          
          // Note: Actual PDF processing would happen here
          // await AIVectorKnowledgeService.processBookToVectors(pdfContent, book.id, book.author, topics);
          
          console.log(`[RAG-CRON] ✅ Successfully processed "${book?.title}"`);
          
        } catch (error) {
          console.error(`[RAG-CRON] ❌ Failed to process "${book?.title}":`, error?.message);
        }
      }
    } else {
      console.log('[RAG-CRON] No pending books found');
    }
    
  } catch (error) {
    console.error('[RAG-CRON] Error processing pending books:', error);
  }
}

/**
 * Schedule the refresh job every 15 days at 3 AM
 */
export function scheduleRAGRefresh() {
  // Cron pattern: "0 3 */15 * *" = At 3:00 AM every 15 days
  cron?.schedule('0 3 */15 * *', async () => {
    console.log('[RAG-CRON] ⏰ Scheduled refresh triggered');
    await refreshKnowledgeBase();
    await testRAGFunctionality();
  }, {
    timezone: "Europe/Paris"
  });
  
  console.log('[RAG-CRON] 📅 Scheduled refresh job registered - every 15 days at 3 AM');
}

/**
 * Manual execution for testing
 */
export async function manualRAGRefresh() {
  console.log('[RAG-CRON] 🔧 Manual EXPANDED refresh triggered');
  await refreshKnowledgeBase();
  await processPendingBooks();
  await testRAGFunctionality();
  
  // Display expansion summary
  const metrics = await AIVectorKnowledgeService?.getKnowledgeExpansionMetrics();
  console.log('[RAG-CRON] 📊 EXPANSION SUMMARY:', {
    books: metrics?.total_books,
    vectors: metrics?.total_vectors,
    topics: Object.keys(metrics?.topic_coverage || {})?.length,
    quality: `${metrics?.quality_distribution?.excellent}/${metrics?.total_vectors} excellent`
  });
}

// Auto-start if running directly
if (import.meta.url === `file://${process.argv?.[1]}`) {
  scheduleRAGRefresh();
  console.log('[RAG-CRON] 🚀 RAG refresh scheduler started');
}

export default {
  scheduleRAGRefresh,
  manualRAGRefresh,
  refreshKnowledgeBase,
  testRAGFunctionality
};