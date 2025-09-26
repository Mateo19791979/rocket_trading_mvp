import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const OrderModal = ({ symbol, orderType, onClose, onSubmit }) => {
  const [orderData, setOrderData] = useState({
    type: 'market',
    quantity: '',
    price: orderType === 'buy' ? symbol?.price || 0 : symbol?.price || 0,
    stopLoss: '',
    takeProfit: '',
    timeInForce: 'day'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!symbol) return null;

  const orderTypeOptions = [
    { value: 'market', label: 'Ordre au marché' },
    { value: 'limit', label: 'Ordre à cours limité' },
    { value: 'stop', label: 'Ordre stop' },
    { value: 'stop-limit', label: 'Ordre stop-limit' }
  ];

  const timeInForceOptions = [
    { value: 'day', label: 'Jour (DAY)' },
    { value: 'gtc', label: 'Jusqu\'à annulation (GTC)' },
    { value: 'ioc', label: 'Immédiat ou annulé (IOC)' },
    { value: 'fok', label: 'Tout ou rien (FOK)' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    })?.format(price);
  };

  const calculateTotal = () => {
    const quantity = parseFloat(orderData?.quantity) || 0;
    const price = parseFloat(orderData?.price) || 0;
    return quantity * price;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!orderData?.quantity || parseFloat(orderData?.quantity) <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0';
    }

    if (orderData?.type !== 'market' && (!orderData?.price || parseFloat(orderData?.price) <= 0)) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }

    if (orderData?.stopLoss && parseFloat(orderData?.stopLoss) <= 0) {
      newErrors.stopLoss = 'Le stop loss doit être supérieur à 0';
    }

    if (orderData?.takeProfit && parseFloat(orderData?.takeProfit) <= 0) {
      newErrors.takeProfit = 'Le take profit doit être supérieur à 0';
    }

    // Validation logique pour buy/sell
    if (orderType === 'buy' && orderData?.stopLoss && parseFloat(orderData?.stopLoss) >= parseFloat(orderData?.price)) {
      newErrors.stopLoss = 'Le stop loss doit être inférieur au prix d\'achat';
    }

    if (orderType === 'sell' && orderData?.stopLoss && parseFloat(orderData?.stopLoss) <= parseFloat(orderData?.price)) {
      newErrors.stopLoss = 'Le stop loss doit être supérieur au prix de vente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderPayload = {
        symbol: symbol?.symbol,
        side: orderType,
        ...orderData,
        quantity: parseFloat(orderData?.quantity),
        price: orderData?.type === 'market' ? symbol?.price : parseFloat(orderData?.price),
        total: calculateTotal(),
        timestamp: new Date()?.toISOString()
      };

      onSubmit(orderPayload);
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-trading-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              orderType === 'buy' ? 'bg-success/20' : 'bg-error/20'
            }`}>
              <Icon
                name={orderType === 'buy' ? 'TrendingUp' : 'TrendingDown'}
                size={20}
                className={orderType === 'buy' ? 'text-success' : 'text-error'}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground font-heading">
                {orderType === 'buy' ? 'Ordre d\'achat' : 'Ordre de vente'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {symbol?.symbol} - {formatPrice(symbol?.price)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Type */}
          <Select
            label="Type d'ordre"
            options={orderTypeOptions}
            value={orderData?.type}
            onChange={(value) => handleInputChange('type', value)}
            required
          />

          {/* Quantity */}
          <Input
            label="Quantité"
            type="number"
            placeholder="0"
            value={orderData?.quantity}
            onChange={(e) => handleInputChange('quantity', e?.target?.value)}
            error={errors?.quantity}
            required
            min="0"
            step="0.01"
          />

          {/* Price (for limit orders) */}
          {orderData?.type !== 'market' && (
            <Input
              label="Prix"
              type="number"
              placeholder="0.00"
              value={orderData?.price}
              onChange={(e) => handleInputChange('price', e?.target?.value)}
              error={errors?.price}
              required
              min="0"
              step="0.01"
            />
          )}

          {/* Advanced Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Options avancées</h4>
            
            <Input
              label="Stop Loss (optionnel)"
              type="number"
              placeholder="0.00"
              value={orderData?.stopLoss}
              onChange={(e) => handleInputChange('stopLoss', e?.target?.value)}
              error={errors?.stopLoss}
              min="0"
              step="0.01"
              description="Prix de stop loss automatique"
            />

            <Input
              label="Take Profit (optionnel)"
              type="number"
              placeholder="0.00"
              value={orderData?.takeProfit}
              onChange={(e) => handleInputChange('takeProfit', e?.target?.value)}
              error={errors?.takeProfit}
              min="0"
              step="0.01"
              description="Prix de prise de bénéfice automatique"
            />

            <Select
              label="Durée de validité"
              options={timeInForceOptions}
              value={orderData?.timeInForce}
              onChange={(value) => handleInputChange('timeInForce', value)}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-muted/20 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Résumé de l'ordre</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Symbole:</span>
                <span className="font-data text-foreground">{symbol?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">
                  {orderTypeOptions?.find(opt => opt?.value === orderData?.type)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantité:</span>
                <span className="font-data text-foreground">
                  {orderData?.quantity || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix:</span>
                <span className="font-data text-foreground">
                  {orderData?.type === 'market' 
                    ? `${formatPrice(symbol?.price)} (marché)`
                    : formatPrice(parseFloat(orderData?.price) || 0)
                  }
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total estimé:</span>
                <span className="font-data text-foreground">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant={orderType === 'buy' ? 'success' : 'danger'}
              loading={isSubmitting}
              fullWidth
            >
              {isSubmitting 
                ? 'Traitement...' 
                : `${orderType === 'buy' ? 'Acheter' : 'Vendre'} ${symbol?.symbol}`
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;