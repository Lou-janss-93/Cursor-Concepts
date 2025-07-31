// interaction-log.js - Plugin interaction logging system

class InteractionLog {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
  }

  // Log plugin runs with success/fail tags
  logPluginRun(pluginName, params, result, status = 'success') {
    const logEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      plugin: pluginName,
      params: params,
      result: result,
      status: status, // 'success' or 'fail'
      duration: result?.duration || 0
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.log(`Plugin run logged: ${pluginName} - ${status}`);
    return logEntry;
  }

  // Log success
  logSuccess(pluginName, params, result, duration = 0) {
    return this.logPluginRun(pluginName, params, {
      ...result,
      duration
    }, 'success');
  }

  // Log failure
  logFail(pluginName, params, error, duration = 0) {
    return this.logPluginRun(pluginName, params, {
      error: error.message,
      duration
    }, 'fail');
  }

  // Get logs with filtering
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    // Filter by status
    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }

    // Filter by plugin
    if (filters.plugin) {
      filteredLogs = filteredLogs.filter(log => log.plugin === filters.plugin);
    }

    // Filter by date range
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    return filteredLogs;
  }

  // Get statistics
  getStats() {
    const totalLogs = this.logs.length;
    const successLogs = this.logs.filter(log => log.status === 'success').length;
    const failLogs = this.logs.filter(log => log.status === 'fail').length;
    
    const pluginStats = {};
    this.logs.forEach(log => {
      if (!pluginStats[log.plugin]) {
        pluginStats[log.plugin] = { total: 0, success: 0, fail: 0 };
      }
      pluginStats[log.plugin].total++;
      if (log.status === 'success') {
        pluginStats[log.plugin].success++;
      } else {
        pluginStats[log.plugin].fail++;
      }
    });

    return {
      total: totalLogs,
      success: successLogs,
      fail: failLogs,
      successRate: totalLogs > 0 ? (successLogs / totalLogs * 100).toFixed(2) : 0,
      pluginStats: pluginStats
    };
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.log('Interaction logs cleared');
  }

  // Export logs
  exportLogs() {
    return {
      version: '1.0',
      timestamp: Date.now(),
      logs: this.logs,
      stats: this.getStats()
    };
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Format timestamp for display
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('nl-NL');
  }

  // Get recent logs (last N entries)
  getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }

  // Search logs
  searchLogs(query) {
    const searchTerm = query.toLowerCase();
    return this.logs.filter(log => 
      log.plugin.toLowerCase().includes(searchTerm) ||
      JSON.stringify(log.params).toLowerCase().includes(searchTerm) ||
      (log.result && JSON.stringify(log.result).toLowerCase().includes(searchTerm))
    );
  }
}

// Create singleton instance
const interactionLog = new InteractionLog();

export default interactionLog; 