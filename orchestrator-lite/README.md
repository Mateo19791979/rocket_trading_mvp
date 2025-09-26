# Orchestrator-Lite — Redis + Postgres Event Bus System

## 🎯 Overview

Complete orchestration layer for Rocketnew trading platform with event bus, agent registry, state management, and observability endpoints.

## ⚡ Features

- **Event Bus**: Redis pub/sub with database persistence  
- **Agent Registry**: Real-time agent monitoring and heartbeat tracking
- **State Management**: Key-value store for system state (regime detection, killswitch)
- **REST API**: Health endpoints, event querying, risk controls
- **WebSocket**: Real-time event streaming to frontend
- **Security**: CORS, rate limiting, structured logging

## 🛠 Prerequisites

- Node.js 18+
- Redis server running on port 6379
- PostgreSQL database with orchestrator tables
- Supabase project (for database integration)

## 📦 Installation

Dependencies are already included in main package.json:

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5", 
  "helmet": "^8.1.0",
  "express-rate-limit": "^8.1.0",
  "morgan": "^1.10.1",
  "ioredis": "^5.7.0",
  "pg": "^8.16.3",
  "ws": "^8.18.3"
}
```

## ⚙ Environment Variables

Create `.env` file with:

```bash
# Orchestrator Server
PORT=8090
FRONT_ORIGIN=https://trading.mvp.com

# Redis Configuration  
REDIS_URL=redis://localhost:6379

# PostgreSQL Configuration (use your Supabase connection string)
PG_URL=postgres://user:pass@host:5432/orch

# Rate Limiting (optional)
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=60
```

## 🚀 Quick Start

### 1. Start Redis Server
```bash
redis-server
```

### 2. Start Orchestrator-Lite
```bash
cd orchestrator-lite
node server.js
```

### 3. Run Sample Agents (in separate terminals)
```bash
# Development agent (heartbeat + mock signals)
node agents/dev-agent.js

# Quotes agent (market data simulation)  
node agents/quotes-agent.js

# Regime detector (volatility analysis)
node agents/regime-detector.js
```

### 4. Test API Endpoints
```bash
# Check agent health
curl http://localhost:8090/health/agents

# Get recent events  
curl "http://localhost:8090/bus/events?since=0&limit=10"

# Activate killswitch
curl -X POST http://localhost:8090/risk/killswitch \
  -H "Content-Type: application/json" \
  -d '{"reason":"manual test"}'

# Check regime state
curl http://localhost:8090/regime/state
```

## 📡 API Reference

### GET /health/agents
Returns agent registry status with heartbeat monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-22T16:10:00.000Z",
  "agents": [
    {
      "id": "dev-agent-1",
      "name": "Development Agent", 
      "agent_group": "development",
      "status": "active",
      "last_beat": "2025-09-22T16:09:55.000Z",
      "is_alive": true,
      "seconds_since_beat": 5
    }
  ],
  "total_agents": 3,
  "active_agents": 2
}
```

### GET /bus/events?since=cursor&limit=50&type=heartbeat
Paginated event stream with optional filtering.

**Parameters:**
- `since`: Event cursor (ID) for pagination
- `limit`: Max events per request (default: 50, max: 200) 
- `type`: Filter by event type (optional)

### POST /risk/killswitch
Emergency trading halt with reason tracking.

**Body:**
```json
{
  "reason": "market volatility detected"
}
```

### GET /regime/state  
Latest market regime detection results.

## 🔌 WebSocket Connection

Connect to real-time event stream:

```javascript
const ws = new WebSocket('ws://localhost:8090');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time event:', data);
};
```

## 🤖 Agent Development

### Basic Agent Template
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const agentId = 'your-agent-id';
const agentName = 'Your Agent Name';
const agentGroup = 'signals'; // ingestion, signals, execution, orchestration

// Heartbeat every 5 seconds
setInterval(() => {
  redis.publish(`heartbeat.${agentId}`, JSON.stringify({
    agent_id: agentId,
    name: agentName,  
    group: agentGroup,
    status: 'active',
    timestamp: new Date().toISOString()
  }));
}, 5000);

