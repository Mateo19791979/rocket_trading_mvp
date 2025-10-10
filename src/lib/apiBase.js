// Centralise les bases d'URL
export const API  = import.meta.env?.VITE_API_BASE_URL  || "https://api.trading-mvp.com";
export const EDGE = import.meta.env?.VITE_EDGE_BASE_URL || "";

// Enhanced header creation with proper encoding and security
export const createSecureHeaders = (additionalHeaders = {}) => {
  const headers = {};
  
  // Get internal admin key and ensure it's ASCII only
  const adminKey = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || "";
  if (adminKey) {
    // Remove any non-ASCII characters that could cause encoding issues
    const cleanKey = adminKey?.replace(/[^\x00-\x7F]/g, "")?.trim();
    if (cleanKey) {
      headers["x-internal-key"] = cleanKey;
    }
  }
  
  // Standard headers
  headers["Content-Type"] = "application/json";
  headers["Accept"] = "application/json";
  
  // Add any additional headers, ensuring they're ASCII clean
  Object.entries(additionalHeaders)?.forEach(([key, value]) => {
    if (typeof key === 'string' && typeof value === 'string') {
      const cleanKey = key?.replace(/[^\x00-\x7F]/g, "")?.trim();
      const cleanValue = value?.replace(/[^\x00-\x7F]/g, "")?.trim();
      if (cleanKey && cleanValue) {
        headers[cleanKey] = cleanValue;
      }
    }
  });
  
  return headers;
};

// Enhanced fetch wrapper with JSON validation
export const secureFetch = async (endpoint, options = {}) => {
  try {
    // Force API domain, never use Rocket preview domain
    const url = `${API}${endpoint?.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const fetchOptions = {
      ...options,
      headers: {
        ...createSecureHeaders(),
        ...options?.headers
      }
    };
    
    // Ensure request body is properly encoded if present
    if (fetchOptions?.body && typeof fetchOptions?.body === 'string') {
      fetchOptions.body = fetchOptions?.body?.replace(/[^\x00-\x7F]/g, "");
    }
    
    const response = await fetch(url, fetchOptions);
    
    // Strict JSON content type validation
    const contentType = response?.headers?.get('content-type');
    if (!contentType || !contentType?.includes('application/json')) {
      throw new Error(`Backend API returning HTML document (likely error page) instead of JSON. Expected: application/json, Got: ${contentType || 'unknown'}. This indicates the endpoint is not implemented or backend server has routing issues.`);
    }
    
    return response;
  } catch (error) {
    // Re-throw with clean ASCII error message
    const cleanMessage = error?.message?.replace(/[^\x00-\x7F]/g, "");
    throw new Error(cleanMessage);
  }
};

// For debugging - log the resolved API base URL
if (import.meta.env?.DEV || import.meta.env?.VITE_DEBUG_API === 'true') {
  console.log(`🔗 API Base URL forced to: ${API}`);
  console.log(`   VITE_API_BASE_URL: ${import.meta.env?.VITE_API_BASE_URL || 'Not set'}`);
  console.log(`   VITE_INTERNAL_ADMIN_KEY: ${import.meta.env?.VITE_INTERNAL_ADMIN_KEY ? 'Set' : 'Not set'}`);
  console.log(`   Headers will be ASCII-only encoded`);
}