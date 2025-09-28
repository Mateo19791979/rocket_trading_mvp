import fetch from "node-fetch";
import { spawn } from "child_process";


const execProcess = (command, args = []) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true 
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout?.on('data', (data) => stdout += data.toString());
    proc.stderr?.on('data', (data) => stderr += data.toString());
    
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    
    proc.on('error', (error) => {
      reject(error);
    });
  });
};

async function checkPort(port = 8080) {
  try {
    const { stdout } = await execProcess(`ss -ltnp | grep ${port}`);
    return stdout?.trim()?.length > 0;
  } catch {
    return false;
  }
}

async function checkPM2Status() {
  try {
    const { stdout, code } = await execProcess('pm2 status');
    if (code !== 0) return null;
    
    const lines = stdout?.split('\n') || [];
    const apiLine = lines?.find(line => line?.includes('trading-mvp-api'));
    
    if (apiLine) {
      const status = apiLine?.includes('online') ? 'online' : 
                   apiLine?.includes('stopped') ? 'stopped' : 
                   apiLine?.includes('errored') ? 'errored' : 'unknown';
      return { status, raw: apiLine };
    }
    return null;
  } catch {
    return null;
  }
}

async function diagnoseConnection(baseUrl) {
  console.log("\n🔍 Running connection diagnostics...");
  
  // Check if port is listening
  const portOpen = await checkPort(8080);
  console.log(`📡 Port 8080 listening: ${portOpen ? '✅ Yes' : '❌ No'}`);
  
  // Check PM2 status
  const pm2Status = await checkPM2Status();
  if (pm2Status) {
    console.log(`🔧 PM2 Status: ${pm2Status?.status === 'online' ? '✅' : '❌'} ${pm2Status?.status}`);
  } else {
    console.log("🔧 PM2 Status: ❌ PM2 not found or no trading-mvp-api process");
  }
  
  // Provide troubleshooting steps
  if (!portOpen || !pm2Status || pm2Status?.status !== 'online') {
    console.log("\n🚨 Troubleshooting steps:");
    console.log("1. Check if backend is running:");
    console.log("   pm2 status");
    console.log("2. If stopped, restart it:");
    console.log("   cd /var/www/trading-mvp/backend && pm2 start ecosystem.config.cjs");
    console.log("3. Check logs for errors:");
    console.log("   pm2 logs trading-mvp-api --lines 20");
    console.log("4. Verify port binding:");
    console.log("   ss -ltnp | grep 8080");
    console.log("5. Test manual connection:");
    console.log(`   curl -v ${baseUrl}/status`);
  }
}

async function testEndpoint(url, timeout = 8000) {
  try {
    console.log(`📊 Testing: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller?.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller?.signal,
      headers: { 'User-Agent': 'Trading-MVP-HealthCheck/1.0' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response?.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    
    const data = await response?.json();
    console.log(`   ✅ Status: ${response?.status} - ${data?.success ? 'Success' : 'Response received'}`);
    return data;
    
  } catch (error) {
    const errorMsg = error?.name === 'AbortError' ? 'Request timeout' :
                    error?.code === 'ECONNREFUSED' ? 'Connection refused - server not running' :
                    error?.code === 'ENOTFOUND'? 'Host not found' : error?.message ||'Unknown error';
    
    console.log(`   ❌ Failed: ${errorMsg}`);
    throw new Error(`${url} → ${errorMsg}`);
  }
}

async function runHealthCheck() {
  // Determine base URL with fallback options
  const base = process.env?.CHECK_BASE ||
               (process.env?.PUBLIC_API_HOST ? `https://${process.env?.PUBLIC_API_HOST}` : 
                "http://localhost:8080");
  
  console.log("🏥 Enhanced API Health Check Starting...");
  console.log(`🎯 Target: ${base}`);
  console.log(`⏰ Timestamp: ${new Date()?.toISOString()}`);
  
  const endpoints = [
    { path: '/status', name: 'Health Status' },
    { path: '/scores?window=5', name: 'Scores Data' },
    { path: '/select', name: 'Selected Strategy' }
  ];
  
  let allPassed = true;
  const results = [];
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    try {
      const data = await testEndpoint(`${base}${endpoint?.path}`);
      results?.push({ endpoint: endpoint?.path, status: 'success', data });
    } catch (error) {
      allPassed = false;
      results?.push({ endpoint: endpoint?.path, status: 'failed', error: error?.message });
      
      // Run diagnostics on first failure
      if (results?.filter(r => r?.status === 'failed')?.length === 1) {
        await diagnoseConnection(base);
      }
    }
  }
  
  // Summary
  console.log(`\n📋 Health Check Summary:`);
  console.log(`   Total Endpoints: ${endpoints?.length}`);
  console.log(`   Passed: ${results?.filter(r => r?.status === 'success')?.length}`);
  console.log(`   Failed: ${results?.filter(r => r?.status === 'failed')?.length}`);
  
  if (allPassed) {
    console.log("✅ All API health checks passed!");
  } else {
    console.log("❌ Some health checks failed. See diagnostics above.");
  }
  
  return allPassed;
}

// Enhanced execution with better error handling
(async () => {
  try {
    const success = await runHealthCheck();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("\n💥 Health check script error:", error?.message);
    console.log("\n🔧 Debug information:");
    console.log(`   Node version: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Working directory: ${process.cwd()}`);
    process.exit(1);
  }
})();