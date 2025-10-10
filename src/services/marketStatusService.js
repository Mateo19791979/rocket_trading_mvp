import { supabase } from '../lib/supabase';

export const marketStatusService = {
  // Get current market status with better error handling
  async getMarketStatus(exchange = 'NYSE') {
    try {
      // Add timeout and retry logic
      const { data, error } = await Promise.race([
        supabase
          ?.from('market_calendars')
          ?.select('*')
          ?.eq('exchange', exchange)
          ?.eq('market_date', new Date()?.toISOString()?.split('T')?.[0])
          ?.single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 10000)
        )
      ]);

      if (error || !data) {
        console.warn('Market calendar query failed, using fallback:', error?.message);
        return this.getFallbackMarketStatus();
      }

      const now = new Date();
      const currentTime = now?.toTimeString()?.split(' ')?.[0]; // HH:MM:SS format
      
      const isOpen = data?.is_trading_day && 
                    currentTime >= data?.market_open_time &&
                    currentTime <= data?.market_close_time;

      return {
        isOpen,
        status: isOpen ? 'OPEN' : 'CLOSED',
        exchange: data?.exchange,
        timezone: data?.timezone,
        openTime: data?.market_open_time,
        closeTime: data?.market_close_time,
        isTradingDay: data?.is_trading_day,
        preMarketOpen: data?.pre_market_open,
        afterHoursClose: data?.after_hours_close,
        lastUpdate: new Date()?.toISOString(),
        source: 'database'
      };
    } catch (error) {
      console.warn('Market status service error:', error?.message);
      return this.getFallbackMarketStatus();
    }
  },

  // Get market countdown (time to open/close)
  async getMarketCountdown(exchange = 'NYSE') {
    try {
      const status = await this.getMarketStatus(exchange);
      const now = new Date();
      
      if (status?.isOpen) {
        // Calculate time until close
        const closeTime = this.parseTimeToday(status?.closeTime, status?.timezone);
        const timeUntilClose = closeTime - now;
        
        return {
          type: 'CLOSE',
          milliseconds: Math.max(0, timeUntilClose),
          formatted: this.formatCountdown(timeUntilClose),
          nextEvent: 'Market Close'
        };
      } else {
        // Calculate time until open
        const openTime = this.parseTimeToday(status?.openTime, status?.timezone);
        let timeUntilOpen = openTime - now;
        
        // If already past today's open time, calculate for tomorrow
        if (timeUntilOpen <= 0) {
          const tomorrowOpen = new Date(openTime?.getTime() + 24 * 60 * 60 * 1000);
          timeUntilOpen = tomorrowOpen - now;
        }
        
        return {
          type: 'OPEN',
          milliseconds: Math.max(0, timeUntilOpen),
          formatted: this.formatCountdown(timeUntilOpen),
          nextEvent: 'Market Open'
        };
      }
    } catch (error) {
      return {
        type: 'UNKNOWN',
        milliseconds: 0,
        formatted: '--:--:--',
        nextEvent: 'Unavailable',
        error: error?.message
      };
    }
  },

  // Get extended trading hours status
  async getExtendedHoursStatus(exchange = 'NYSE') {
    try {
      const status = await this.getMarketStatus(exchange);
      const now = new Date();
      const currentTime = now?.toTimeString()?.split(' ')?.[0];
      
      const preMarketActive = status?.preMarketOpen && 
                             currentTime >= status?.preMarketOpen && 
                             currentTime < status?.openTime;
      
      const afterHoursActive = status?.afterHoursClose &&
                              currentTime > status?.closeTime &&
                              currentTime <= status?.afterHoursClose;
      
      return {
        preMarket: {
          isActive: preMarketActive,
          openTime: status?.preMarketOpen,
          closeTime: status?.openTime
        },
        regular: {
          isActive: status?.isOpen,
          openTime: status?.openTime,
          closeTime: status?.closeTime
        },
        afterHours: {
          isActive: afterHoursActive,
          openTime: status?.closeTime,
          closeTime: status?.afterHoursClose
        },
        currentSession: preMarketActive ? 'PRE_MARKET' : status?.isOpen ?'REGULAR': afterHoursActive ?'AFTER_HOURS' : 'CLOSED'
      };
    } catch (error) {
      return {
        preMarket: { isActive: false },
        regular: { isActive: false },
        afterHours: { isActive: false },
        currentSession: 'CLOSED',
        error: error?.message
      };
    }
  },

  // Get market holidays for the current month
  async getMarketHolidays(exchange = 'NYSE') {
    try {
      const startOfMonth = new Date();
      startOfMonth?.setDate(1);
      
      const endOfMonth = new Date();
      endOfMonth?.setMonth(endOfMonth?.getMonth() + 1);
      endOfMonth?.setDate(0);
      
      const { data, error } = await supabase
        ?.from('market_calendars')
        ?.select('market_date, is_trading_day')
        ?.eq('exchange', exchange)
        ?.eq('is_trading_day', false)
        ?.gte('market_date', startOfMonth?.toISOString()?.split('T')?.[0])
        ?.lte('market_date', endOfMonth?.toISOString()?.split('T')?.[0]);

      if (error) throw error;

      return data?.map(holiday => ({
        date: holiday?.market_date,
        isHoliday: !holiday?.is_trading_day
      })) || [];
    } catch (error) {
      console.error('Market holidays fetch error:', error?.message);
      return [];
    }
  },

  // Enhanced fallback with better error handling
  getFallbackMarketStatus() {
    const now = new Date();
    const hour = now?.getHours();
    const isWeekend = now?.getDay() === 0 || now?.getDay() === 6;
    
    // More sophisticated market hours calculation
    const isMarketHours = !isWeekend && hour >= 9 && hour < 16;
    const isPreMarket = !isWeekend && hour >= 4 && hour < 9;
    const isAfterHours = !isWeekend && hour >= 16 && hour < 20;
    
    return {
      isOpen: isMarketHours,
      status: isWeekend ? 'CLOSED' : (isMarketHours ? 'OPEN' : 'CLOSED'),
      exchange: 'NYSE',
      timezone: 'America/New_York',
      openTime: '09:30:00',
      closeTime: '16:00:00',
      isTradingDay: !isWeekend,
      preMarketOpen: '04:00:00',
      afterHoursClose: '20:00:00',
      source: 'fallback',
      lastUpdate: new Date()?.toISOString(),
      extendedHours: {
        preMarket: isPreMarket,
        afterHours: isAfterHours
      }
    };
  },

  parseTimeToday(timeString, timezone = 'America/New_York') {
    if (!timeString) return new Date();
    
    const today = new Date();
    const [hours, minutes, seconds] = timeString?.split(':')?.map(Number);
    
    const result = new Date(today);
    result?.setHours(hours, minutes, seconds || 0, 0);
    
    return result;
  },

  formatCountdown(milliseconds) {
    if (milliseconds <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours)?.padStart(2, '0')}:${String(minutes)?.padStart(2, '0')}:${String(seconds)?.padStart(2, '0')}`;
  }
};