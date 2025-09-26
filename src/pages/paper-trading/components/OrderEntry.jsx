import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const OrderEntry = ({ 
  onPlaceOrder, 
  selectedSymbol, 
  currentPrice, 
  availableSymbols = [],
  onSymbolChange,
  disabled = false 
}) => {
  const [orderData, setOrderData] = useState({
    symbol: selectedSymbol || 'AAPL',
    side: 'buy',
    quantity: 1,
    price: currentPrice || 0,
    type: 'market'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Update symbol when prop changes
  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== orderData?.symbol) {
      setOrderData(prev => ({ ...prev, symbol: selectedSymbol }));
    }
  }, [selectedSymbol]);

  // Update price when current price changes
  useEffect(() => {
    if (currentPrice && orderData?.type === 'market') {
      setOrderData(prev => ({ ...prev, price: currentPrice }));
    }
  }, [currentPrice, orderData?.type]);

  const validateOrder = () => {
    const newErrors = {};
    
    if (!orderData?.symbol) {
      newErrors.symbol = 'Symbol is required';
    }
    
    if (!orderData?.quantity || orderData?.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!orderData?.price || orderData?.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (orderData?.quantity > 10000) {
      newErrors.quantity = 'Maximum quantity is 10,000';
    }
    
    if (orderData?.price > 100000) {
      newErrors.price = 'Maximum price is 100,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateOrder() || disabled) return;
    
    setLoading(true);
    try {
      await onPlaceOrder?.(orderData);
      
      // Reset form after successful order
      setOrderData(prev => ({
        ...prev,
        quantity: 1,
        price: currentPrice || prev?.price
      }));
      
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Update parent component if symbol changes
    if (field === 'symbol' && onSymbolChange) {
      onSymbolChange?.(value);
    }
  };

  const getTotalValue = () => {
    return (orderData?.quantity || 0) * (orderData?.price || 0);
  };

  const symbolOptions = availableSymbols?.map(symbol => ({
    value: symbol,
    label: symbol
  })) || [
    { value: 'AAPL', label: 'AAPL' },
    { value: 'GOOGL', label: 'GOOGL' },
    { value: 'MSFT', label: 'MSFT' },
    { value: 'TSLA', label: 'TSLA' }
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
        Place Order
      </h3>
      {disabled && (
        <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Please sign in to place orders
          </p>
        </div>
      )}
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
                orderData?.side === 'buy' ?'bg-success/10 border-success text-success' :'bg-card border-border text-muted-foreground hover:text-foreground'
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
                orderData?.side === 'sell' ?'bg-destructive/10 border-destructive text-destructive' :'bg-card border-border text-muted-foreground hover:text-foreground'
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
                orderData?.type === 'market' ?'bg-primary/10 border-primary text-primary' :'bg-card border-border text-muted-foreground hover:text-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('type', 'limit')}
              disabled={disabled}
              className={`p-2 rounded-lg border transition-colors text-sm ${
                orderData?.type === 'limit' ?'bg-primary/10 border-primary text-primary' :'bg-card border-border text-muted-foreground hover:text-foreground'
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
            orderData?.side === 'buy' ?'bg-success hover:bg-success/90' :'bg-destructive hover:bg-destructive/90'
          }`}
          disabled={disabled || loading || Object.keys(errors)?.length > 0}
        >
          {loading ? 'Placing Order...' : `${orderData?.side === 'buy' ? 'Buy' : 'Sell'} ${orderData?.symbol}`}
        </Button>
      </form>
    </div>
  );
};

export default OrderEntry;