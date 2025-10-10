#!/bin/node

/**
 * 🔍 Enhanced API Health Check Utility for Trading MVP
 * Comprehensive diagnostics with automated recovery recommendations
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');
const { execSync } = require('child_process');

// Enhanced Configuration
const CONFIG = {
    API_BASE: process.env?.API_BASE || 'https://api.trading-mvp.com',
    LOCAL_BASE: 'http://localhost:8080',
    TIMEOUT: parseInt(process.env?.CHECK_TIMEOUT) || 8000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    TEST_ENDPOINTS: [
        { path: '/status', method: 'GET', name: 'API Status', critical: true },
        { path: '/health', method: 'GET', name: 'Health Check', critical: true },
        { path: '/providers/health', method: 'GET', name: 'Providers Health', critical: false },
        { path: '/scores?window=252', method: 'GET', name: 'Schema Validation', critical: true },
        { path: '/registry', method: 'GET', name: 'Traefik Routing', critical: false },
        { path: '/select', method: 'GET', name: 'Strategy Selection', critical: false }
    ],
    EXPECTED_HEADERS: [
        'content-type',
        'access-control-allow-origin'
    ],
    SUCCESS_THRESHOLD: 80, // Percentage of tests that must pass
    WARNING_THRESHOLD: 60
};

// Enhanced colors and formatting
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
};

// Enhanced logging utilities
const log = {
    info: (msg) => console.log(`${colors?.green}[INFO]${colors?.reset} ${msg}`),
    warn: (msg) => console.log(`${colors?.yellow}[WARN]${colors?.reset} ${msg}`),
    error: (msg) => console.log(`${colors?.red}[ERROR]${colors?.reset} ${msg}`),
    debug: (msg) => console.log(`${colors?.blue}[DEBUG]${colors?.reset} ${msg}`),
    success: (msg) => console.log(`${colors?.green}✅${colors?.reset} ${msg}`),
    fail: (msg) => console.log(`${colors?.red}❌${colors?.reset} ${msg}`),
    progress: (msg) => console.log(`${colors?.cyan}🔄${colors?.reset} ${msg}`),
    critical: (msg) => console.log(`${colors?.bgRed}${colors?.white} CRITICAL ${colors?.reset} ${msg}`),
    header: (msg) => {
        const line = '='?.repeat(60);
        console.log(`\n${colors?.bright}${line}`);
        console.log(`${colors?.bright}${msg}${colors?.reset}`);
        console.log(`${colors?.bright}${line}${colors?.reset}\n`);
    }
};

/**
 * Enhanced HTTP request with comprehensive error handling
 */
function makeRequest(url, options = {}) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const protocol = url.startsWith('https:') ? https : http;
        const timeout = options.timeout || CONFIG.TIMEOUT;
        
        const reqOptions = {
            timeout: timeout,
            headers: {
                'User-Agent': 'TradingMVP-HealthCheck/2.0',
                'Accept': 'application/json, text/plain, */*',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                ...options.headers
            },
            ...options
        };

        let responseData = '';
        let completed = false;

        const req = protocol.get(url, reqOptions, (res) => {
            res.on('data', (chunk) => {
                responseData += chunk;
                
                // Prevent memory issues with large responses
                if (responseData.length > 10000) {
                    responseData = responseData.substring(0, 10000) + '...[truncated]';
                }
            });
            
            res.on('end', () => {
                if (completed) return;
                completed = true;
                
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                
                // Parse JSON if possible
                let parsedData = null;
                let parseError = null;
                
                if (res.headers['content-type']?.includes('application/json')) {
                    try {
                        parsedData = JSON.parse(responseData);
                    } catch (e) {
                        parseError = e.message;
                    }
                }
                
                resolve({
                    success: true,
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: responseData,
                    parsedData: parsedData,
                    parseError: parseError,
                    responseTime: responseTime,
                    url: url,
                    size: responseData.length
                });
            });
        });

        req.on('error', (error) => {
            if (completed) return;
            completed = true;
            
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            resolve({
                success: false,
                error: error.message,
                code: error.code,
                errno: error.errno,
                syscall: error.syscall,
                hostname: error.hostname,
                responseTime: responseTime,
                url: url
            });
        });

        req.on('timeout', () => {
            if (completed) return;
            completed = true;
            
            req.destroy();
            resolve({
                success: false,
                error: 'Request timeout',
                code: 'TIMEOUT',
                responseTime: timeout,
                url: url
            });
        });

        req.setTimeout(timeout);
    });
}

