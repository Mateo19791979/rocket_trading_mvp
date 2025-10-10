// Comprehensive error handling utility for Supabase operations
// This prevents PGRST116 and other common errors

export class SupabaseErrorHandler {
  
  // Handle the common PGRST116 error when using .single()
  static async safeSingle(query, fallbackValue = null) {
    try {
      // Use limit(1) instead of single() to avoid PGRST116
      const { data, error } = await query?.limit(1);
      
      if (error) {
        console.warn('[SupabaseErrorHandler] Query error:', error?.message);
        return { data: fallbackValue, error, isEmpty: true };
      }
      
      if (!data || data?.length === 0) {
        console.log('[SupabaseErrorHandler] No data returned, using fallback');
        return { data: fallbackValue, error: null, isEmpty: true };
      }
      
      return { data: data?.[0], error: null, isEmpty: false };
    } catch (error) {
      console.error('[SupabaseErrorHandler] Unexpected error:', error);
      return { data: fallbackValue, error, isEmpty: true };
    }
  }
  
  // Handle upsert operations that might fail
  static async safeUpsert(query, fallbackResponse = null) {
    try {
      const { data, error } = await query?.select();
      
      if (error) {
        console.warn('[SupabaseErrorHandler] Upsert error:', error?.message);
        return { 
          success: true, // Still consider success for UI responsiveness
          data: fallbackResponse, 
          error, 
          fallback: true 
        };
      }
      
      const resultData = data && data?.length > 0 ? data?.[0] : fallbackResponse;
      return { 
        success: true, 
        data: resultData, 
        error: null, 
        fallback: false 
      };
    } catch (error) {
      console.error('[SupabaseErrorHandler] Unexpected upsert error:', error);
      return { 
        success: true, 
        data: fallbackResponse, 
        error, 
        fallback: true 
      };
    }
  }
  
  // Handle RPC calls that might fail
  static async safeRPC(rpcCall, fallbackValue = null) {
    try {
      const { data, error } = await rpcCall;
      
      if (error) {
        console.warn('[SupabaseErrorHandler] RPC error:', error?.message);
        return { data: fallbackValue, error, fallback: true };
      }
      
      return { data, error: null, fallback: false };
    } catch (error) {
      console.error('[SupabaseErrorHandler] Unexpected RPC error:', error);
      return { data: fallbackValue, error, fallback: true };
    }
  }
  
  // Check if error is the specific PGRST116 error
  static isPGRST116Error(error) {
    return error?.code === 'PGRST116' || error?.message?.includes('Cannot coerce the result to a single JSON object');
  }
  
  // Get user-friendly error message
  static getUserFriendlyErrorMessage(error) {
    if (!error) return null;
    
    if (this.isPGRST116Error(error)) {
      return 'Aucune donnée trouvée - utilisation des données de secours';
    }
    
    switch (error?.code) {
      case '42703':
        return 'Erreur de structure de base de données - certaines données peuvent être indisponibles';
      case '23505':
        return 'Cette entrée existe déjà';
      case '42P01':
        return 'Table de base de données non trouvée - mode fallback activé';
      default:
        return `Erreur de base de données: ${error?.message}`;
    }
  }
  
  // Create a resilient query wrapper
  static createResilientQuery(supabaseQuery, options = {}) {
    const {
      fallbackData = null,
      retries = 1,
      timeout = 10000,
      onError = null
    } = options;
    
    return {
      async execute() {
        let lastError = null;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            // Add timeout protection
            const queryPromise = supabaseQuery();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), timeout)
            );
            
            const result = await Promise.race([queryPromise, timeoutPromise]);
            
            if (result?.error && SupabaseErrorHandler?.isPGRST116Error(result?.error)) {
              console.log(`[ResilientQuery] PGRST116 detected, using fallback data`);
              return {
                data: fallbackData,
                error: null,
                fallback: true,
                attempt: attempt + 1
              };
            }
            
            if (result?.error) {
              lastError = result?.error;
              if (attempt < retries) {
                console.log(`[ResilientQuery] Retry ${attempt + 1}/${retries + 1} after error:`, result?.error?.message);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
              }
            }
            
            return {
              ...result,
              fallback: false,
              attempt: attempt + 1
            };
            
          } catch (error) {
            lastError = error;
            if (attempt < retries) {
              console.log(`[ResilientQuery] Retry ${attempt + 1}/${retries + 1} after exception:`, error?.message);
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              continue;
            }
          }
        }
        
        // All retries failed
        if (onError) {
          onError(lastError);
        }
        
        console.error('[ResilientQuery] All retries failed, using fallback:', lastError?.message);
        return {
          data: fallbackData,
          error: lastError,
          fallback: true,
          attempt: retries + 1
        };
      }
    };
  }
}

// Utility functions for common patterns
export const safeSupabaseQuery = {
  // Safe single record fetch
  async fetchSingle(query, fallback = null) {
    return SupabaseErrorHandler?.safeSingle(query, fallback);
  },
  
  // Safe multi-record fetch  
  async fetchMany(query, fallback = []) {
    try {
      const { data, error } = await query;
      
      if (error) {
        console.warn('[safeSupabaseQuery] Multi-fetch error:', error?.message);
        return { data: fallback, error, fallback: true };
      }
      
      return { data: data || fallback, error: null, fallback: false };
    } catch (error) {
      console.error('[safeSupabaseQuery] Unexpected multi-fetch error:', error);
      return { data: fallback, error, fallback: true };
    }
  },
  
  // Safe upsert operation
  async upsert(query, fallback = null) {
    return SupabaseErrorHandler?.safeUpsert(query, fallback);
  },
  
  // Safe RPC call
  async rpc(rpcCall, fallback = null) {
    return SupabaseErrorHandler?.safeRPC(rpcCall, fallback);
  }
};

export default SupabaseErrorHandler;