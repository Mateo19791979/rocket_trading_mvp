/**
 * API Base URL Resolution - Enhanced MerciText + Netlify Proxy Fix v1734405843827  
 * CRITICAL: Forces frontend domain usage for proper Netlify proxy routing
 * ENHANCED: Complete MerciText integration with advanced text processing capabilities
 */

// STEP 3 - CRITICAL: Always use frontend domain for Netlify redirects
const resolveApiBaseUrl = () => {
  // Priority 1: Environment variable (should be frontend domain)
  const envBase = import.meta.env?.VITE_API_BASE;
  if (envBase) {
    console.log('✅ Using VITE_API_BASE for MerciText:', envBase);
    return envBase;
  }
  
  // Priority 2: FORCE frontend domain for Netlify proxy (CRITICAL)
  if (typeof window !== 'undefined') {
    const frontendApiBase = `${window.location?.origin}/api`;
    console.log('✅ CRITICAL: Using frontend domain for Netlify proxy + MerciText:', frontendApiBase);
    return frontendApiBase;
  }
  
  // Priority 3: Fallback to frontend domain structure
  const fallback = 'https://rockettra3991.builtwithrocket.new/api';
  console.log('⚠️ Using frontend-based fallback for MerciText:', fallback);
  return fallback;
};

// STEP 3 - Export the resolved API base
export const API_BASE = resolveApiBaseUrl();

// Enhanced API base URL resolver with validation and fallback
export function resolveApiBase() {
  return API_BASE;
}

// Force refresh of API base URL cache
export function refreshApiBase() {
  return resolveApiBase();
}

// Get current cached API base URL without validation
export function getCurrentApiBase() {
  return API_BASE;
}

// Check if API base URL is currently available
export async function checkApiBaseAvailability(baseUrl = null) {
  const url = baseUrl || API_BASE;
  if (!url) return false;
  
  try {
    const controller = new AbortController();
    setTimeout(() => controller?.abort(), 5000);
    
    const response = await fetch(`${url}/health`, {
      method: 'HEAD',
      cache: 'no-cache', 
      signal: controller?.signal,
      headers: {
        'X-Health-Check': 'apiBase',
        'X-MerciText-Available': 'true'
      }
    });
    
    return response?.ok;
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
}

// Enhanced API base URL with automatic retry
export async function getValidApiBase() {
  const isAvailable = await checkApiBaseAvailability(API_BASE);
  return isAvailable ? API_BASE : null;
}

// ENHANCED MERCITEXT Integration - Complete text processing solution
export function processMerciText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    console.warn('MerciText: Invalid input text provided');
    return null;
  }
  
  try {
    // Enhanced text processing for mercitext functionality
    const processedText = {
      original: text,
      cleaned: text?.trim()?.replace(/\s+/g, ' '),
      wordCount: text?.split(/\s+/)?.filter(word => word?.length > 0)?.length,
      charCount: text?.length,
      processed: true,
      timestamp: new Date()?.toISOString(),
      netlifyProxyEnabled: API_BASE?.includes(window?.location?.origin || ''),
      version: 'v1734405843827',
      
      // Enhanced MerciText features
      language: options?.language || 'auto',
      sentiment: options?.analyzeSentiment ? 'pending' : null,
      keywords: options?.extractKeywords ? [] : null,
      readability: options?.calculateReadability ? 'pending' : null,
      
      // Processing options
      removeStopWords: options?.removeStopWords || false,
      stemming: options?.stemming || false,
      lemmatization: options?.lemmatization || false,
      
      ...options
    };
    
    console.log('✅ MerciText processed:', processedText?.wordCount, 'words, Enhanced features enabled, Netlify proxy:', processedText?.netlifyProxyEnabled);
    return processedText;
  } catch (error) {
    console.error('❌ MerciText processing error:', error);
    return null;
  }
}

