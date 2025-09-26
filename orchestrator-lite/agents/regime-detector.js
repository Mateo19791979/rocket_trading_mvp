require('dotenv')?.config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const AGENT_ID = 'regime-detector-' + Math.random()?.toString(36)?.substring(2, 8);
const AGENT_NAME = 'Regime Detector Agent';
const AGENT_GROUP = 'signals';

// Market data storage for analysis
const marketData = {};
const ANALYSIS_WINDOW = 20; // Number of data points for analysis

const logAgent = (message, data = {}) => {
    console.log(JSON.stringify({
        timestamp: new Date()?.toISOString(),
        agent_id: AGENT_ID,
        message,
        ...data
    }));
};

// Calculate volatility and trend
const analyzeMarketRegime = (prices) => {
    if (prices?.length < 2) return null;

    // Calculate returns
    const returns = [];
    for (let i = 1; i < prices?.length; i++) {
        returns?.push((prices?.[i] - prices?.[i-1]) / prices?.[i-1]);
    }

    // Calculate volatility (standard deviation of returns)
    const mean = returns?.reduce((sum, r) => sum + r, 0) / returns?.length;
    const variance = returns?.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns?.length;
    const volatility = Math.sqrt(variance);

    // Calculate trend (simple linear regression slope)
    const n = prices?.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = prices;
    
    const sumX = x?.reduce((a, b) => a + b, 0);
    const sumY = y?.reduce((a, b) => a + b, 0);
    const sumXY = x?.reduce((sum, xi, i) => sum + xi * y?.[i], 0);
    const sumXX = x?.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determine regime
    let regime = 'neutral';
    if (volatility > 0.03) {
        regime = volatility > 0.06 ? 'high_volatility' : 'volatile';
    } else if (volatility < 0.01) {
        regime = 'low_volatility';
    }
    
    // Add trend information
    let trend = 'sideways';
    if (Math.abs(slope) > 0.5) {
        trend = slope > 0 ? 'bullish' : 'bearish';
    }

    return {
        regime,
        trend,
        volatility: parseFloat(volatility?.toFixed(6)),
        trend_strength: parseFloat(Math.abs(slope)?.toFixed(6)),
        mean_return: parseFloat(mean?.toFixed(6)),
        data_points: prices?.length
    };
};

// Handle incoming market data
const handleMarketData = (channel, message) => {
    try {
        const data = JSON.parse(message);
        const symbol = data?.symbol;
        
        if (!symbol || !data?.price) return;
        
        // Initialize symbol data if not exists
        if (!marketData?.[symbol]) {
            marketData[symbol] = [];
        }
        
        // Add new price data
        marketData?.[symbol]?.push({
            price: data?.price,
            timestamp: data?.timestamp || new Date()?.toISOString()
        });
        
        // Keep only recent data points
        if (marketData?.[symbol]?.length > ANALYSIS_WINDOW) {
            marketData[symbol] = marketData?.[symbol]?.slice(-ANALYSIS_WINDOW);
        }
        
        logAgent('Market data received', { 
            symbol, 
            price: data?.price,
            data_points: marketData?.[symbol]?.length 
        });
        
    } catch (error) {
        logAgent('Market data handling error', { error: error?.message });
    }
};

// Analyze and publish regime state
const publishRegimeState = async () => {
    try {
        // Analyze major symbols
        const majorSymbols = ['STLA', 'TSLA', 'AAPL'];
        const regimeAnalysis = {};
        let totalVolatility = 0;
        let validAnalyses = 0;
        
        for (const symbol of majorSymbols) {
            if (marketData?.[symbol] && marketData?.[symbol]?.length >= 5) {
                const prices = marketData?.[symbol]?.map(d => d?.price);
                const analysis = analyzeMarketRegime(prices);
                
                if (analysis) {
                    regimeAnalysis[symbol] = analysis;
                    totalVolatility += analysis?.volatility;
                    validAnalyses++;
                }
            }
        }
        
        if (validAnalyses === 0) {
            logAgent('Insufficient data for regime analysis');
            return;
        }
        
        // Calculate overall market regime
        const avgVolatility = totalVolatility / validAnalyses;
        let overallRegime = 'neutral';
        
        if (avgVolatility > 0.04) {
            overallRegime = 'volatile';
        } else if (avgVolatility < 0.015) {
            overallRegime = 'stable';
        }
        
        // Count trends
        const trends = Object.values(regimeAnalysis)?.map(a => a?.trend);
        const bullishCount = trends?.filter(t => t === 'bullish')?.length;
        const bearishCount = trends?.filter(t => t === 'bearish')?.length;
        
        let overallTrend = 'sideways';
        if (bullishCount > bearishCount && bullishCount > validAnalyses / 2) {
            overallTrend = 'bullish';
        } else if (bearishCount > bullishCount && bearishCount > validAnalyses / 2) {
            overallTrend = 'bearish';
        }
        
        const regimeState = {
            agent_id: AGENT_ID,
            regime: overallRegime,
            trend: overallTrend,
            volatility: parseFloat(avgVolatility?.toFixed(6)),
            symbols_analyzed: validAnalyses,
            symbol_details: regimeAnalysis,
            confidence: Math.min(validAnalyses / majorSymbols?.length, 1.0),
            timestamp: new Date()?.toISOString()
        };
        
        await redis?.publish('quant.regime.state', JSON.stringify(regimeState));
        
        logAgent('Regime state published', {
            regime: overallRegime,
            trend: overallTrend,
            volatility: avgVolatility,
            symbols_analyzed: validAnalyses
        });
        
    } catch (error) {
        logAgent('Regime analysis error', { error: error?.message });
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
            symbols_tracking: Object.keys(marketData)?.length,
            total_data_points: Object.values(marketData)?.reduce((sum, data) => sum + data?.length, 0),
            timestamp: new Date()?.toISOString()
        };

        await redis?.publish('heartbeat.' + AGENT_ID, JSON.stringify(heartbeatData));
        logAgent('Heartbeat sent', { 
            symbols_tracking: heartbeatData?.symbols_tracking,
            data_points: heartbeatData?.total_data_points
        });
    } catch (error) {
        logAgent('Heartbeat error', { error: error?.message });
    }
};

// Initialize agent
const initializeAgent = async () => {
    logAgent('Starting regime detector agent', { 
        name: AGENT_NAME,
        group: AGENT_GROUP,
        analysis_window: ANALYSIS_WINDOW
    });

    // Subscribe to market data
    await subscriber?.psubscribe('data.market.*');
    subscriber?.on('pmessage', (pattern, channel, message) => {
        handleMarketData(channel, message);
    });

    // Send initial heartbeat
    await sendHeartbeat();

    // Set up intervals
    const heartbeatInterval = setInterval(sendHeartbeat, 5000); // Every 5 seconds
    const regimeAnalysisInterval = setInterval(publishRegimeState, 15000); // Every 15 seconds

    // Graceful shutdown
    process.on('SIGINT', async () => {
        logAgent('Shutting down regime detector...');
        
        clearInterval(heartbeatInterval);
        clearInterval(regimeAnalysisInterval);
        
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
        
        await subscriber?.disconnect();
        await redis?.disconnect();
        logAgent('Regime detector shutdown complete');
        process.exit(0);
    });

    logAgent('Regime detector initialized successfully');
};

// Start the agent
initializeAgent()?.catch(error => {
    logAgent('Agent initialization error', { error: error?.message });
    process.exit(1);
});