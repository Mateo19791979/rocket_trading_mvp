// Service pour la gestion des configurations de courtage

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';

/**
 * Sauvegarde la configuration IBKR sur le serveur
 * @param {Object} config - Configuration IBKR {host, port, account, connectionType}
 * @returns {Promise<Object>} - Réponse du serveur
 */
export async function saveIBKRConfig(config) {
  try {
    console.log('[brokerService] Sauvegarde config IBKR:', config);
    
    const response = await fetch(`${API_BASE_URL}/ibkr/config`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        host: config?.host || "127.0.0.1",
        port: parseInt(config?.port) || 4001,
        account: config?.account || "",
        connectionType: config?.connectionType || "paper",
        timestamp: new Date()?.toISOString()
      }),
    });

    if (!response?.ok) {
      const error = await response?.text();
      throw new Error(`Erreur sauvegarde IBKR (${response.status}): ${error}`);
    }

    const result = await response?.json();
    console.log('[brokerService] Config IBKR sauvegardée avec succès:', result);
    
    // Store in localStorage as backup
    localStorage.setItem('ibkr_config_backup', JSON.stringify({
      ...config,
      savedAt: Date.now()
    }));
    
    return result;
  } catch (error) {
    console.error('[brokerService] Erreur saveIBKRConfig:', error);
    
    // Fallback: save to localStorage if server fails
    try {
      localStorage.setItem('ibkr_config_fallback', JSON.stringify({
        ...config,
        savedAt: Date.now(),
        source: 'fallback'
      }));
      console.log('[brokerService] Config sauvegardée en fallback localStorage');
    } catch (fallbackError) {
      console.error('[brokerService] Fallback save failed:', fallbackError);
    }
    
    throw error;
  }
}

/**
 * Test la connexion IBKR
 * @returns {Promise<boolean>} - True si la connexion est OK
 */
export async function testIBKRConnection() {
  try {
    console.log('[brokerService] Test connexion IBKR...');
    
    const response = await fetch(`${API_BASE_URL}/ibkr/test`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      timeout: 10000 // 10 seconds timeout
    });

    const isConnected = response?.ok;
    
    if (isConnected) {
      const result = await response?.json();
      console.log('[brokerService] Test connexion IBKR réussi:', result);
      return true;
    } else {
      const error = await response?.text();
      console.warn('[brokerService] Test connexion IBKR échoué:', error);
      return false;
    }
  } catch (error) {
    console.error('[brokerService] Erreur testIBKRConnection:', error);
    return false;
  }
}

/**
 * Récupère la configuration IBKR actuelle
 * @returns {Promise<Object|null>} - Configuration actuelle ou null
 */
export async function getIBKRConfig() {
  try {
    console.log('[brokerService] Récupération config IBKR...');
    
    const response = await fetch(`${API_BASE_URL}/ibkr/config`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response?.ok) {
      const config = await response?.json();
      console.log('[brokerService] Config IBKR récupérée:', config);
      return config;
    } else {
      console.warn('[brokerService] Config IBKR non trouvée sur serveur, vérification localStorage...');
      
      // Fallback to localStorage
      const backup = localStorage.getItem('ibkr_config_backup');
      const fallback = localStorage.getItem('ibkr_config_fallback');
      
      if (backup) {
        const config = JSON.parse(backup);
        console.log('[brokerService] Config IBKR trouvée en backup localStorage:', config);
        return config;
      }
      
      if (fallback) {
        const config = JSON.parse(fallback);
        console.log('[brokerService] Config IBKR trouvée en fallback localStorage:', config);
        return config;
      }
      
      return null;
    }
  } catch (error) {
    console.error('[brokerService] Erreur getIBKRConfig:', error);
    
    // Try localStorage as last resort
    try {
      const backup = localStorage.getItem('ibkr_config_backup') || localStorage.getItem('ibkr_config_fallback');
      if (backup) {
        const config = JSON.parse(backup);
        console.log('[brokerService] Config IBKR récupérée depuis localStorage:', config);
        return config;
      }
    } catch (parseError) {
      console.error('[brokerService] Erreur parsing localStorage config:', parseError);
    }
    
    return null;
  }
}

/**
 * Réinitialise la configuration IBKR
 * @returns {Promise<boolean>} - True si la réinitialisation est OK
 */
export async function resetIBKRConfig() {
  try {
    console.log('[brokerService] Réinitialisation config IBKR...');
    
    // Try to reset on server
    try {
      const response = await fetch(`${API_BASE_URL}/ibkr/config`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (response?.ok) {
        console.log('[brokerService] Config IBKR réinitialisée sur serveur');
      } else {
        console.warn('[brokerService] Réinitialisation serveur échouée:', await response?.text());
      }
    } catch (serverError) {
      console.warn('[brokerService] Erreur réinitialisation serveur:', serverError);
    }
    
    // Clean localStorage
    localStorage.removeItem('ibkr_config_backup');
    localStorage.removeItem('ibkr_config_fallback');
    localStorage.removeItem('ibkr_config'); // Legacy key
    
    console.log('[brokerService] Config IBKR réinitialisée (localStorage nettoyé)');
    return true;
  } catch (error) {
    console.error('[brokerService] Erreur resetIBKRConfig:', error);
    return false;
  }
}

/**
 * Vérifie le statut IBKR
 * @returns {Promise<Object>} - Statut de la connexion IBKR
 */
export async function getIBKRStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/ibkr/status`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      timeout: 5000
    });

    if (response?.ok) {
      const status = await response?.json();
      return {
        connected: status?.connected || false,
        account: status?.account || null,
        connectionType: status?.connectionType || 'unknown',
        lastUpdate: status?.lastUpdate || Date.now(),
        gateway: status?.gateway || null
      };
    } else {
      return {
        connected: false,
        account: null,
        connectionType: 'unknown',
        lastUpdate: Date.now(),
        error: `HTTP ${response?.status}`
      };
    }
  } catch (error) {
    console.error('[brokerService] Erreur getIBKRStatus:', error);
    return {
      connected: false,
      account: null,
      connectionType: 'unknown',
      lastUpdate: Date.now(),
      error: error?.message
    };
  }
}

export default {
  saveIBKRConfig,
  testIBKRConnection,
  getIBKRConfig,
  resetIBKRConfig,
  getIBKRStatus
};