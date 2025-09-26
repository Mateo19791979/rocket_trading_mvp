require('dotenv')?.config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const AGENT_ID = 'dev-agent-' + Math.random()?.toString(36)?.substring(2, 8);
const AGENT_NAME = 'Development Agent';
const AGENT_GROUP = 'development';

const logAgent = (message, data = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date()?.toISOString(),
        agent_id: AGENT_ID,
        message,
        ...data
    }));
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
            memory: process.memoryUsage(),
            timestamp: new Date()?.toISOString()
        };

        await redis?.publish('heartbeat.' + AGENT_ID, JSON.stringify(heartbeatData));
        logAgent('Heartbeat sent', { uptime: heartbeatData?.uptime });
    } catch (error) {
        logAgent('Heartbeat error', { error: error?.message });
    }
};

// Strategy signal function
const sendStrategySignal = async () => {
    try {
        const symbols = ['STLA', 'TSLA', 'AAPL', 'NVDA', 'MSFT'];
        const strategies = ['momentum', 'mean_reversion', 'breakout', 'arbitrage'];
        
        const signal = {
            agent_id: AGENT_ID,
            symbol: symbols?.[Math.floor(Math.random() * symbols?.length)],
            strategy: strategies?.[Math.floor(Math.random() * strategies?.length)],
            score: (Math.random() * 0.4 + 0.6)?.toFixed(3), // 0.6 to 1.0
            confidence: (Math.random() * 0.3 + 0.7)?.toFixed(3), // 0.7 to 1.0
            timestamp: new Date()?.toISOString(),
            parameters: {
                lookback: Math.floor(Math.random() * 20) + 10,
                threshold: (Math.random() * 0.1 + 0.02)?.toFixed(4)
            }
        };

        await redis?.publish('strategy.candidate', JSON.stringify(signal));
        logAgent('Strategy signal sent', { 
            symbol: signal?.symbol, 
            strategy: signal?.strategy,
            score: signal?.score 
        });
    } catch (error) {
        logAgent('Strategy signal error', { error: error?.message });
    }
};

// Initialize agent
const initializeAgent = async () => {
    logAgent('Starting development agent', { 
        name: AGENT_NAME,
        group: AGENT_GROUP 
    });

    // Send initial heartbeat
    await sendHeartbeat();

    // Set up intervals
    const heartbeatInterval = setInterval(sendHeartbeat, 5000); // Every 5 seconds
    const strategyInterval = setInterval(sendStrategySignal, 10000); // Every 10 seconds

    // Graceful shutdown
    process.on('SIGINT', async () => {
        logAgent('Shutting down agent...');
        
        clearInterval(heartbeatInterval);
        clearInterval(strategyInterval);
        
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
        logAgent('Agent shutdown complete');
        process.exit(0);
    });

    logAgent('Development agent initialized successfully');
};

// Start the agent
initializeAgent()?.catch(error => {
    logAgent('Agent initialization error', { error: error?.message });
    process.exit(1);
});