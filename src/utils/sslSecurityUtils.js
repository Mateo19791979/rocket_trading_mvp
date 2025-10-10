import React, { useState, useEffect } from 'react';
// SSL Security Utilities for Mixed Content Detection and Auto-HTTPS Upgrade
// Résolution du problème "Non sécurisé" sans créer de nouvelles pages

class SSLSecurityManager {
  constructor() {
    this.mixedContentErrors = [];
    this.upgradedRequests = [];
    this.isHttpsUpgradeActive = false;
    this.localhostExceptionUrls = new Set(); // Track localhost exceptions
    this.init();
  }

  init() {
    this.setupHttpsUpgrade();
    this.setupMixedContentDetection();
    this.logSecurityStatus();
  }

  // Check if URL should be exempt from HTTPS upgrade (localhost development)
  isLocalhostException(url) {
    if (typeof url !== 'string') return false;
    
    // Localhost patterns that should remain HTTP in development
    const localhostPatterns = [
      /^http:\/\/localhost(:\d+)?/,
      /^http:\/\/127\.0\.0\.1(:\d+)?/,
      /^http:\/\/\[::1\](:\d+)?/, // IPv6 localhost
      /^http:\/\/0\.0\.0\.0(:\d+)?/
    ];
    
    // Check if current environment is development
    const isDevelopment = window.location?.hostname === 'localhost' || 
                         window.location?.hostname === '127.0.0.1' ||
                         window.location?.hostname?.includes('localhost') ||
                         import.meta.env?.DEV;
    
    if (!isDevelopment) return false;
    
    return localhostPatterns?.some(pattern => pattern?.test(url));
  }

  // Wrapper fetch() pour upgrader automatiquement http → https (avec exceptions localhost)
  setupHttpsUpgrade() {
    if (typeof window === 'undefined') return;

    const _fetch = window.fetch;
    
    window.fetch = (input, init) => {
      try {
        let url = typeof input === 'string' ? input : input?.url;
        
        // Upgrader http:// vers https:// (sauf exceptions localhost en développement)
        if (url?.startsWith('http://')) {
          const originalUrl = url;
          
          // Vérifier si c'est une exception localhost
          if (this.isLocalhostException(url)) {
            console.info('[SSL-SECURITY-SKIP] Requête localhost exemptée du passage HTTPS:', url);
            this.localhostExceptionUrls?.add(originalUrl);
          } else {
            url = url?.replace('http://', 'https://');
            
            // Mettre à jour l'input
            if (typeof input === 'string') {
              input = url;
            } else {
              input = new Request(url, input);
            }
            
            console.warn('[SSL-SECURITY-UPGRADE] Requête upgradée:', originalUrl, '→', url);
            this.upgradedRequests?.push({
              original: originalUrl,
              upgraded: url,
              timestamp: new Date()?.toISOString()
            });
          }
        }
      } catch (error) {
        console.error('[SSL-SECURITY-UPGRADE] Erreur lors de l\'upgrade:', error);
      }
      
      return _fetch(input, init);
    };

    this.isHttpsUpgradeActive = true;
    console.info('[SSL-SECURITY] ✅ Auto-upgrade HTTPS activé (avec exceptions localhost développement)');
  }

  // Détection du contenu mixte
  setupMixedContentDetection() {
    if (typeof window === 'undefined') return;

    // Observer les erreurs de sécurité
    window.addEventListener('securitypolicyviolation', (event) => {
      if (event?.violatedDirective === 'upgrade-insecure-requests') {
        this.mixedContentErrors?.push({
          blockedURI: event?.blockedURI,
          violatedDirective: event?.violatedDirective,
          originalPolicy: event?.originalPolicy,
          timestamp: new Date()?.toISOString()
        });
        
        console.warn('[SSL-SECURITY] Contenu mixte détecté et bloqué:', event?.blockedURI);
      }
    });

    // Scanner les éléments existants pour du contenu HTTP
    this.scanExistingContent();
  }

  scanExistingContent() {
    if (typeof document === 'undefined') return;

    const httpResources = [];
    
    // Scanner les images
    document.querySelectorAll('img[src^="http://"]')?.forEach(img => {
      httpResources?.push({ type: 'image', url: img?.src, element: img });
    });

    // Scanner les scripts
    document.querySelectorAll('script[src^="http://"]')?.forEach(script => {
      httpResources?.push({ type: 'script', url: script?.src, element: script });
    });

    // Scanner les liens CSS
    document.querySelectorAll('link[href^="http://"]')?.forEach(link => {
      httpResources?.push({ type: 'stylesheet', url: link?.href, element: link });
    });

    if (httpResources?.length > 0) {
      console.warn('[SSL-SECURITY] Ressources HTTP détectées:', httpResources);
      
      // Auto-correction des ressources HTTP (en excluant localhost en dev)
      httpResources?.forEach(resource => {
        // Skip localhost resources in development
        if (this.isLocalhostException(resource?.url)) {
          console.info('[SSL-SECURITY-SKIP] Ressource localhost exemptée:', resource?.url);
          return;
        }
        
        const httpsUrl = resource?.url?.replace('http://', 'https://');
        
        if (resource?.type === 'image') {
          resource.element.src = httpsUrl;
        } else if (resource?.type === 'script') {
          resource.element.src = httpsUrl;
        } else if (resource?.type === 'stylesheet') {
          resource.element.href = httpsUrl;
        }
        
        console.info('[SSL-SECURITY] ✅ Ressource upgradée:', resource?.url, '→', httpsUrl);
      });
    }
  }

