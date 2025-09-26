import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationToast = ({ 
  notifications = [], 
  onDismiss = () => {},
  position = 'top-right',
  autoHideDuration = 5000 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev?.filter(notification => notification?.id !== id));
    onDismiss(id);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-6';
      case 'top-center':
        return 'top-20 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-20 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-center':
        return 'bottom-6 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-6 right-6';
      default:
        return 'top-20 right-6';
    }
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success',
          text: 'text-success-foreground',
          icon: 'CheckCircle',
          border: 'border-success/20'
        };
      case 'error':
        return {
          bg: 'bg-error',
          text: 'text-error-foreground',
          icon: 'XCircle',
          border: 'border-error/20'
        };
      case 'warning':
        return {
          bg: 'bg-warning',
          text: 'text-warning-foreground',
          icon: 'AlertTriangle',
          border: 'border-warning/20'
        };
      case 'info':
        return {
          bg: 'bg-primary',
          text: 'text-primary-foreground',
          icon: 'Info',
          border: 'border-primary/20'
        };
      default:
        return {
          bg: 'bg-card',
          text: 'text-card-foreground',
          icon: 'Bell',
          border: 'border-border'
        };
    }
  };

  if (visibleNotifications?.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <div className="space-y-3 w-80 max-w-sm">
        {visibleNotifications?.map((notification) => {
          const styles = getTypeStyles(notification?.type);
          
          return (
            <NotificationItem
              key={notification?.id}
              notification={notification}
              styles={styles}
              onDismiss={handleDismiss}
              autoHideDuration={autoHideDuration}
            />
          );
        })}
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, styles, onDismiss, autoHideDuration }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto dismiss
    if (autoHideDuration > 0) {
      const dismissTimer = setTimeout(() => {
        handleExit();
      }, autoHideDuration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [autoHideDuration]);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification?.id);
    }, 200);
  };

  return (
    <div
      className={`
        ${styles?.bg} ${styles?.text} border ${styles?.border}
        rounded-xl shadow-trading-lg p-4 transition-all duration-200 ease-trading
        ${isVisible && !isExiting 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon name={styles?.icon} size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          {notification?.title && (
            <h4 className="text-sm font-semibold font-heading mb-1">
              {notification?.title}
            </h4>
          )}
          <p className="text-sm font-body leading-relaxed">
            {notification?.message}
          </p>
          
          {notification?.timestamp && (
            <p className="text-xs opacity-75 mt-2 font-data">
              {new Date(notification.timestamp)?.toLocaleTimeString()}
            </p>
          )}
          
          {notification?.action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={notification?.action?.onClick}
                className="text-current hover:bg-white/10 p-1 h-auto"
              >
                {notification?.action?.label}
              </Button>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="flex-shrink-0 text-current hover:bg-white/10 w-6 h-6"
        >
          <Icon name="X" size={14} />
        </Button>
      </div>
    </div>
  );
};

export default NotificationToast;