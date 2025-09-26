require('dotenv')?.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const Redis = require('ioredis');
const { Pool } = require('pg');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http?.createServer(app);

// Configuration
const PORT = process.env?.PORT || 8090;
const FRONT_ORIGIN = process.env?.FRONT_ORIGIN || 'https://trading.mvp.com';
const REDIS_URL = process.env?.REDIS_URL || 'redis://localhost:6379';
const PG_URL = process.env?.PG_URL || 'postgres://user:pass@localhost:5432/orch';

// Redis Client
const redis = new Redis(REDIS_URL, {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});

// Redis Subscriber (separate connection for pub/sub)
const subscriber = new Redis(REDIS_URL, {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});

// PostgreSQL Pool
const pgPool = new Pool({
    connectionString: PG_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// WebSocket Server
const wss = new WebSocket.Server({ server });

// Middleware
app?.use(helmet());
app?.use(cors({
    origin: FRONT_ORIGIN,
    credentials: true
}));

const limiter = rateLimit({
    windowMs: parseInt(process.env?.RATE_LIMIT_WINDOW) || 60000, // 1 minute
    max: parseInt(process.env?.RATE_LIMIT_MAX) || 60,
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app?.use(limiter);

app?.use(morgan('combined'));
app?.use(express?.json({ limit: '10mb' }));

// Event cache for performance
const eventCache = new Map();
const CACHE_DURATION = 10000; // 10 seconds

// WebSocket connections tracking
const wsClients = new Set();

// Utility Functions
const logToConsole = (level, message, data = {}) => {
    const logEntry = {
        timestamp: new Date()?.toISOString(),
        level,
        message,
        ...data
    };
    console.log(JSON.stringify(logEntry));
};

const broadcastToWebSocket = (message) => {
    const data = JSON.stringify(message);
    wsClients?.forEach(ws => {
        if (ws?.readyState === WebSocket?.OPEN) {
            try {
                ws?.send(data);
            } catch (error) {
                logToConsole('error', 'WebSocket send error', { error: error?.message });
            }
        }
    });
};

// Database Functions
const queryDatabase = async (query, params = []) => {
    try {
        const result = await pgPool?.query(query, params);
        return { success: true, data: result?.rows };
    } catch (error) {
        logToConsole('error', 'Database query error', { 
            query: query?.substring(0, 100),
            error: error?.message 
        });
        return { success: false, error: error?.message };
    }
};

const upsertAgent = async (id, name, group, status, lastError = null) => {
    let query = `
        INSERT INTO agents (id, name, agent_group, status, last_beat, last_error) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
        ON CONFLICT (id) 
        DO UPDATE SET 
            name = EXCLUDED.name,
            agent_group = EXCLUDED.agent_group,
            status = EXCLUDED.status,
            last_beat = CURRENT_TIMESTAMP,
            last_error = EXCLUDED.last_error,
            updated_at = CURRENT_TIMESTAMP
    `;
    return await queryDatabase(query, [id, name, group, status, lastError]);
};

const insertEvent = async (type, payload, source = null) => {
    let query = `
        INSERT INTO events (type, payload, source, ts) 
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
        RETURNING id
    `;
    return await queryDatabase(query, [type, JSON.stringify(payload), source]);
};

// Redis Event Handlers
const handleRedisEvent = async (pattern, channel, message) => {
    try {
        const eventData = JSON.parse(message);
        const eventType = channel?.replace(/^.*\./, ''); // Get last part of channel name
        
        logToConsole('info', 'Redis event received', { 
            channel, 
            type: eventType,
            dataKeys: Object.keys(eventData)
        });

        // Persist to database
        await insertEvent(eventType, eventData, eventData?.source || eventData?.agent_id);

        // Handle heartbeat events specifically
        if (eventType === 'heartbeat' && eventData?.agent_id) {
            await upsertAgent(
                eventData?.agent_id,
                eventData?.name || eventData?.agent_id,
                eventData?.group || 'unknown',
                'active'
            );
        }

        // Broadcast to WebSocket clients
        broadcastToWebSocket({
            type: 'redis_event',
            channel,
            eventType,
            data: eventData,
            timestamp: new Date()?.toISOString()
        });

    } catch (error) {
        logToConsole('error', 'Redis event handling error', { 
            channel, 
            error: error?.message 
        });
    }
};

// Subscribe to Redis patterns
const redisPatterns = [
    'data.market.*',
    'news.signal.entity',
    'quant.regime.state',
    'strategy.*',
    'risk.*',
    'heartbeat.*'
];

redisPatterns?.forEach(pattern => {
    subscriber?.psubscribe(pattern);
});

subscriber?.on('pmessage', handleRedisEvent);

// API Routes

// GET /health/agents - Agent registry status
app?.get('/health/agents', async (req, res) => {
    try {
        const result = await queryDatabase(`
            SELECT id, name, agent_group, status, last_beat, last_error,
                   EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_beat)) as seconds_since_beat
            FROM agents 
            ORDER BY last_beat DESC
        `);
        
        if (!result?.success) {
            return res?.status(500)?.json({ error: 'Database error', details: result?.error });
        }

        const agents = result?.data?.map(agent => ({
            ...agent,
            is_alive: agent?.seconds_since_beat < 300, // 5 minutes threshold
            last_beat: agent?.last_beat
        }));

        res?.json({
            status: 'ok',
            timestamp: new Date()?.toISOString(),
            agents,
            total_agents: agents?.length,
            active_agents: agents?.filter(a => a?.is_alive)?.length
        });

    } catch (error) {
        logToConsole('error', 'Health agents endpoint error', { error: error?.message });
        res?.status(500)?.json({ error: 'Internal server error' });
    }
});

// GET /bus/events?since=cursor - Event bus pagination
app?.get('/bus/events', async (req, res) => {
    try {
        const since = parseInt(req?.query?.since) || 0;
        const limit = Math.min(parseInt(req?.query?.limit) || 50, 200);
        const type = req?.query?.type;

        // Check cache first
        const cacheKey = `events:${since}:${limit}:${type || 'all'}`;
        if (eventCache?.has(cacheKey)) {
            const cached = eventCache?.get(cacheKey);
            if (Date.now() - cached?.timestamp < CACHE_DURATION) {
                return res?.json(cached?.data);
            }
        }

        let query = `
            SELECT id, type, payload, ts, source, processed
            FROM events 
            WHERE id > $1
        `;
        const params = [since];

        if (type) {
            query += ` AND type = $${params?.length + 1}`;
            params?.push(type);
        }

        query += ` ORDER BY ts DESC, id DESC LIMIT $${params?.length + 1}`;
        params?.push(limit);

        const result = await queryDatabase(query, params);
        
        if (!result?.success) {
            return res?.status(500)?.json({ error: 'Database error', details: result?.error });
        }

        const response = {
            status: 'ok',
            timestamp: new Date()?.toISOString(),
            events: result?.data?.map(event => ({
                ...event,
                payload: typeof event?.payload === 'string' ? JSON.parse(event?.payload) : event?.payload
            })),
            cursor: result?.data?.length > 0 ? result?.data?.[result?.data?.length - 1]?.id : since,
            has_more: result?.data?.length === limit
        };

        // Cache the response
        eventCache?.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });

        res?.json(response);

    } catch (error) {
        logToConsole('error', 'Bus events endpoint error', { error: error?.message });
        res?.status(500)?.json({ error: 'Internal server error' });
    }
});

// POST /risk/killswitch - Emergency killswitch
app?.post('/risk/killswitch', async (req, res) => {
    try {
        const { reason } = req?.body;
        
        if (!reason || typeof reason !== 'string') {
            return res?.status(400)?.json({ error: 'Reason is required and must be a string' });
        }

        const killswitchPayload = {
            enabled: true,
            reason,
            timestamp: new Date()?.toISOString(),
            triggered_by: 'orchestrator'
        };

        // Store in database
        await insertEvent('risk.killswitch', killswitchPayload, 'orchestrator');

        // Publish to Redis
        await redis?.publish('risk.killswitch', JSON.stringify(killswitchPayload));

        // Update orchestrator state
        await queryDatabase(`
            INSERT INTO orchestrator_state (key, value)
            VALUES ('killswitch_status', $1)
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
        `, [JSON.stringify({ enabled: true, last_triggered: new Date()?.toISOString(), reason })]);

        // Broadcast to WebSocket
        broadcastToWebSocket({
            type: 'killswitch_activated',
            data: killswitchPayload,
            timestamp: new Date()?.toISOString()
        });

        logToConsole('warn', 'Killswitch activated', { reason });

        res?.json({
            status: 'activated',
            timestamp: new Date()?.toISOString(),
            reason,
            message: 'Killswitch has been activated successfully'
        });

    } catch (error) {
        logToConsole('error', 'Killswitch endpoint error', { error: error?.message });
        res?.status(500)?.json({ error: 'Failed to activate killswitch' });
    }
});

// GET /regime/state - Latest regime state
app?.get('/regime/state', async (req, res) => {
    try {
        const result = await queryDatabase(`
            SELECT payload, ts, source
            FROM events 
            WHERE type = 'quant.regime.state'
            ORDER BY ts DESC 
            LIMIT 1
        `);

        if (!result?.success) {
            return res?.status(500)?.json({ error: 'Database error', details: result?.error });
        }

        if (result?.data?.length === 0) {
            return res?.json({
                status: 'no_data',
                message: 'No regime state data available',
                timestamp: new Date()?.toISOString()
            });
        }

        const latestRegime = result?.data?.[0];
        
        res?.json({
            status: 'ok',
            timestamp: new Date()?.toISOString(),
            regime: {
                ...JSON.parse(latestRegime?.payload),
                last_update: latestRegime?.ts,
                source: latestRegime?.source
            }
        });

    } catch (error) {
        logToConsole('error', 'Regime state endpoint error', { error: error?.message });
        res?.status(500)?.json({ error: 'Internal server error' });
    }
});

// WebSocket Handler
wss?.on('connection', (ws) => {
    wsClients?.add(ws);
    logToConsole('info', 'WebSocket client connected', { total_clients: wsClients?.size });

    // Send initial connection message
    ws?.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date()?.toISOString(),
        message: 'Connected to Orchestrator-Lite event stream'
    }));

    // Ping/Pong for connection health
    const pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket?.OPEN) {
            ws?.ping();
        }
    }, 30000);

    ws?.on('pong', () => {
        // Connection is alive
    });

    ws?.on('close', () => {
        wsClients?.delete(ws);
        clearInterval(pingInterval);
        logToConsole('info', 'WebSocket client disconnected', { total_clients: wsClients?.size });
    });

    ws?.on('error', (error) => {
        logToConsole('error', 'WebSocket client error', { error: error?.message });
        wsClients?.delete(ws);
        clearInterval(pingInterval);
    });
});

// Error Handling
app?.use((req, res) => {
    res?.status(404)?.json({ 
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        timestamp: new Date()?.toISOString()
    });
});

app?.use((error, req, res, next) => {
    logToConsole('error', 'Unhandled application error', { error: error?.message });
    res?.status(500)?.json({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date()?.toISOString()
    });
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    logToConsole('info', 'Shutting down Orchestrator-Lite...');
    
    // Close WebSocket connections
    wss?.clients?.forEach(ws => ws?.terminate());
    
    // Close Redis connections
    await redis?.disconnect();
    await subscriber?.disconnect();
    
    // Close PostgreSQL pool
    await pgPool?.end();
    
    // Close HTTP server
    server?.close(() => {
        logToConsole('info', 'Orchestrator-Lite shutdown complete');
        process.exit(0);
    });
});

// Start Server
server?.listen(PORT, () => {
    logToConsole('info', 'Orchestrator-Lite started', { 
        port: PORT,
        front_origin: FRONT_ORIGIN,
        redis_url: REDIS_URL?.replace(/\/\/.*@/, '//***@'),
        node_env: process.env?.NODE_ENV || 'development'
    });
});

module.exports = { app, server };