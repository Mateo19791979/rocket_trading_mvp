// ======================================================================
// Canary Promotion Service - Handles IBKR Paper promotion operations
// ======================================================================

class CanaryPromotionService {
  constructor() {
    this.baseUrl = process.env?.REACT_APP_API_URL || '';
    this.adminKey = process.env?.REACT_APP_INTERNAL_ADMIN_KEY || 'CHANGE_ME';
  }

  async getPolicy() {
    try {
      const response = await fetch(`${this.baseUrl}/api/evo/canary/policy`);
      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
      }
      const data = await response?.json();
      return data;
    } catch (error) {
      console.error('Error fetching canary policy:', error);
      throw new Error(error?.message || 'Failed to fetch canary policy');
    }
  }

  async updatePolicy(policyUpdates) {
    try {
      const response = await fetch(`${this.baseUrl}/api/evo/canary/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': this.adminKey
        },
        body: JSON.stringify(policyUpdates)
      });

      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
      }

      const data = await response?.json();
      return data;
    } catch (error) {
      console.error('Error updating canary policy:', error);
      throw new Error(error?.message || 'Failed to update canary policy');
    }
  }

  async getPromotionLogs(limit = 100) {
    try {
      const response = await fetch(`${this.baseUrl}/api/evo/canary/logs`);
      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
      }
      const data = await response?.json();
      return data;
    } catch (error) {
      console.error('Error fetching promotion logs:', error);
      throw new Error(error?.message || 'Failed to fetch promotion logs');
    }
  }

  async promoteCandidate(candidateId) {
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/evo/canary/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': this.adminKey
        },
        body: JSON.stringify({ candidate_id: candidateId })
      });

      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
      }

      const data = await response?.json();
      return data;
    } catch (error) {
      console.error('Error promoting candidate:', error);
      throw new Error(error?.message || 'Failed to promote candidate');
    }
  }

  // Helper method to format promotion logs for display
  formatPromotionLog(log) {
    if (!log) return null;

    return {
      id: log?.id,
      candidateId: log?.candidate_id,
      action: log?.action,
      reason: log?.reason,
      timestamp: log?.created_at ? new Date(log?.created_at)?.toLocaleString() : 'Unknown',
      payload: log?.payload,
      displayText: this.getDisplayText(log?.action, log?.reason),
      statusColor: this.getStatusColor(log?.action)
    };
  }

  getDisplayText(action, reason) {
    switch (action) {
      case 'queued_canary':
        return 'Successfully promoted to canary';
      case 'skipped':
        return reason || 'Promotion skipped';
      case 'error':
        return reason || 'Promotion failed';
      default:
        return reason || action;
    }
  }

  getStatusColor(action) {
    switch (action) {
      case 'queued_canary':
        return 'green';
      case 'skipped':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  }

  // Get promotion statistics
  getPromotionStats(logs) {
    if (!logs?.length) {
      return {
        total: 0,
        successful: 0,
        skipped: 0,
        errors: 0,
        successRate: 0
      };
    }

    const stats = logs?.reduce((acc, log) => {
      acc.total++;
      switch (log?.action) {
        case 'queued_canary':
          acc.successful++;
          break;
        case 'skipped':
          acc.skipped++;
          break;
        case 'error':
          acc.errors++;
          break;
      }
      return acc;
    }, { total: 0, successful: 0, skipped: 0, errors: 0 });

    stats.successRate = stats?.total > 0 ? (stats?.successful / stats?.total * 100)?.toFixed(1) : 0;

    return stats;
  }

  // Check if canary system is healthy
  async getSystemHealth() {
    try {
      const [policy, logs] = await Promise.all([
        this.getPolicy(),
        this.getPromotionLogs(10)
      ]);

      const recentErrors = logs?.data?.filter(log => 
        log?.action === 'error' && 
        new Date(log?.created_at) > new Date(Date.now() - 3600000) // Last hour
      )?.length || 0;

      return {
        ok: policy?.ok && logs?.ok,
        policy: policy?.policy,
        isActive: policy?.policy?.active,
        recentErrors,
        lastActivity: logs?.data?.[0]?.created_at,
        systemStatus: recentErrors > 5 ? 'degraded' : 'healthy'
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message,
        systemStatus: 'error'
      };
    }
  }
}

// Export singleton instance
const canaryPromotionService = new CanaryPromotionService();
export default canaryPromotionService;