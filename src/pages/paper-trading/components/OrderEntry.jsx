import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import paperTradingSecurityService from '../../../services/paperTradingSecurityService';

export default function OrderEntry({ onOrderComplete }) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [brokerMode, setBrokerMode] = useState('paper');
  const [errors, setErrors] = useState({});
  const [currentPrice, setCurrentPrice] = useState(null);

  // Check broker mode on component mount
  useEffect(() => {
    checkBrokerMode();
  }, []);

  const checkBrokerMode = async () => {
    try {
      const mode = await paperTradingSecurityService?.getBrokerFlag();
      setBrokerMode(mode);
    } catch (error) {
      console.error('Error checking broker mode:', error);
      setBrokerMode('paper'); // Default to paper for safety
    }
  };

  const handleInputChange = (field, value) => {
    switch(field) {
      case 'symbol':
        setSelectedAsset(value);
        break;
      case 'side':
        setSide(value);
        break;
      case 'type':
        setOrderType(value);
        break;
      case 'quantity':
        setQuantity(value);
        break;
      case 'price':
        setPrice(value);
        break;
      default:
        break;
    }
    
    // Clear error for this field
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const getTotalValue = () => {
    const qty = parseFloat(quantity) || 0;
    const prc = orderType === 'market' ? (currentPrice || 0) : (parseFloat(price) || 0);
    return qty * prc;
  };

  const symbolOptions = assets?.map(asset => ({
    value: asset?.id,
    label: asset?.symbol
  }));

  const disabled = isLoading;
  const loading = isLoading;

  const orderData = {
    symbol: assets?.find(a => a?.id === selectedAsset)?.symbol || '',
    side: side,
    type: orderType,
    quantity: parseInt(quantity) || 0,
    price: parseFloat(price) || 0
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    try {
      setIsLoading(true);

      // Check if paper mode is enabled
      const isPaperMode = await paperTradingSecurityService?.isPaperModeEnabled();
      
      const orderData = {
        asset_id: selectedAsset,
        quantity: parseFloat(quantity),
        order_type: orderType,
        order_side: side,
        price: orderType === 'limit' ? parseFloat(price) : null,
        time_in_force: 'GTC',
        symbol: assets?.find(a => a?.id === selectedAsset)?.symbol
      };

      if (!isPaperMode && orderType === 'market') {
        // Block live trading attempt
        const blockResult = await paperTradingSecurityService?.blockLiveTrade(
          orderData,
          'Tentative d\'ordre en direct bloquée - Mode papier activé'
        );
        
        setMessage(`🚫 ORDRE BLOQUÉ: ${blockResult?.reason}`);
        setMessageType('error');
        return;
      }

      // Execute paper trade
      const result = await paperTradingSecurityService?.executePaperTrade(orderData);

      if (result?.success) {
        setMessage('✅ Ordre papier exécuté avec succès (virtuel)');
        setMessageType('success');
        
        // Reset form
        setQuantity('');
        setPrice('');
        setSelectedAsset('');
        
        // Refresh data if callback exists
        if (onOrderComplete) {
          onOrderComplete();
        }
      }

    } catch (error) {
      console.error('Error submitting order:', error);
      setMessage('Erreur lors de la soumission de l\'ordre: ' + error?.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
        Place Order
      </h3>
      {/* Broker Mode Indicator */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          brokerMode === 'paper' ? 'bg-blue-100 text-blue-800' 
            : brokerMode === 'live' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          Mode: {brokerMode?.toUpperCase()}
          {brokerMode !== 'live' && ' (Aucun ordre réel)'}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Symbol Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Symbol
          </label>
          <Select
            value={orderData?.symbol}
            onValueChange={(value) => handleInputChange('symbol', value)}
            disabled={disabled}
          >
            {symbolOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </Select>
          {errors?.symbol && (
            <p className="text-sm text-destructive mt-1">{errors?.symbol}</p>
          )}
        </div>

        {/* Order Side */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Side
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('side', 'buy')}
              disabled={disabled}
              className={`p-3 rounded-lg border transition-colors flex items-center justify-center ${
                orderData?.side === 'buy' ? 'bg-success/10 border-success text-success' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Buy
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('side', 'sell')}
              disabled={disabled}
              className={`p-3 rounded-lg border transition-colors flex items-center justify-center ${
                orderData?.side === 'sell' ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              Sell
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'market')}
              disabled={disabled}
              className={`p-2 rounded-lg border transition-colors text-sm ${
                orderData?.type === 'market' ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('type', 'limit')}
              disabled={disabled}
              className={`p-2 rounded-lg border transition-colors text-sm ${
                orderData?.type === 'limit' ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Quantity
          </label>
          <Input
            type="number"
            value={orderData?.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e?.target?.value) || 0)}
            min="1"
            max="10000"
            step="1"
            disabled={disabled}
            className={errors?.quantity ? 'border-destructive' : ''}
          />
          {errors?.quantity && (
            <p className="text-sm text-destructive mt-1">{errors?.quantity}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Price (CHF)
          </label>
          <Input
            type="number"
            value={orderData?.price}
            onChange={(e) => handleInputChange('price', parseFloat(e?.target?.value) || 0)}
            min="0.01"
            max="100000"
            step="0.01"
            disabled={disabled || orderData?.type === 'market'}
            className={errors?.price ? 'border-destructive' : ''}
          />
          {orderData?.type === 'market' && (
            <p className="text-xs text-muted-foreground mt-1">
              Market orders use current market price
            </p>
          )}
          {errors?.price && (
            <p className="text-sm text-destructive mt-1">{errors?.price}</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="font-medium text-foreground">
              {getTotalValue()?.toFixed(2)} CHF
            </span>
          </div>
          {currentPrice && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price:</span>
              <span className="font-medium text-foreground">
                {currentPrice?.toFixed(2)} CHF
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full ${
            orderData?.side === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'
          }`}
          disabled={disabled || loading || Object.keys(errors)?.length > 0}
        >
          {loading ? 'Placing Order...' : `${orderData?.side === 'buy' ? 'Buy' : 'Sell'} ${orderData?.symbol}`}
        </Button>
      </form>
    </div>
  );
}