  // Diagnostic SSL complet
  runSSLDiagnostic() {
    const diagnostic = {
      protocol: window.location?.protocol,
      hostname: window.location?.hostname,
      isSecure: window.location?.protocol === 'https:',
      isDevelopment: import.meta.env?.DEV || window.location?.hostname === 'localhost',
      mixedContentErrors: this.mixedContentErrors?.length,
      upgradedRequests: this.upgradedRequests?.length,
      localhostExceptions: this.localhostExceptionUrls?.size,
      hasCSP: this.hasSecurityHeaders(),
      hasHSTS: this.hasHSTSHeader(),
      timestamp: new Date()?.toISOString()
    };

    console.group('[SSL-SECURITY] 🔍 Diagnostic complet');
    console.info('Protocole actuel:', diagnostic?.protocol);
    console.info('Domaine:', diagnostic?.hostname);
    console.info('Mode développement:', diagnostic?.isDevelopment ? '✅' : '❌');
    console.info('Connexion sécurisée:', diagnostic?.isSecure ? '✅' : '❌');
    console.info('Erreurs contenu mixte:', diagnostic?.mixedContentErrors);
    console.info('Requêtes upgradées:', diagnostic?.upgradedRequests);
    console.info('Exceptions localhost:', diagnostic?.localhostExceptions);
    console.info('CSP upgrade-insecure-requests:', diagnostic?.hasCSP ? '✅' : '❌');
    console.info('HSTS header:', diagnostic?.hasHSTS ? '✅' : '❌');
    console.groupEnd();

    return diagnostic;
  }

  // Vérifier la présence des headers de sécurité
  hasSecurityHeaders() {
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return metaCSP && metaCSP?.content?.includes('upgrade-insecure-requests');
  }

  hasHSTSHeader() {
    const metaHSTS = document.querySelector('meta[http-equiv="Strict-Transport-Security"]');
    return metaHSTS !== null;
  }

  // Status de sécurité pour le monitoring
  getSecurityStatus() {
    return {
      httpsUpgradeActive: this.isHttpsUpgradeActive,
      mixedContentErrors: this.mixedContentErrors,
      upgradedRequests: this.upgradedRequests,
      localhostExceptions: Array.from(this.localhostExceptionUrls),
      lastDiagnostic: this.runSSLDiagnostic()
    };
  }

  // Logger le statut de sécurité
  logSecurityStatus() {
    setTimeout(() => {
      const diagnostic = this.runSSLDiagnostic();
      
      if (!diagnostic?.isSecure && !diagnostic?.isDevelopment) {
        console.error('[SSL-SECURITY] ⚠️ PROBLÈME: Site non sécurisé - Protocol:', diagnostic?.protocol);
        console.error('[SSL-SECURITY] 💡 SOLUTION: Vérifiez le certificat SSL pour', diagnostic?.hostname);
      } else if (diagnostic?.isDevelopment) {
        console.info('[SSL-SECURITY] 🛠️ Mode développement - Exceptions localhost actives');
      } else {
        console.info('[SSL-SECURITY] ✅ Site sécurisé - HTTPS actif');
      }
    }, 1000);
  }

  // Force une URL vers HTTPS (avec exception localhost en dev)
  static forceHttps(url) {
    if (typeof url !== 'string') return url;
    
    // En mode développement, garder localhost en HTTP
    const isDev = import.meta.env?.DEV || window?.location?.hostname === 'localhost';
    if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/?.test(url)) {
      return url; // Garder HTTP pour localhost en développement
    }
    
    return url?.replace(/^http:\/\//, 'https://');
  }

  // Vérifier si une URL est sécurisée (ou exception localhost valide)
  static isSecureUrl(url) {
    if (typeof url !== 'string') return false;
    
    // URLs sécurisées ou relatives
    if (url?.startsWith('https://') || url?.startsWith('//') || url?.startsWith('/')) {
      return true;
    }
    
    // Exception localhost en développement
    const isDev = import.meta.env?.DEV || window?.location?.hostname === 'localhost';
    if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/?.test(url)) {
      return true; // Considérer localhost HTTP comme "sécurisé" en dev
    }
    
    return false;
  }
}

// Instance globale
export const sslSecurity = new SSLSecurityManager();

// Utilitaires exportés
export const forceHttps = SSLSecurityManager?.forceHttps;
export const isSecureUrl = SSLSecurityManager?.isSecureUrl;

// Hook React pour le statut de sécurité
export function useSSLSecurity() {
  const [status, setStatus] = React.useState(null);
  
  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(sslSecurity?.getSecurityStatus());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return status;
}

// Make sslSecurity globally available for any legacy code
if (typeof window !== 'undefined') {
  window.sslSecurity = sslSecurity;
}

export default sslSecurity;