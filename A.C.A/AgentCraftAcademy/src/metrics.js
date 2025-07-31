/**
 * Metrics Renderer for AgentCraft Academy
 * Real-time metrics display and charting capabilities
 */

class MetricsRenderer {
    constructor() {
        this.container = null;
        this.metrics = new Map();
        this.charts = new Map();
        this.updateInterval = null;
        this.isInitialized = false;
        
        // Configuration
        this.config = {
            updateInterval: 5000,
            maxDataPoints: 50,
            debug: true
        };
    }

    /**
     * Initialize the metrics renderer
     */
    async initialize() {
        try {
            this.container = document.getElementById('metrics-content');
            if (!this.container) {
                throw new Error('Metrics container not found');
            }
            
            this.setupContainer();
            this.startUpdates();
            
            this.isInitialized = true;
            this.log('Metrics renderer initialized');
            
        } catch (error) {
            this.log('Error initializing metrics renderer:', error);
        }
    }

    /**
     * Setup metrics container
     */
    setupContainer() {
        this.container.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card" id="metric-agents">
                    <div class="metric-header">
                        <h4>Active Agents</h4>
                        <span class="metric-icon">🤖</span>
                    </div>
                    <div class="metric-value" id="metric-agents-value">0</div>
                    <div class="metric-trend" id="metric-agents-trend">+0%</div>
                </div>
                
                <div class="metric-card" id="metric-connections">
                    <div class="metric-header">
                        <h4>Connections</h4>
                        <span class="metric-icon">🔗</span>
                    </div>
                    <div class="metric-value" id="metric-connections-value">0</div>
                    <div class="metric-trend" id="metric-connections-trend">+0%</div>
                </div>
                
                <div class="metric-card" id="metric-messages">
                    <div class="metric-header">
                        <h4>Messages/sec</h4>
                        <span class="metric-icon">📨</span>
                    </div>
                    <div class="metric-value" id="metric-messages-value">0</div>
                    <div class="metric-trend" id="metric-messages-trend">+0%</div>
                </div>
                
                <div class="metric-card" id="metric-errors">
                    <div class="metric-header">
                        <h4>Errors</h4>
                        <span class="metric-icon">❌</span>
                    </div>
                    <div class="metric-value" id="metric-errors-value">0</div>
                    <div class="metric-trend" id="metric-errors-trend">+0%</div>
                </div>
            </div>
            
            <div class="charts-section">
                <div class="chart-container">
                    <h4>Agent Activity</h4>
                    <canvas id="agent-activity-chart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h4>Message Flow</h4>
                    <canvas id="message-flow-chart"></canvas>
                </div>
            </div>
        `;
        
        // Add styles
        this.injectStyles();
    }

    /**
     * Inject metrics-specific styles
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .metric-card {
                background: var(--bg-light);
                border: 1px solid var(--border-light);
                border-radius: 8px;
                padding: 16px;
                transition: all 0.3s ease;
            }
            
            .metric-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-2px);
            }
            
            .metric-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .metric-header h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .metric-icon {
                font-size: 20px;
            }
            
            .metric-value {
                font-size: 32px;
                font-weight: 700;
                color: var(--text-primary);
                margin-bottom: 4px;
            }
            
            .metric-trend {
                font-size: 12px;
                font-weight: 500;
            }
            
            .metric-trend.positive {
                color: var(--success);
            }
            
            .metric-trend.negative {
                color: var(--danger);
            }
            
            .metric-trend.neutral {
                color: var(--text-secondary);
            }
            
            .charts-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
            
            .chart-container {
                background: var(--bg-light);
                border: 1px solid var(--border-light);
                border-radius: 8px;
                padding: 16px;
            }
            
            .chart-container h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            @media (max-width: 768px) {
                .metrics-grid {
                    grid-template-columns: 1fr;
                }
                
                .charts-section {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Start periodic updates
     */
    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, this.config.updateInterval);
    }

    /**
     * Stop periodic updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Update metrics display
     */
    updateMetrics() {
        // Update agent count
        this.updateMetric('agents', this.getAgentCount());
        
        // Update connection count
        this.updateMetric('connections', this.getConnectionCount());
        
        // Update message rate
        this.updateMetric('messages', this.getMessageRate());
        
        // Update error count
        this.updateMetric('errors', this.getErrorCount());
        
        // Update charts
        this.updateCharts();
    }

    /**
     * Update individual metric
     */
    updateMetric(name, value) {
        const metric = this.metrics.get(name) || {
            value: 0,
            history: [],
            lastUpdate: Date.now()
        };
        
        const oldValue = metric.value;
        metric.value = value;
        metric.history.push({
            value: value,
            timestamp: Date.now()
        });
        
        // Keep history under limit
        if (metric.history.length > this.config.maxDataPoints) {
            metric.history.shift();
        }
        
        this.metrics.set(name, metric);
        
        // Update UI
        this.updateMetricUI(name, value, oldValue);
    }

    /**
     * Update metric UI
     */
    updateMetricUI(name, value, oldValue) {
        const valueElement = document.getElementById(`metric-${name}-value`);
        const trendElement = document.getElementById(`metric-${name}-trend`);
        
        if (valueElement) {
            valueElement.textContent = this.formatValue(value);
        }
        
        if (trendElement) {
            const change = value - oldValue;
            const percentChange = oldValue > 0 ? (change / oldValue) * 100 : 0;
            
            let trendText = '+0%';
            let trendClass = 'neutral';
            
            if (change > 0) {
                trendText = `+${percentChange.toFixed(1)}%`;
                trendClass = 'positive';
            } else if (change < 0) {
                trendText = `${percentChange.toFixed(1)}%`;
                trendClass = 'negative';
            }
            
            trendElement.textContent = trendText;
            trendElement.className = `metric-trend ${trendClass}`;
        }
    }

    /**
     * Update charts
     */
    updateCharts() {
        this.updateAgentActivityChart();
        this.updateMessageFlowChart();
    }

    /**
     * Update agent activity chart
     */
    updateAgentActivityChart() {
        const canvas = document.getElementById('agent-activity-chart');
        if (!canvas) return;
        
        const agentData = this.getAgentActivityData();
        
        if (!this.charts.has('agent-activity')) {
            // Create new chart
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: agentData.labels,
                    datasets: [{
                        label: 'Active Agents',
                        data: agentData.values,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            
            this.charts.set('agent-activity', chart);
        } else {
            // Update existing chart
            const chart = this.charts.get('agent-activity');
            chart.data.labels = agentData.labels;
            chart.data.datasets[0].data = agentData.values;
            chart.update('none');
        }
    }

    /**
     * Update message flow chart
     */
    updateMessageFlowChart() {
        const canvas = document.getElementById('message-flow-chart');
        if (!canvas) return;
        
        const messageData = this.getMessageFlowData();
        
        if (!this.charts.has('message-flow')) {
            // Create new chart
            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: messageData.labels,
                    datasets: [{
                        label: 'Messages',
                        data: messageData.values,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            
            this.charts.set('message-flow', chart);
        } else {
            // Update existing chart
            const chart = this.charts.get('message-flow');
            chart.data.labels = messageData.labels;
            chart.data.datasets[0].data = messageData.values;
            chart.update('none');
        }
    }

    /**
     * Get agent count
     */
    getAgentCount() {
        if (window.AgentCraftAcademy && window.AgentCraftAcademy.getModule('flow')) {
            const flowModule = window.AgentCraftAcademy.getModule('flow');
            return flowModule.agents ? flowModule.agents.size : 0;
        }
        return 0;
    }

    /**
     * Get connection count
     */
    getConnectionCount() {
        if (window.AgentCraftAcademy && window.AgentCraftAcademy.getModule('flow')) {
            const flowModule = window.AgentCraftAcademy.getModule('flow');
            return flowModule.connections ? flowModule.connections.size : 0;
        }
        return 0;
    }

    /**
     * Get message rate
     */
    getMessageRate() {
        // Simulate message rate
        return Math.floor(Math.random() * 10) + 1;
    }

    /**
     * Get error count
     */
    getErrorCount() {
        // Simulate error count
        return Math.floor(Math.random() * 3);
    }

    /**
     * Get agent activity data for chart
     */
    getAgentActivityData() {
        const agentMetric = this.metrics.get('agents');
        if (!agentMetric || agentMetric.history.length === 0) {
            return { labels: [], values: [] };
        }
        
        const labels = agentMetric.history.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        );
        const values = agentMetric.history.map(point => point.value);
        
        return { labels, values };
    }

    /**
     * Get message flow data for chart
     */
    getMessageFlowData() {
        const messageMetric = this.metrics.get('messages');
        if (!messageMetric || messageMetric.history.length === 0) {
            return { labels: [], values: [] };
        }
        
        const labels = messageMetric.history.map(point => 
            new Date(point.timestamp).toLocaleTimeString()
        );
        const values = messageMetric.history.map(point => point.value);
        
        return { labels, values };
    }

    /**
     * Set metric value
     */
    setMetric(name, value) {
        this.updateMetric(name, value);
    }

    /**
     * Get metric value
     */
    getMetric(name) {
        const metric = this.metrics.get(name);
        return metric ? metric.value : 0;
    }

    /**
     * Get metric history
     */
    getMetricHistory(name) {
        const metric = this.metrics.get(name);
        return metric ? metric.history : [];
    }

    /**
     * Update metrics from protocol data
     */
    updateMetrics(data) {
        if (data.agents) {
            this.setMetric('agents', data.agents.length);
        }
        
        if (data.connections) {
            this.setMetric('connections', data.connections.length);
        }
        
        if (data.messages) {
            this.setMetric('messages', data.messages);
        }
        
        if (data.errors) {
            this.setMetric('errors', data.errors);
        }
    }

    /**
     * Format value for display
     */
    formatValue(value) {
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value;
    }

    /**
     * Create custom chart
     */
    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type,
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });
        
        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * Update chart
     */
    updateChart(chartId, data) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.data = data;
            chart.update();
        }
    }

    /**
     * Destroy chart
     */
    destroyChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartId);
        }
    }

    /**
     * Export metrics data
     */
    export() {
        const exportData = {};
        
        this.metrics.forEach((metric, name) => {
            exportData[name] = {
                current: metric.value,
                history: metric.history
            };
        });
        
        return exportData;
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics.clear();
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        
        // Reset UI
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            const valueElement = card.querySelector('.metric-value');
            const trendElement = card.querySelector('.metric-trend');
            
            if (valueElement) valueElement.textContent = '0';
            if (trendElement) {
                trendElement.textContent = '+0%';
                trendElement.className = 'metric-trend neutral';
            }
        });
    }

    /**
     * Update display
     */
    update() {
        this.updateMetrics();
    }

    /**
     * Log message
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[MetricsRenderer]', ...args);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsRenderer;
} 