/**
 * Test endpoint with intelligent retries
 */
async function testEndpoint(baseUrl, endpoint, retries = CONFIG?.MAX_RETRIES) {
    const url = `${baseUrl}${endpoint?.path}`;
    let lastResult = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        if (attempt > 1) {
            log?.debug(`Retry ${attempt}/${retries}: ${endpoint?.name}`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        }
        
        const result = await makeRequest(url, { method: endpoint?.method });
        lastResult = result;
        
        // Success criteria
        if (result?.success && result?.status >= 200 && result?.status < 300) {
            return {
                ...result,
                endpoint: endpoint?.name,
                path: endpoint?.path,
                attempts: attempt,
                critical: endpoint?.critical || false
            };
        }
        
        // Don't retry client errors (4xx) except 429 (rate limiting)
        if (result?.success && result?.status >= 400 && result?.status < 500 && result?.status !== 429) {
            break;
        }
    }
    
    return {
        ...lastResult,
        endpoint: endpoint?.name,
        path: endpoint?.path,
        attempts: retries,
        critical: endpoint?.critical || false
    };
}

/**
 * Enhanced error categorization with specific solutions
 */
function categorizeError(result) {
    if (!result?.error && result?.success && result?.status < 400) {
        return {
            category: 'SUCCESS',
            severity: 'info',
            description: 'Request completed successfully'
        };
    }
    
    const error = result?.error?.toLowerCase() || '';
    const code = result?.code || '';
    const status = result?.status || 0;
    
    // Network-level errors
    if (code === 'TIMEOUT' || error?.includes('timeout')) {
        return {
            category: 'TIMEOUT',
            severity: 'warning',
            description: 'Server response time exceeded timeout limit',
            possibleCauses: [
                'Server is overloaded or performing slow operations',
                'Network connectivity issues',
                'Database queries taking too long',
                'Insufficient server resources'
            ],
            solutions: [
                'Check server logs for performance issues',
                'Monitor CPU and memory usage',
                'Optimize database queries',
                'Increase server timeout settings'
            ]
        };
    }
    
    if (error?.includes('econnrefused') || code === 'ECONNREFUSED') {
        return {
            category: 'CONNECTION_REFUSED',
            severity: 'critical',
            description: 'Connection actively refused by server',
            possibleCauses: [
                'API server is not running',
                'Wrong port number',
                'Firewall blocking connection',
                'Service crashed or failed to start'
            ],
            solutions: [
                'Start the API server: cd backend && ./start-server.sh',
                'Check if server process is running: ps aux | grep node',
                'Verify port configuration',
                'Check firewall settings'
            ]
        };
    }
    
    if (error?.includes('enotfound') || code === 'ENOTFOUND') {
        return {
            category: 'DNS_ERROR',
            severity: 'critical',
            description: 'Domain name could not be resolved',
            possibleCauses: [
                'Domain not configured in DNS',
                'DNS server issues',
                'Domain name typo',
                'DNS propagation not complete'
            ],
            solutions: [
                'Check domain DNS configuration',
                'Add entry to /etc/hosts for testing',
                'Verify domain ownership',
                'Wait for DNS propagation (up to 48 hours)'
            ]
        };
    }
    
    if (error?.includes('econnreset') || code === 'ECONNRESET') {
        return {
            category: 'CONNECTION_RESET',
            severity: 'error',
            description: 'Connection was reset by the server',
            possibleCauses: [
                'Server crashed during request',
                'Proxy/load balancer issues',
                'Network instability',
                'Server restart'
            ],
            solutions: [
                'Check server logs for crashes',
                'Verify proxy configuration',
                'Monitor network stability',
                'Implement connection retry logic'
            ]
        };
    }
    
    if (error?.includes('eacces') || code === 'EACCES') {
        return {
            category: 'PERMISSION_DENIED',
            severity: 'error',
            description: 'Permission denied accessing resource',
            possibleCauses: [
                'Insufficient file permissions',
                'SELinux/security policy blocking access',
                'User lacks required privileges'
            ],
            solutions: [
                'Check file permissions: ls -la',
                'Run with appropriate user permissions',
                'Review security policies'
            ]
        };
    }
    
    // HTTP status codes
    if (status === 404) {
        return {
            category: 'NOT_FOUND',
            severity: 'error',
            description: 'Endpoint not found',
            possibleCauses: [
                'API endpoint not implemented',
                'Wrong URL path',
                'Server routing misconfiguration'
            ],
            solutions: [
                'Check API documentation',
                'Verify endpoint URL',
                'Review server routing configuration'
            ]
        };
    }
    
    if (status >= 500) {
        return {
            category: 'SERVER_ERROR',
            severity: 'critical',
            description: `Internal server error (${status})`,
            possibleCauses: [
                'Server application error',
                'Database connectivity issues',
                'Unhandled exceptions',
                'Configuration problems'
            ],
            solutions: [
                'Check server error logs',
                'Verify database connectivity',
                'Review recent code changes',
                'Check environment variables'
            ]
        };
    }
    
    if (status >= 400 && status < 500) {
        return {
            category: 'CLIENT_ERROR',
            severity: 'warning',
            description: `Client request error (${status})`,
            possibleCauses: [
                'Invalid request format',
                'Missing authentication',
                'Insufficient permissions',
                'Rate limiting'
            ],
            solutions: [
                'Verify request headers and parameters',
                'Check authentication credentials',
                'Review API rate limits',
                'Validate request payload'
            ]
        };
    }
    
    // CORS issues
    if (error?.includes('cors')) {
        return {
            category: 'CORS_ERROR',
            severity: 'error',
            description: 'Cross-Origin Resource Sharing configuration issue',
            possibleCauses: [
                'CORS not enabled on server',
                'Frontend domain not allowed',
                'Preflight request failing'
            ],
            solutions: [
                'Configure CORS in server application',
                'Add frontend domain to allowed origins',
                'Handle OPTIONS requests properly'
            ]
        };
    }
    
    // Default category
    return {
        category: 'NETWORK_ERROR',
        severity: 'error',
        description: 'Generic network or connectivity issue',
        possibleCauses: [
            'Network connectivity problems',
            'Proxy configuration issues',
            'Unknown server error'
        ],
        solutions: [
            'Check network connectivity',
            'Review proxy settings',
            'Examine server logs',
            'Verify server configuration'
        ]
    };
}

