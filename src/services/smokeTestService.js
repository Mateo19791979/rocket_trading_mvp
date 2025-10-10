import { apiService } from './apiService';

// Smoke test service for API validation
export const smokeTestService = {
  async runAllTests() {
    const tests = [
      {
        name: 'API Status',
        test: () => apiService?.getStatus(),
        endpoint: '/status'
      },
      {
        name: 'Scores Window=5',
        test: () => apiService?.getScores(5),
        endpoint: '/scores?window=5'
      },
      {
        name: 'Selected Strategy',
        test: () => apiService?.getSelected(),
        endpoint: '/select'
      }
    ];

    const results = [];
    
    for (const test of tests) {
      const startTime = Date.now();
      let result = {
        name: test?.name,
        endpoint: test?.endpoint,
        status: 'PENDING',
        latency: 0,
        error: null,
        data: null
      };

      try {
        let response = await test?.test();
        result.latency = Date.now() - startTime;
        result.status = response?.success ? 'OK' : 'KO';
        result.data = response?.data;
        
        if (!response?.success) {
          result.error = 'API returned success=false';
        }
      } catch (error) {
        result.latency = Date.now() - startTime;
        result.status = 'KO';
        result.error = error?.message;
      }

      results?.push(result);
    }

    return {
      timestamp: new Date()?.toISOString(),
      totalTests: tests?.length,
      passed: results?.filter(r => r?.status === 'OK')?.length,
      failed: results?.filter(r => r?.status === 'KO')?.length,
      averageLatency: Math.round(results?.reduce((acc, r) => acc + r?.latency, 0) / results?.length),
      results
    };
  },

  async testSingleEndpoint(endpoint) {
    const startTime = Date.now();
    
    try {
      let response;
      switch (endpoint) {
        case '/status':
          response = await apiService?.getStatus();
          break;
        case '/scores?window=5':
          response = await apiService?.getScores(5);
          break;
        case '/select':
          response = await apiService?.getSelected();
          break;
        default:
          throw new Error('Unknown endpoint');
      }

      return {
        status: response?.success ? 'OK' : 'KO',
        latency: Date.now() - startTime,
        data: response?.data,
        error: response?.success ? null : 'API returned success=false'
      };
    } catch (error) {
      return {
        status: 'KO',
        latency: Date.now() - startTime,
        data: null,
        error: error?.message
      };
    }
  }
};