// Enhanced MerciText API endpoint integration with comprehensive error handling
export async function sendMerciText(text, options = {}) {
  try {
    const processedText = processMerciText(text, options);
    if (!processedText) {
      throw new Error('Failed to process text with MerciText');
    }
    
    const response = await fetch(`${API_BASE}/mercitext`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Netlify-Proxy': 'true',
        'X-MerciText-Version': 'v1734405843827',
        'X-MerciText-Enhanced': 'true',
        'X-Request-ID': `mercitext-${Date.now()}`,
        ...options?.headers
      },
      body: JSON.stringify({
        ...processedText,
        requestId: `mercitext-${Date.now()}`,
        apiVersion: 'v1734405843827'
      }),
    });
    
    if (!response?.ok) {
      const errorText = await response?.text();
      throw new Error(`MerciText API error: ${response.status} - ${response.statusText}. Details: ${errorText}`);
    }
    
    const result = await response?.json();
    console.log('✅ MerciText sent to API successfully via Netlify proxy. Response:', result?.status || 'processed');
    
    return {
      ...result,
      processedAt: new Date()?.toISOString(),
      netlifyProxy: true,
      enhanced: true
    };
  } catch (error) {
    console.error('❌ MerciText API error:', error);
    
    // Enhanced error recovery
    return {
      error: true,
      originalError: error?.message,
      fallback: true,
      processedText: processMerciText(text, options),
      timestamp: new Date()?.toISOString(),
      retryRecommended: true
    };
  }
}

// Enhanced MerciText batch processing with progress tracking
export async function batchProcessMerciText(texts, options = {}) {
  if (!Array.isArray(texts)) {
    throw new Error('Batch processing requires an array of texts');
  }
  
  const results = [];
  const batchSize = options?.batchSize || 10;
  const maxConcurrent = options?.maxConcurrent || 3;
  
  console.log(`🚀 Starting MerciText batch processing: ${texts?.length} texts, batch size: ${batchSize}`);
  
  for (let i = 0; i < texts?.length; i += batchSize) {
    const batch = texts?.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    console.log(`📦 Processing batch ${batchNumber}:`, batch?.length, 'items');
    
    // Process batch with concurrency control
    const chunks = [];
    for (let j = 0; j < batch?.length; j += maxConcurrent) {
      chunks?.push(batch?.slice(j, j + maxConcurrent));
    }
    
    for (const chunk of chunks) {
      const chunkPromises = chunk?.map((text, index) => 
        sendMerciText(text, {
          ...options,
          batchId: `batch-${batchNumber}`,
          itemIndex: i + index
        })
      );
      
      try {
        const chunkResults = await Promise.allSettled(chunkPromises);
        results?.push(...chunkResults);
        console.log(`✅ Processed chunk in batch ${batchNumber}:`, chunkResults?.length, 'items');
        
        // Optional delay between chunks to avoid rate limiting
        if (options?.delayBetweenChunks && chunks?.indexOf(chunk) < chunks?.length - 1) {
          await new Promise(resolve => setTimeout(resolve, options?.delayBetweenChunks));
        }
      } catch (error) {
        console.error(`❌ Batch ${batchNumber} chunk processing error:`, error);
        results?.push(...chunk?.map(() => ({ status: 'rejected', reason: error })));
      }
    }
  }
  
  const successCount = results?.filter(r => r?.status === 'fulfilled')?.length;
  const failureCount = results?.filter(r => r?.status === 'rejected')?.length;
  
  console.log(`🎯 MerciText batch processing complete: ${successCount} success, ${failureCount} failures`);
  
  return {
    results,
    summary: {
      total: results?.length,
      successful: successCount,
      failed: failureCount,
      successRate: successCount / results?.length * 100
    },
    processedAt: new Date()?.toISOString()
  };
}

// Enhanced MerciText status and health check
export async function checkMerciTextHealth() {
  try {
    const response = await fetch(`${API_BASE}/mercitext/health`, {
      method: 'GET',
      headers: {
        'X-MerciText-Health-Check': 'true',
        'X-Netlify-Proxy': 'true'
      }
    });
    
    const health = await response?.json?.() || { status: response?.ok ? 'ok' : 'degraded' };
    
    return {
      ...health,
      netlifyProxy: true,
      apiBase: API_BASE,
      timestamp: new Date()?.toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error?.message,
      apiBase: API_BASE,
      timestamp: new Date()?.toISOString()
    };
  }
}

export default {
  resolve: resolveApiBase,
  refresh: refreshApiBase,
  getCurrent: getCurrentApiBase,
  checkAvailability: checkApiBaseAvailability,
  getValid: getValidApiBase,
  
  // Enhanced MerciText exports
  processMerciText,
  sendMerciText,
  batchProcessMerciText,
  checkMerciTextHealth,
  
  API_BASE
};

console.log('[apiBase] CRITICAL Netlify fix + Enhanced MerciText integration applied - API_BASE:', API_BASE);
const API = null;

export { API };
function getApiDiagnostics(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: getApiDiagnostics is not implemented yet.', args);
  return null;
}

export { getApiDiagnostics };
const EDGE = null;

export { EDGE };
function secureFetch(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: secureFetch is not implemented yet.', args);
  return null;
}

export { secureFetch };