/**
 * Check system prerequisites
 */
function checkSystemPrerequisites() {
    log?.progress('Checking system prerequisites...');
    
    const checks = [];
    
    // Check Node.js
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' })?.trim();
        checks?.push({ name: 'Node.js', status: 'success', value: nodeVersion });
    } catch (error) {
        checks?.push({ name: 'Node.js', status: 'error', error: 'Not installed' });
    }
    
    // Check npm
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' })?.trim();
        checks?.push({ name: 'npm', status: 'success', value: npmVersion });
    } catch (error) {
        checks?.push({ name: 'npm', status: 'error', error: 'Not installed' });
    }
    
    // Check curl
    try {
        execSync('which curl', { encoding: 'utf8', stdio: 'pipe' });
        checks?.push({ name: 'curl', status: 'success', value: 'Available' });
    } catch (error) {
        checks?.push({ name: 'curl', status: 'warning', error: 'Not installed' });
    }
    
    // Check PM2
    try {
        const pm2Version = execSync('pm2 --version', { encoding: 'utf8' })?.trim();
        checks?.push({ name: 'PM2', status: 'success', value: pm2Version });
    } catch (error) {
        checks?.push({ name: 'PM2', status: 'info', error: 'Not installed (optional)' });
    }
    
    return checks;
}

