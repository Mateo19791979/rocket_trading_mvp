import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour exécuter du SQL direct
export const executeSQL = async (query) => {
  try {
    const { data, error } = await supabase?.rpc('sql', { query });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('SQL Error:', err);
    return { data: null, error: err };
  }
};

// Fonction pour les vérifications de diagnostic
export const runDiagnosticQuery = async (query) => {
  try {
    // Essayer d'abord avec une requête directe
    const { data, error } = await supabase?.from('pg_stat_user_tables')?.select('*')?.limit(1);
    
    if (error) {
      // Fallback : utiliser une fonction RPC si elle existe
      const { data: rpcData, error: rpcError } = await supabase?.rpc('execute_diagnostic_query', { sql_query: query });
      if (rpcError) throw rpcError;
      return { data: rpcData, error: null };
    }
    
    // Si la requête de test fonctionne, exécuter la vraie requête
    const { data: result, error: queryError } = await supabase?.rpc('sql', { query });
    if (queryError) throw queryError;
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Diagnostic Query Error:', err);
    return { 
      data: null, 
      error: { 
        message: err?.message || 'Erreur lors de l\'exécution de la requête',
        details: err
      }
    };
  }
};