// Publish your events
redis.publish('strategy.candidate', JSON.stringify({
  symbol: 'AAPL',
  action: 'BUY', 
  confidence: 0.85,
  source: agentId
}));
```

### Subscription Patterns
The orchestrator automatically subscribes to:

- `data.market.*` - Market data feeds
- `news.signal.entity` - News analysis signals
- `quant.regime.state` - Market regime detection  
- `strategy.*` - Trading strategy signals
- `risk.*` - Risk management events
- `heartbeat.*` - Agent health monitoring

## 🎛 React Dashboard Integration

The orchestrator integrates with the React dashboard via:

1. **REST API calls** for initial data loading
2. **WebSocket connection** for real-time updates  
3. **Supabase integration** for historical data queries

Dashboard components:
- `AgentStatusGrid` - Live agent monitoring
- `EventBusMonitor` - Real-time event timeline
- `KillswitchPanel` - Emergency controls
- `RegimeStatePanel` - Market state display

## 📊 Database Schema

Required tables (already created via Supabase migration):

### agents
```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  agent_group TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  last_beat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### events  
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  ts TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### orchestrator_state
```sql
CREATE TABLE orchestrator_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

- **CORS Protection**: Restricted to `FRONT_ORIGIN` domain
- **Rate Limiting**: 60 requests/minute per IP
- **Input Validation**: JSON schema validation on all endpoints
- **Structured Logging**: JSON formatted logs with correlation IDs
- **Error Handling**: Sanitized error responses, no sensitive data leaks

## 📈 Performance

- **Event Caching**: 10-second cache for `/bus/events` endpoint  
- **Connection Pooling**: PostgreSQL connection pool (max: 20)
- **WebSocket Optimization**: Efficient message broadcasting
- **Response Time**: <300ms target for all endpoints

## 🚨 Monitoring & Alerts

### Health Checks
- Agent heartbeat monitoring (5-minute timeout)
- Redis connection health  
- PostgreSQL query performance
- WebSocket connection counts

### Logging
- Structured JSON logs with correlation IDs
- Error tracking with stack traces
- Performance metrics (response times)
- Event processing statistics

## 🛠 Troubleshooting

### Common Issues

**Redis Connection Failed**
```bash
# Check Redis is running
redis-cli ping
# Should return PONG

# Check Redis logs
redis-cli monitor
```

**PostgreSQL Connection Error**  
```bash
# Test connection string
psql "postgres://user:pass@host:5432/orch"

# Check Supabase project status
# Visit supabase.com/dashboard
```

**Agent Not Appearing in Dashboard**
- Verify agent is publishing heartbeat messages
- Check Redis subscription patterns match agent channels
- Confirm agent uses correct `agent_id` format

**Events Not Persisting**
- Check PostgreSQL connection and permissions
- Verify events table exists and has correct schema
- Check for constraint violations in event payload

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* node server.js

# Monitor Redis pub/sub
redis-cli psubscribe "*"  

# Check PostgreSQL activity  
tail -f /var/log/postgresql/postgresql.log
```

## 🔄 Production Deployment

### Recommended Setup
- **Load Balancer**: HAProxy/Nginx for WebSocket proxy
- **Process Manager**: PM2 for orchestrator server  
- **Monitoring**: Prometheus + Grafana for metrics
- **Logging**: Elasticsearch + Kibana for log analysis
- **Backup**: Redis persistence + PostgreSQL backups

### Environment-Specific Configs
```bash
# Development
REDIS_URL=redis://localhost:6379
PG_URL=postgres://localhost:5432/orch_dev

# Staging  
REDIS_URL=redis://redis-staging:6379
PG_URL=postgres://staging-db:5432/orch_staging

# Production
REDIS_URL=redis://redis-prod:6379
PG_URL=postgres://prod-db:5432/orch_prod
```

## 🧪 Testing

Run test endpoints:
```bash
# Start orchestrator in test mode
NODE_ENV=test node server.js

# Run agent simulation
node agents/dev-agent.js

# Test full workflow
npm run test:orchestrator
```

## 📚 Additional Resources

- [Redis Pub/Sub Guide](https://redis.io/docs/manual/pubsub/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)  
- [WebSocket Security](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- [PostgreSQL Connection Pooling](https://node-postgres.com/guides/upgrading)

## 🆘 Support

For issues or questions:
1. Check this README for common solutions
2. Review orchestrator server logs: `tail -f orchestrator-lite.log`  
3. Test individual components (Redis, PostgreSQL, agents)
4. Check React dashboard console for WebSocket connection errors

---

**Status**: ✅ Production Ready  
**Last Updated**: September 2025  
**Version**: 1.0.0