/**
 * Generate automated fix script
 */
function generateFixScript(results) {
    const criticalErrors = results?.filter(r => {
        const category = categorizeError(r);
        return category?.severity === 'critical';
    });
    
    if (criticalErrors?.length === 0) return null;
    
    let script = '#!/bin/bash\n\n';
    script += '# 🔧 Automated Fix Script Generated by API Health Check\n';
    script += '# Run with: chmod +x fix_api.sh && ./fix_api.sh\n\n';
    
    script += 'echo "🔧 Starting automated API fixes..."\n\n';
    
    criticalErrors?.forEach(error => {
        const category = categorizeError(error);
        
        script += `# Fix for ${category?.category}: ${error?.endpoint}\n`;
        
        switch (category?.category) {
            case 'CONNECTION_REFUSED':
                script += 'echo "🔄 Starting API server..."\n';
                script += 'cd backend 2>/dev/null || cd .\n';
                script += 'if [ -f "start-server.sh" ]; then\n';
                script += '    chmod +x start-server.sh\n';
                script += '    ./start-server.sh\n';
                script += 'elif [ -f "server.js" ]; then\n';
                script += '    nohup node server.js > server.log 2>&1 &\n';
                script += '    echo $! > server.pid\n';
                script += 'else\n';
                script += '    echo "❌ No server.js found"\n';
                script += 'fi\n\n';
                break;
                
            case 'DNS_ERROR':
                script += 'echo "🔧 Adding DNS entry to /etc/hosts for testing..."\n';
                script += 'if ! grep -q "api.trading-mvp.com" /etc/hosts; then\n';
                script += '    echo "127.0.0.1 api.trading-mvp.com" | sudo tee -a /etc/hosts\n';
                script += '    echo "Added api.trading-mvp.com to /etc/hosts"\n';
                script += 'fi\n\n';
                break;
                
            default:
                script += `echo "⚠️  Manual intervention required for ${category?.category}"\n\n`;
        }
    });
    
    script += 'echo "✅ Automated fixes completed"\n';
    script += 'echo "🧪 Testing API in 5 seconds..."\n';
    script += 'sleep 5\n';
    script += 'node check_api.js\n';
    
    return script;
}

/**
 * Main health check execution
 */
