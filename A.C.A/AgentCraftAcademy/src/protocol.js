/**
 * Protocol Client for AgentCraft Academy
 * Simulates WebSocket connection to GENAIOS protocol
 */

class ProtocolClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        this.heartbeatInterval = null;
        this.statusUpdateInterval = null;
        this.messageQueue = [];
        
        // Connection status elements
        this.connectionIndicator = null;
        this.connectionText = null;
        
        // Configuration
        this.config = {
            url: 'ws://localhost:8080',
            heartbeatInterval: 10000, // 10 seconds
            statusUpdateInterval: 5000, // 5 seconds
            debug: true
        };
    }

    /**
     * Initialize the protocol client
     */
    async initialize() {
        this.connectionIndicator = document.getElementById('connection-indicator');
        this.connectionText = document.getElementById('connection-text');
        
        this.log('Protocol client initialized');
    }

    /**
     * Connect to WebSocket server
     */
    async connect() {
        try {
            this.log('Attempting to connect to:', this.config.url);
            
            // Simulate connection attempt
            this.updateConnectionStatus('connecting');
            
            // Simulate connection delay
            await this.delay(1000);
            
            // Simulate successful connection
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('connected');
            
            this.log('Connected to WebSocket server');
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Start status updates
            this.startStatusUpdates();
            
            // Process queued messages
            this.processMessageQueue();
            
        } catch (error) {
            this.log('Connection failed:', error);
            this.updateConnectionStatus('disconnected');
            this.attemptReconnect();
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        this.log('Disconnecting from WebSocket server');
        
        this.isConnected = false;
        this.updateConnectionStatus('disconnected');
        
        // Clear intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.statusUpdateInterval) {
            clearInterval(this.statusUpdateInterval);
            this.statusUpdateInterval = null;
        }
        
        this.log('Disconnected from WebSocket server');
    }

    /**
     * Send message to server
     */
    send(message) {
        if (this.isConnected) {
            this.log('Sending message:', message);
            // In real implementation, this would send via WebSocket
            return true;
        } else {
            this.log('Not connected, queuing message:', message);
            this.messageQueue.push(message);
            return false;
        }
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.log('Processing queued message:', message);
            // In real implementation, this would send via WebSocket
        }
    }

    /**
     * Start heartbeat
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping', timestamp: Date.now() });
                this.log('Heartbeat sent');
            }
        }, this.config.heartbeatInterval);
    }

    /**
     * Start status updates simulation
     */
    startStatusUpdates() {
        this.statusUpdateInterval = setInterval(() => {
            if (this.isConnected) {
                this.simulateStatusUpdate();
            }
        }, this.config.statusUpdateInterval);
    }

    /**
     * Simulate receiving agent status updates
     */
    simulateStatusUpdate() {
        const statusUpdate = {
            type: 'agent_status_update',
            timestamp: Date.now(),
            agents: [
                {
                    id: 'agent-1',
                    name: 'PlannerAgent',
                    type: 'planner',
                    status: this.getRandomStatus(),
                    capabilities: ['planning', 'reasoning'],
                    position: { x: 100, y: 100 }
                },
                {
                    id: 'agent-2',
                    name: 'ExecutorAgent',
                    type: 'executor',
                    status: this.getRandomStatus(),
                    capabilities: ['execution', 'action'],
                    position: { x: 300, y: 100 }
                },
                {
                    id: 'agent-3',
                    name: 'EvaluatorAgent',
                    type: 'evaluator',
                    status: this.getRandomStatus(),
                    capabilities: ['evaluation', 'feedback'],
                    position: { x: 200, y: 200 }
                }
            ]
        };
        
        this.log('Simulated status update received:', statusUpdate);
        this.handleMessage(statusUpdate);
    }

    /**
     * Get random agent status
     */
    getRandomStatus() {
        const statuses = ['active', 'idle', 'error'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    /**
     * Handle incoming messages
     */
    handleMessage(message) {
        this.log('Received message:', message);
        
        // Emit custom event for other modules to listen to
        const event = new CustomEvent('protocol-message', {
            detail: message
        });
        document.dispatchEvent(event);
        
        // Handle specific message types
        switch (message.type) {
            case 'agent_status_update':
                this.handleAgentStatusUpdate(message);
                break;
            case 'pong':
                this.log('Heartbeat response received');
                break;
            default:
                this.log('Unknown message type:', message.type);
        }
    }

    /**
     * Handle agent status updates
     */
    handleAgentStatusUpdate(message) {
        // Update flow diagram if available
        if (window.AgentCraftAcademy && window.AgentCraftAcademy.getModule('flow')) {
            const flowModule = window.AgentCraftAcademy.getModule('flow');
            if (flowModule && flowModule.updateAgentStatus) {
                flowModule.updateAgentStatus(message.agents);
            }
        }
        
        // Update metrics if available
        if (window.AgentCraftAcademy && window.AgentCraftAcademy.getModule('metrics')) {
            const metricsModule = window.AgentCraftAcademy.getModule('metrics');
            if (metricsModule && metricsModule.updateMetrics) {
                metricsModule.updateMetrics(message);
            }
        }
    }

    /**
     * Update connection status UI
     */
    updateConnectionStatus(status) {
        if (!this.connectionIndicator || !this.connectionText) return;
        
        this.connectionIndicator.className = `status-dot ${status}`;
        
        switch (status) {
            case 'connected':
                this.connectionText.textContent = 'Connected';
                break;
            case 'connecting':
                this.connectionText.textContent = 'Connecting...';
                break;
            case 'disconnected':
                this.connectionText.textContent = 'Disconnected';
                break;
            default:
                this.connectionText.textContent = 'Unknown';
        }
    }

    /**
     * Attempt to reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log('Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        this.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    /**
     * Send agent message
     */
    sendAgentMessage(agentId, message) {
        const payload = {
            type: 'agent_message',
            agentId: agentId,
            message: message,
            timestamp: Date.now()
        };
        
        return this.send(payload);
    }

    /**
     * Get metrics from server
     */
    getMetrics() {
        const payload = {
            type: 'get_metrics',
            timestamp: Date.now()
        };
        
        return this.send(payload);
    }

    /**
     * Get network data
     */
    getNetworkData() {
        const payload = {
            type: 'get_network_data',
            timestamp: Date.now()
        };
        
        return this.send(payload);
    }

    /**
     * Run test
     */
    runTest(testName) {
        const payload = {
            type: 'run_test',
            testName: testName,
            timestamp: Date.now()
        };
        
        return this.send(payload);
    }

    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Log message
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[ProtocolClient]', ...args);
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            url: this.config.url
        };
    }

    /**
     * Get message queue length
     */
    getQueueLength() {
        return this.messageQueue.length;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProtocolClient;
} 