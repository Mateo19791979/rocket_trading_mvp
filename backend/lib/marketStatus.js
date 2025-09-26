// Simple market status calculation
export class MarketStatus {
  static getMarketStatus(exchange = 'NYSE') {
    const now = new Date();
    const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    
    let marketOpen, marketClose, timezone;
    
    switch (exchange?.toUpperCase()) {
      case 'NYSE': case'NASDAQ':
        // NYSE: 9:30 AM - 4:00 PM EST
        marketOpen = '14:30'; // UTC (9:30 AM EST)
        marketClose = '21:00'; // UTC (4:00 PM EST)
        timezone = 'America/New_York';
        break;
      case 'SIX':
        // Swiss Exchange: 9:00 AM - 5:30 PM CET
        marketOpen = '08:00'; // UTC (9:00 AM CET)
        marketClose = '16:30'; // UTC (5:30 PM CET)
        timezone = 'Europe/Zurich';
        break;
      default:
        marketOpen = '14:30';
        marketClose = '21:00';
        timezone = 'America/New_York';
    }
    
    const currentTime = utcNow?.toTimeString()?.slice(0, 5);
    const currentDay = utcNow?.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if it's weekend
    const isWeekend = currentDay === 0 || currentDay === 6;
    
    // Check if market is open
    const isOpen = !isWeekend && 
                   currentTime >= marketOpen && 
                   currentTime <= marketClose;
    
    return {
      market: exchange?.toUpperCase(),
      status: isOpen ? 'OPEN' : 'CLOSED',
      open: marketOpen,
      close: marketClose,
      timezone,
      currentTime: utcNow?.toISOString(),
      isWeekend
    };
  }
}