async function runHealthCheck() {
    log?.header('🔍 TRADING MVP API COMPREHENSIVE HEALTH CHECK');
    
    console.log(`📡 Production API: ${CONFIG?.API_BASE}`);
    console.log(`🏠 Local API: ${CONFIG?.LOCAL_BASE}`);
    console.log(`⏱️  Timeout: ${CONFIG?.TIMEOUT}ms`);
    console.log(`🔄 Max Retries: ${CONFIG?.MAX_RETRIES}\n`);
    
    // Check system prerequisites
    log?.header('SYSTEM PREREQUISITES');
    const sysChecks = checkSystemPrerequisites();
    
    sysChecks?.forEach(check => {
        if (check?.status === 'success') {
            log?.success(`${check?.name}: ${check?.value}`);
        } else if (check?.status === 'warning') {
            log?.warn(`${check?.name}: ${check?.error}`);
        } else if (check?.status === 'error') {
            log?.fail(`${check?.name}: ${check?.error}`);
        } else {
            log?.info(`${check?.name}: ${check?.error}`);
        }
    });
    
    const results = {
        production: [],
        local: [],
        summary: {
            total: 0,
            success: 0,
            failed: 0,
            critical: 0,
            avgResponseTime: 0,
            startTime: new Date()?.toISOString()
        }
    };
    
    // Test Production API
    log?.header('PRODUCTION API TESTING');
    log?.progress('Testing production endpoints...');
    
    for (const endpoint of CONFIG?.TEST_ENDPOINTS) {
        log?.debug(`Testing ${endpoint?.name}...`);
        const result = await testEndpoint(CONFIG?.API_BASE, endpoint);
        results?.production?.push(result);
        results.summary.total++;
        
        if (result?.success && result?.status >= 200 && result?.status < 300) {
            log?.success(`${endpoint?.name}: ${result?.responseTime}ms`);
            results.summary.success++;
        } else {
            const category = categorizeError(result);
            const icon = category?.severity === 'critical' ? '🚨' : category?.severity === 'error' ? '❌' : '⚠️';
            log?.fail(`${endpoint?.name}: ${icon} ${result?.error || `HTTP ${result?.status}`}`);
            results.summary.failed++;
            
            if (category?.severity === 'critical' || endpoint?.critical) {
                results.summary.critical++;
            }
        }
    }
    
    // Test Local API
    log?.header('LOCAL API TESTING');
    log?.progress('Testing local endpoints...');
    
    for (const endpoint of CONFIG?.TEST_ENDPOINTS) {
        log?.debug(`Testing ${endpoint?.name} locally...`);
        const result = await testEndpoint(CONFIG?.LOCAL_BASE, endpoint);
        results?.local?.push(result);
        results.summary.total++;
        
        if (result?.success && result?.status >= 200 && result?.status < 300) {
            log?.success(`${endpoint?.name} (Local): ${result?.responseTime}ms`);
            results.summary.success++;
        } else {
            const category = categorizeError(result);
            const icon = category?.severity === 'critical' ? '🚨' : category?.severity === 'error' ? '❌' : '⚠️';
            log?.fail(`${endpoint?.name} (Local): ${icon} ${result?.error || `HTTP ${result?.status}`}`);
            results.summary.failed++;
            
            if (category?.severity === 'critical' || endpoint?.critical) {
                results.summary.critical++;
            }
        }
    }
    
    // Calculate metrics
    const allResults = [...results?.production, ...results?.local];
    const successfulResults = allResults?.filter(r => r?.success && r?.status >= 200 && r?.status < 300);
    results.summary.avgResponseTime = successfulResults?.length > 0 
        ? Math.round(successfulResults?.reduce((sum, r) => sum + r?.responseTime, 0) / successfulResults?.length)
        : 0;
    
    const successRate = Math.round((results?.summary?.success / results?.summary?.total) * 100);
    
    // Comprehensive summary
    log?.header('COMPREHENSIVE ANALYSIS');
    
    console.log(`📊 Total Tests: ${results?.summary?.total}`);
    console.log(`${colors?.green}✅ Successful: ${results?.summary?.success}${colors?.reset}`);
    console.log(`${colors?.red}❌ Failed: ${results?.summary?.failed}${colors?.reset}`);
    console.log(`${colors?.bgRed}${colors?.white} 🚨 Critical: ${results?.summary?.critical} ${colors?.reset}`);
    console.log(`⚡ Average Response Time: ${results?.summary?.avgResponseTime}ms`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    // Overall status
    console.log('');
    if (successRate >= CONFIG?.SUCCESS_THRESHOLD) {
        console.log(`${colors?.bgGreen}${colors?.white} 🎉 STATUS: HEALTHY ${colors?.reset}`);
    } else if (successRate >= CONFIG?.WARNING_THRESHOLD) {
        console.log(`${colors?.bgYellow} ⚠️  STATUS: DEGRADED ${colors?.reset}`);
    } else {
        console.log(`${colors?.bgRed}${colors?.white} 🚨 STATUS: CRITICAL ${colors?.reset}`);
    }
    
    // Detailed error analysis with solutions
    const failedResults = allResults?.filter(r => !r?.success || r?.status >= 400);
    if (failedResults?.length > 0) {
        log?.header('ERROR ANALYSIS & SOLUTIONS');
        
        const errorsByCategory = {};
        failedResults?.forEach(result => {
            const category = categorizeError(result);
            const key = category?.category;
            
            if (!errorsByCategory?.[key]) {
                errorsByCategory[key] = {
                    category: category,
                    results: []
                };
            }
            errorsByCategory?.[key]?.results?.push(result);
        });
        
        Object.entries(errorsByCategory)?.forEach(([categoryName, errorGroup]) => {
            const cat = errorGroup?.category;
            const count = errorGroup?.results?.length;
            const plural = count > 1 ? 's' : '';
            
            console.log(`\n${colors?.bright}${colors?.red}${categoryName}${colors?.reset} (${count} occurrence${plural}):`);
            console.log(`${colors?.dim}${cat?.description}${colors?.reset}`);
            
            if (cat?.possibleCauses) {
                console.log(`\n${colors?.yellow}Possible Causes:${colors?.reset}`);
                cat?.possibleCauses?.forEach((cause, index) => {
                    console.log(`  ${index + 1}. ${cause}`);
                });
            }
            
            if (cat?.solutions) {
                console.log(`\n${colors?.green}Recommended Solutions:${colors?.reset}`);
                cat?.solutions?.forEach((solution, index) => {
                    console.log(`  ${index + 1}. ${solution}`);
                });
            }
            
            console.log(`\n${colors?.cyan}Affected Endpoints:${colors?.reset}`);
            errorGroup?.results?.forEach(result => {
                const statusInfo = result?.error || `HTTP ${result?.status}`;
                const timeInfo = result?.responseTime ? ` (${result?.responseTime}ms)` : '';
                console.log(`  • ${result?.endpoint}: ${statusInfo}${timeInfo}`);
            });
        });
    }
    
    // Recovery recommendations
    log?.header('RECOVERY PLAN');
    
    const hasLocalSuccess = results?.local?.some(r => r?.success && r?.status >= 200 && r?.status < 300);
    const hasProductionSuccess = results?.production?.some(r => r?.success && r?.status >= 200 && r?.status < 300);
    
    if (hasLocalSuccess && hasProductionSuccess) {
        console.log('🎉 Both local and production APIs are working!');
        console.log('✅ Your system is ready for development and production.');
    } else if (hasLocalSuccess) {
        console.log('🔧 Local API is working, but production needs attention:');
        console.log('   1. Deploy to production server');
        console.log('   2. Configure reverse proxy (Nginx/Traefik)');
        console.log('   3. Set up SSL certificate');
        console.log('   4. Verify DNS configuration');
    } else if (hasProductionSuccess) {
        console.log('🔧 Production API is working, but local development needs setup:');
        console.log('   1. Install dependencies: npm install');
        console.log('   2. Start local server: cd backend && node server.js');
        console.log('   3. Check environment variables');
    } else {
        console.log('🚨 Both local and production APIs need immediate attention:');
        console.log('   1. Start local API server first');
        console.log('   2. Verify server.js exists and is runnable');
        console.log('   3. Check all environment variables');
        console.log('   4. Review server logs for errors');
    }
    
    // Generate automated fix script
    const fixScript = generateFixScript(failedResults);
    if (fixScript) {
        const fs = require('fs');
        fs?.writeFileSync('/tmp/fix_api.sh', fixScript, { mode: 0o755 });
        console.log('\n🔧 Automated fix script generated: /tmp/fix_api.sh');
        console.log('   Run with: chmod +x /tmp/fix_api.sh && /tmp/fix_api.sh');
    }
    
    // Quick commands section
    log?.header('QUICK COMMANDS');
    
    console.log('🚀 Start API Server:');
    console.log('   cd backend && ./start-server.sh');
    console.log('   # OR');
    console.log('   cd backend && node server.js');
    console.log('   # OR');
    console.log('   pm2 start backend/server.js --name trading-mvp-api');
    
    console.log('\n🔄 Manage Services:');
    console.log('   pm2 status');
    console.log('   pm2 logs trading-mvp-api');
    console.log('   pm2 restart trading-mvp-api');
    
    console.log('\n🧪 Manual Testing:');
    console.log('   curl -v http://localhost:8080/status');
    console.log('   curl -v https://api.trading-mvp.com/status');
    
    console.log('\n🔍 Diagnostics:');
    console.log('   ./fix-traefik-connection.sh');
    console.log('   netstat -ln | grep :8080');
    console.log('   ps aux | grep node');
    
    // Final status and exit code
    console.log('');
    if (results?.summary?.critical > 0) {
        log?.critical('CRITICAL ISSUES DETECTED - Immediate action required');
        process.exit(2);
    } else if (successRate < CONFIG?.WARNING_THRESHOLD) {
        log?.error('MULTIPLE FAILURES - System requires attention');
        process.exit(1);
    } else if (successRate < CONFIG?.SUCCESS_THRESHOLD) {
        log?.warn('SOME ISSUES DETECTED - Review recommended');
        process.exit(0);
    } else {
        log?.success('ALL SYSTEMS OPERATIONAL');
        process.exit(0);
    }
}

// Enhanced command line argument parsing
function parseArguments() {
    process.argv?.forEach(arg => {
        if (arg?.startsWith('--timeout=')) {
            CONFIG.TIMEOUT = parseInt(arg?.split('=')?.[1]) || CONFIG?.TIMEOUT;
        } else if (arg?.startsWith('--retries=')) {
            CONFIG.MAX_RETRIES = parseInt(arg?.split('=')?.[1]) || CONFIG?.MAX_RETRIES;
        } else if (arg?.startsWith('--api-base=')) {
            CONFIG.API_BASE = arg?.split('=')?.[1];
        } else if (arg?.startsWith('--local-base=')) {
            CONFIG.LOCAL_BASE = arg?.split('=')?.[1];
        } else if (arg === '--verbose' || arg === '-v') {
            // Enable verbose logging (could be implemented)
        }
    });
}

// Help message
if (process.argv?.includes('--help') || process.argv?.includes('-h')) {
    console.log(`
${colors?.bright}🔍 Trading MVP API Health Check Utility v2.0${colors?.reset}

${colors?.green}Usage:${colors?.reset} node check_api.js [options]

${colors?.green}Options:${colors?.reset}
  --help, -h         Show this help message
  --timeout=ms       Set request timeout (default: ${CONFIG?.TIMEOUT}ms)
  --retries=n        Set max retries (default: ${CONFIG?.MAX_RETRIES})
  --api-base=url     Set production API base URL
  --local-base=url   Set local API base URL
  --verbose, -v      Enable verbose output

${colors?.green}Examples:${colors?.reset}
  node check_api.js
  node check_api.js --timeout=10000 --verbose
  node check_api.js --api-base=https://custom-api.com
  node check_api.js --retries=5

${colors?.green}Environment Variables:${colors?.reset}
  API_BASE           Production API URL
  CHECK_TIMEOUT      Request timeout in milliseconds

${colors?.green}Exit Codes:${colors?.reset}
  0  Success - All systems operational
  1  Warning - Some issues detected
  2  Critical - Immediate action required
    `);
    process.exit(0);
}

// Process termination handlers
process.on('SIGINT', () => {
    console.log('\n\n🛑 Health check interrupted by user');
    process.exit(130);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Health check terminated');
    process.exit(143);
});

process.on('uncaughtException', (error) => {
    log?.critical(`Uncaught Exception: ${error?.message}`);
    console.error(error?.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log?.critical(`Unhandled Promise Rejection: ${reason}`);
    console.error('Promise:', promise);
    process.exit(1);
});

// Main execution
if (require.main === module) {
    parseArguments();
    runHealthCheck()?.catch(error => {
        log?.critical(`Fatal Error: ${error?.message}`);
        console.error(error?.stack);
        process.exit(1);
    });
}

// Export for use as a module
module.exports = { 
    runHealthCheck, 
    testEndpoint, 
    categorizeError, 
    makeRequest,
    CONFIG 
};