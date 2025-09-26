require('dotenv')?.config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const AGENT_ID = 'quotes-agent-' + Math.random()?.toString(36)?.substring(2, 8);
const AGENT_NAME = 'Market Quotes Agent';
const AGENT_GROUP = 'ingestion';

// Symbols to track
const SYMBOLS = ['STLA', 'TSLA', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'];
const TIMEFRAMES = ['1m', '5m', '15m'];

const logAgent = (message, data = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date()?.toISOString(),
        agent_id: AGENT_ID,
        message,
        ...data
    }));
};

// Generate mock market data
const generateMarketData = (symbol, basePrice = null) => {
    if (!basePrice) {
        basePrice = {
            'STLA': 8.01,
            'TSLA': 248.50,
            'AAPL': 150.25,
            'NVDA': 118.75,
            'MSFT': 420.80,
            'GOOGL': 2850.30,
            'AMZN': 3200.45
        }?.[symbol] || 100.00;
    }

    // Simulate price movement (±2% random walk)
    const change = (Math.random() - 0.5) * 0.04; // ±2%
    const newPrice = basePrice * (1 + change);
    
    return {
        symbol,
        price: parseFloat(newPrice?.toFixed(2)),
        volume: Math.floor(Math.random() * 50000) + 10000,
        bid: parseFloat((newPrice * 0.999)?.toFixed(2)),
        ask: parseFloat((newPrice * 1.001)?.toFixed(2)),
        timestamp: new Date()?.toISOString(),
        source: AGENT_ID,
        exchange: 'NASDAQ'
    };
};

// Track current prices
const currentPrices = {};

// Send market data
const publishMarketData = async () => {
    try {
        for (const symbol of SYMBOLS) {
            const marketData = generateMarketData(symbol, currentPrices?.[symbol]);
            currentPrices[symbol] = marketData?.price;
            
            // Publish to different timeframes
            for (const tf of TIMEFRAMES) {
                const channel = `data.market.${symbol}.${tf}`;
                const data = {
                    ...marketData,
                    timeframe: tf,
                    agent_id: AGENT_ID
                };
                
                await redis?.publish(channel, JSON.stringify(data));
            }
        }
        
        logAgent('Market data published', { 
            symbols_count: SYMBOLS?.length,
            timeframes_count: TIMEFRAMES?.length 
        });
    } catch (error) {
        logAgent('Market data publication error', { error: error?.message });
    }
};

// Heartbeat function
const sendHeartbeat = async () => {
    try {
        const heartbeatData = {
            agent_id: AGENT_ID,
            name: AGENT_NAME,
            group: AGENT_GROUP,
            status: 'healthy',
            uptime: process.uptime(),
            symbols_tracked: SYMBOLS?.length,
            last_prices: Object.keys(currentPrices)?.length,
            timestamp: new Date()?.toISOString()
        };

        await redis?.publish('heartbeat.' + AGENT_ID, JSON.stringify(heartbeatData));
        logAgent('Heartbeat sent', { 
            symbols_tracked: heartbeatData?.symbols_tracked,
            uptime: heartbeatData?.uptime 
        });
    } catch (error) {
        logAgent('Heartbeat error', { error: error?.message });
    }
};

// Initialize agent
const initializeAgent = async () => {
    logAgent('Starting quotes agent', { 
        name: AGENT_NAME,
        group: AGENT_GROUP,
        symbols: SYMBOLS,
        timeframes: TIMEFRAMES
    });

    // Initialize current prices
    SYMBOLS?.forEach(symbol => {
        currentPrices[symbol] = generateMarketData(symbol)?.price;
    });

    // Send initial heartbeat
    await sendHeartbeat();

    // Set up intervals
    const heartbeatInterval = setInterval(sendHeartbeat, 5000); // Every 5 seconds
    const marketDataInterval = setInterval(publishMarketData, 2000); // Every 2 seconds

    // Graceful shutdown
    process.on('SIGINT', async () => {
        logAgent('Shutting down quotes agent...');
        
        clearInterval(heartbeatInterval);
        clearInterval(marketDataInterval);
        
        // Send offline status
        try {
            await redis?.publish('heartbeat.' + AGENT_ID, JSON.stringify({
                agent_id: AGENT_ID,
                name: AGENT_NAME,
                group: AGENT_GROUP,
                status: 'offline',
                timestamp: new Date()?.toISOString()
            }));
        } catch (error) {
            logAgent('Shutdown heartbeat error', { error: error?.message });
        }
        
        await redis?.disconnect();
        logAgent('Quotes agent shutdown complete');
        process.exit(0);
    });

    logAgent('Quotes agent initialized successfully');
};

// Start the agent
initializeAgent()?.catch(error => {
    logAgent('Agent initialization error', { error: error?.message });
    process.exit(1);
});