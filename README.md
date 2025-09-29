# Trading MVP Knowledge Pipeline

A comprehensive Node.js pipeline system for processing financial PDF documents, extracting trading rules, building YAML strategy registries, and providing intelligent orchestration for automated trading rule generation.

## 🚀 Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Initialize pipeline directories
npm run setup

# 3) Add your PDF books to books_inbox/
cp /path/to/your/*.pdf books_inbox/

# 4) Run complete pipeline
npm run demo

# OR run step by step:
npm run ingest     # PDF → text extraction
npm run extract    # Rule pattern matching
npm run build:registry  # YAML registry build
npm run orchestrator demo  # Query strategies
```

## 📁 Project Structure

```
trading-mvp-knowledge-pipeline/
├── package.json
├── books_inbox/           # Input: PDF documents
├── workdir/              # Generated: text + metadata
├── registry/             # Generated: YAML rules per document  
├── out/                  # Generated: consolidated registry
└── src/
    ├── tools/hello.js        # Setup verification
    ├── ingest/pdf_ingest.js  # PDF text extraction
    ├── extract/rule_extract.js # Pattern matching
    ├── registry/build_registry.js # YAML consolidation
    └── orchestrator/orchestrator.js # Query engine
```

## 🔧 Pipeline Components

### 1. PDF Ingestion (`npm run ingest`)
- Extracts text from PDF files using `pdf-parse`
- Cleans and normalizes text content
- Generates metadata (pages, creation date, etc.)
- Output: `workdir/{docId}/raw.txt` + `meta.json`

### 2. Rule Extraction (`npm run extract`)
- NLP pattern matching for trading concepts
- Supports French/English derivatives terminology
- Extracts: options definitions, payoff rules, volatility concepts, Greeks
- Output: `registry/{docId}/rules.yaml` + `rules.json`

### 3. Registry Builder (`npm run build:registry`)
- Consolidates all extracted rules
- Creates searchable index
- Validates YAML structure
- Output: `out/registry.index.json` + `registry.all.yaml`

### 4. Orchestrator (`npm run orchestrator`)
- Query engine for strategy selection
- Task-based rule filtering
- Supports: `query "search_term"`, `select "task_description"`
- Smart matching for volatility/correlation analysis

## 📊 Web Interface: Strategy Registry Builder

Access the comprehensive web interface at `/strategy-registry-builder`:

### Features:
- **Rule Extraction Engine**: Real-time pattern matching with confidence scoring
- **Strategy Construction**: Automated YAML generation with schema validation  
- **Template Management**: Customizable templates for momentum, mean reversion, volatility, and arbitrage strategies
- **Registry Validation**: Schema checking, duplicate detection, conflict analysis
- **Integration Testing**: Backtesting simulation and orchestrator compatibility
- **Interactive Editing**: Version control, batch operations, collaborative editing

### Navigation:
- Dark theme with purple/blue accents
- Two-column responsive layout
- Real-time pipeline status monitoring
- Comprehensive registry statistics

## 🎯 Usage Examples

```bash
# Query for specific instruments
node src/orchestrator/orchestrator.js query "options call"

# Select strategies for specific tasks  
node src/orchestrator/orchestrator.js select "volatility hedging"

# Get correlation-focused strategies
node src/orchestrator/orchestrator.js select "correlation analysis"
```

## 📈 Pattern Matching

Current extraction patterns include:

- **Instruments**: Option calls/puts, futures, swaps
- **Payoffs**: Mathematical formulas (max/min functions)  
- **Concepts**: Volatility smile, implied volatility, correlations
- **Greeks**: Delta, gamma, vega, theta, rho sensitivity measures

## 🔄 DevOps Integration

The pipeline integrates with the existing Trading MVP infrastructure:

- **Backend API**: Endpoints for pipeline status and results
- **CI/CD**: Automated testing and deployment
- **Docker**: Containerized execution environment
- **PM2**: Production process management
- **Nginx**: Reverse proxy with SSL termination

## 📚 Dependencies

- **glob**: File system pattern matching
- **js-yaml**: YAML parsing and generation  
- **pdf-parse**: PDF text extraction
- **React ecosystem**: Web interface components

## 🚀 Production Deployment

```bash
# Server setup
sudo mkdir -p /var/www/trading-mvp
cd /var/www/trading-mvp
git clone <repository> .
npm ci

# Process management  
cd backend
pm2 startOrReload ecosystem.config.cjs
pm2 save

# Health checks
curl -fsS http://localhost:8080/status
curl -fsS https://api.trading-mvp.com/status
```

## 🎨 Architecture

The system follows a microservices architecture:

1. **Knowledge Pipeline**: PDF processing and rule extraction
2. **Strategy Builder**: YAML construction and validation
3. **Registry System**: Centralized strategy storage
4. **Orchestrator**: Intelligent strategy selection
5. **Web Interface**: Real-time monitoring and control

Built for scalability, maintainability, and integration with existing trading infrastructure.