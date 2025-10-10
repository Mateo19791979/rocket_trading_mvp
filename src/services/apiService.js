// Centralized API service for Trading MVP using environment variable
const API_BASE = import.meta.env?.VITE_API_BASE || import.meta.env?.VITE_MVP_API_BASE || 'https://api.trading-mvp.com';

class TradingApiService {
  constructor() {
    this.baseURL = API_BASE;
    this.timeout = 10000;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers
      },
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller?.signal
      });
      
      clearTimeout(timeoutId);

      if (!response?.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response?.json();
      return { success: true, data, status: response?.status };
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Request timeout - API not responding');
      }
      
      if (error?.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to API - Check if API is running');
      }
      
      throw error;
    }
  }

  // Health check endpoint
  async getStatus() {
    return this.makeRequest('/status');
  }

  // Scores endpoint with window parameter
  async getScores(window = 5) {
    return this.makeRequest(`/scores?window=${window}`);
  }

  // Selected strategy endpoint
  async getSelected() {
    return this.makeRequest('/select');
  }

  // Additional endpoints for full API coverage
  async getStrategies(params = {}) {
    const query = new URLSearchParams(params)?.toString();
    return this.makeRequest(`/api/strategies${query ? '?' + query : ''}`);
  }
}

export const apiService = new TradingApiService();

// Legacy compatibility exports
export default apiService;