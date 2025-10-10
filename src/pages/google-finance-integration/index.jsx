import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { googleFinanceService } from '../../services/googleFinanceService';

import { ChevronUp, ChevronDown, TrendingUp, Activity, RefreshCw } from 'lucide-react';

const GoogleFinanceIntegration = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [syncStatus, setSyncStatus] = useState(null);
  const [marketStatus, setMarketStatus] = useState(null);

  // Default symbols to track
  const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

  useEffect(() => {
    initializeGoogleFinance();
    fetchMarketStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        refreshQuotes(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const initializeGoogleFinance = async () => {
    try {
      await googleFinanceService?.setupConfiguration();
      await fetchQuotes(defaultSymbols);
    } catch (error) {
      setError(`Erreur initialisation: ${error?.message}`);
    }
  };

  const fetchMarketStatus = async () => {
    try {
      const status = await googleFinanceService?.getMarketStatus();
      setMarketStatus(status);
    } catch (error) {
      console.log('Market status error:', error?.message);
    }
  };

  const fetchQuotes = async (symbols) => {
    setLoading(true);
    setError('');
    
    try {
      const results = await Promise.allSettled(
        symbols?.map(symbol => googleFinanceService?.getRealTimeQuote(symbol))
      );

      const successfulQuotes = results?.filter(result => result?.status === 'fulfilled' && result?.value?.success)?.map(result => result?.value?.data);

      const failedQuotes = results?.filter(result => result?.status === 'rejected' || !result?.value?.success)?.map((result, index) => ({
          symbol: symbols?.[index],
          error: result?.status === 'rejected' ? result?.reason?.message : result?.value?.error
        }));

      setQuotes(successfulQuotes);
      
      if (failedQuotes?.length > 0) {
        setError(`Échec pour: ${failedQuotes?.map(f => f?.symbol)?.join(', ')}`);
      }

    } catch (error) {
      setError(`Erreur récupération données: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuotes = async (showLoading = true) => {
    const currentSymbols = quotes?.map(q => q?.symbol);
    if (currentSymbols?.length > 0) {
      await fetchQuotes(currentSymbols);
    }
  };

  const addSymbol = async () => {
    if (!newSymbol?.trim()) return;
    
    const symbol = newSymbol?.trim()?.toUpperCase();
    if (quotes?.some(q => q?.symbol === symbol)) {
      setError(`${symbol} déjà suivi`);
      return;
    }

    setLoading(true);
    try {
      const result = await googleFinanceService?.getRealTimeQuote(symbol);
      if (result?.success) {
        setQuotes(prev => [...prev, result?.data]);
        setNewSymbol('');
        setError('');
      } else {
        setError(`Impossible de récupérer ${symbol}: ${result?.error}`);
      }
    } catch (error) {
      setError(`Erreur ajout ${symbol}: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const syncToDatabase = async () => {
    if (quotes?.length === 0) return;
    
    setLoading(true);
    try {
      const symbols = quotes?.map(q => q?.symbol);
      const result = await googleFinanceService?.syncToDatabase(symbols);
      
      setSyncStatus({
        success: result?.success,
        message: result?.message,
        successful: result?.results?.successful,
        failed: result?.results?.failed
      });

      setTimeout(() => setSyncStatus(null), 5000);
    } catch (error) {
      setSyncStatus({
        success: false,
        message: `Erreur synchronisation: ${error?.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSymbol = (symbolToRemove) => {
    setQuotes(prev => prev?.filter(q => q?.symbol !== symbolToRemove));
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price?.toFixed(2) : '---';
  };

  const formatChange = (change, percent) => {
    const changeValue = typeof change === 'number' ? change?.toFixed(2) : '0.00';
    const percentValue = typeof percent === 'number' ? percent?.toFixed(2) : '0.00';
    return { changeValue, percentValue };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Google Finance Integration</h1>
              <p className="text-gray-600 mt-1">Données de marché en temps réel via Google Finance</p>
            </div>
            
            {/* Market Status */}
            {marketStatus && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  marketStatus?.isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  marketStatus?.isOpen ? 'text-green-600' : 'text-red-600'
                }`}>
                  Marché {marketStatus?.isOpen ? 'Ouvert' : 'Fermé'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e?.target?.value)}
                  placeholder="Ajouter un symbole (ex: AAPL)"
                  className="flex-1"
                  onKeyPress={(e) => e?.key === 'Enter' && addSymbol()}
                />
                <Button 
                  onClick={addSymbol}
                  disabled={loading || !newSymbol?.trim()}
                >
                  Ajouter
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refreshQuotes(true)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              <Button
                onClick={syncToDatabase}
                disabled={loading || quotes?.length === 0}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Sync DB
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {syncStatus && (
            <div className={`mt-4 p-3 border rounded-md ${
              syncStatus?.success 
                ? 'bg-green-50 border-green-200' :'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${
                syncStatus?.success ? 'text-green-600' : 'text-red-600'
              }`}>
                {syncStatus?.message}
              </p>
              {syncStatus?.successful && syncStatus?.successful?.length > 0 && (
                <p className="text-xs text-green-500 mt-1">
                  Réussis: {syncStatus?.successful?.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes?.map((quote) => {
            const { changeValue, percentValue } = formatChange(
              quote?.regularMarketChange, 
              quote?.regularMarketChangePercent
            );
            const isPositive = parseFloat(changeValue) >= 0;

            return (
              <div key={quote?.symbol} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{quote?.symbol}</h3>
                    <p className="text-sm text-gray-500">{quote?.exchange}</p>
                  </div>
                  <button
                    onClick={() => removeSymbol(quote?.symbol)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
                {/* Price */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${formatPrice(quote?.regularMarketPrice)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                    <span>{changeValue} ({percentValue}%)</span>
                  </div>
                </div>
                {/* Market Data */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Ouvert:</span>
                    <div className="font-medium">${formatPrice(quote?.open)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Précédent:</span>
                    <div className="font-medium">${formatPrice(quote?.previousClose)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Haut:</span>
                    <div className="font-medium">${formatPrice(quote?.high)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Bas:</span>
                    <div className="font-medium">${formatPrice(quote?.low)}</div>
                  </div>
                </div>
                {/* Volume */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Volume:</span>
                    <span className="font-medium">
                      {quote?.volume ? quote?.volume?.toLocaleString() : '---'}
                    </span>
                  </div>
                </div>
                {/* Status */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    quote?.marketState === 'REGULAR' ?'bg-green-100 text-green-800' :'bg-gray-100 text-gray-800'
                  }`}>
                    {quote?.marketState}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {quotes?.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun symbole suivi</h3>
            <p className="text-gray-500 mb-4">Ajoutez des symboles pour voir les données en temps réel</p>
            <Button onClick={() => fetchQuotes(defaultSymbols)} disabled={loading}>
              Charger les symboles par défaut
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && quotes?.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données de marché...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleFinanceIntegration;