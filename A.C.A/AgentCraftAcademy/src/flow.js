/**
 * Flow Builder Module for AgentCraft Academy
 * Canvas-based flow diagram builder with drag & drop functionality
 */

class FlowDiagram {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.agents = new Map();
        this.connections = new Map();
        this.selectedAgent = null;
        this.connectionStart = null;
        this.isDragging = false;
        this.dragTarget = null;
        this.undoStack = [];
        this.redoStack = [];
        
        // Canvas state
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        
        // Configuration
        this.config = {
            nodeRadius: 60,
            nodePadding: 20,
            connectionWidth: 2,
            gridSize: 20,
            snapToGrid: true,
            debug: true
        };
        
        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Initialize the flow diagram
     */
    async initialize() {
        try {
            this.canvas = document.getElementById('flow-canvas');
            if (!this.canvas) {
                throw new Error('Flow canvas not found');
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.setupEventListeners();
            this.setupDragAndDrop();
            
            // Add some dummy agents for testing
            this.addDummyAgents();
            
            this.log('Flow diagram initialized');
            this.render();
            
        } catch (error) {
            this.log('Error initializing flow diagram:', error);
        }
    }

    /**
     * Setup canvas dimensions and context
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Set canvas style
        this.canvas.style.cursor = 'crosshair';
        
        this.log('Canvas setup complete:', this.canvas.width, 'x', this.canvas.height);
    }

    /**
     * Setup event listeners for canvas interactions
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Window resize
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Agent palette items
        const agentItems = document.querySelectorAll('.agent-item');
        agentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.agentType);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        // Canvas drop zone
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const agentType = e.dataTransfer.getData('text/plain');
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - this.offsetX;
            const y = e.clientY - rect.top - this.offsetY;
            
            this.createAgent(agentType, x, y);
        });
    }

    /**
     * Add dummy agents for testing
     */
    addDummyAgents() {
        this.createAgent('planner', 150, 150);
        this.createAgent('executor', 350, 150);
        this.createAgent('evaluator', 250, 300);
    }

    /**
     * Create a new agent
     */
    createAgent(type, x, y) {
        const agent = new AgentNode(type, x, y);
        this.agents.set(agent.id, agent);
        
        this.log('Created agent:', agent.name, 'at', x, y);
        this.render();
        
        // Emit event
        this.emit('agent-created', { agent, type, x, y });
        
        return agent;
    }

    /**
     * Remove an agent
     */
    removeAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        // Remove connections involving this agent
        this.connections.forEach((connection, connectionId) => {
            if (connection.sourceId === agentId || connection.targetId === agentId) {
                this.connections.delete(connectionId);
            }
        });
        
        this.agents.delete(agentId);
        
        if (this.selectedAgent === agentId) {
            this.selectedAgent = null;
        }
        
        this.log('Removed agent:', agent.name);
        this.render();
        
        // Emit event
        this.emit('agent-removed', { agentId, agent });
    }

    /**
     * Duplicate an agent
     */
    duplicateAgent(agentId) {
        const original = this.agents.get(agentId);
        if (!original) return;
        
        const newAgent = new AgentNode(
            original.type,
            original.x + 50,
            original.y + 50,
            original.name + '_copy'
        );
        
        this.agents.set(newAgent.id, newAgent);
        this.log('Duplicated agent:', original.name, '->', newAgent.name);
        this.render();
        
        return newAgent;
    }

    /**
     * Create a connection between two agents
     */
    createConnection(sourceId, targetId, type = 'data') {
        if (sourceId === targetId) {
            this.showToast('Cannot connect agent to itself', 'error');
            return null;
        }
        
        // Check if connection already exists
        const existingConnection = Array.from(this.connections.values()).find(
            conn => conn.sourceId === sourceId && conn.targetId === targetId
        );
        
        if (existingConnection) {
            this.showToast('Connection already exists', 'error');
            return null;
        }
        
        const connection = new AgentConnection(sourceId, targetId, type);
        this.connections.set(connection.id, connection);
        
        this.log('Created connection:', sourceId, '->', targetId);
        this.render();
        
        // Add to undo stack
        this.addToUndoStack({
            type: 'connection-created',
            connection: connection
        });
        
        // Emit event
        this.emit('connection-created', { connection, sourceId, targetId });
        
        return connection;
    }

    /**
     * Remove a connection
     */
    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;
        
        this.connections.delete(connectionId);
        this.log('Removed connection:', connectionId);
        this.render();
        
        // Add to undo stack
        this.addToUndoStack({
            type: 'connection-removed',
            connection: connection
        });
        
        // Emit event
        this.emit('connection-removed', { connectionId, connection });
    }

    /**
     * Select an agent
     */
    selectAgent(agentId) {
        if (this.selectedAgent === agentId) return;
        
        this.selectedAgent = agentId;
        this.log('Selected agent:', agentId);
        this.render();
        
        // Update agent info panel
        this.updateAgentInfoPanel(agentId);
        
        // Emit event
        this.emit('agent-selected', { agentId });
    }

    /**
     * Deselect current agent
     */
    deselectAgent() {
        this.selectedAgent = null;
        this.connectionStart = null;
        this.render();
        
        // Hide agent info panel
        this.hideAgentInfoPanel();
        
        // Emit event
        this.emit('agent-deselected');
    }

    /**
     * Update agent properties
     */
    updateAgentProperty(agentId, property, value) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        agent[property] = value;
        this.log('Updated agent property:', agentId, property, value);
        this.render();
        
        // Emit event
        this.emit('agent-updated', { agentId, property, value, agent });
    }

    /**
     * Validate the flow
     */
    validateFlow() {
        const errors = [];
        const warnings = [];
        
        // Check if all agents are connected
        const connectedAgents = new Set();
        this.connections.forEach(connection => {
            connectedAgents.add(connection.sourceId);
            connectedAgents.add(connection.targetId);
        });
        
        this.agents.forEach(agent => {
            if (!connectedAgents.has(agent.id)) {
                warnings.push(`Agent "${agent.name}" is not connected`);
            }
        });
        
        // Check for circular loops (basic detection)
        const hasCircularLoop = this.detectCircularLoops();
        if (hasCircularLoop) {
            errors.push('Circular loop detected in flow');
        }
        
        // Check minimum setup
        const plannerCount = Array.from(this.agents.values()).filter(a => a.type === 'planner').length;
        const executorCount = Array.from(this.agents.values()).filter(a => a.type === 'executor').length;
        
        if (plannerCount === 0) {
            errors.push('Missing Planner agent');
        }
        if (executorCount === 0) {
            errors.push('Missing Executor agent');
        }
        
        // Update validation result
        this.updateValidationResult(errors, warnings);
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Detect circular loops in the flow
     */
    detectCircularLoops() {
        const visited = new Set();
        const recursionStack = new Set();
        
        const hasCycle = (agentId) => {
            if (recursionStack.has(agentId)) return true;
            if (visited.has(agentId)) return false;
            
            visited.add(agentId);
            recursionStack.add(agentId);
            
            // Check all connections from this agent
            this.connections.forEach(connection => {
                if (connection.sourceId === agentId) {
                    if (hasCycle(connection.targetId)) return true;
                }
            });
            
            recursionStack.delete(agentId);
            return false;
        };
        
        // Check each agent
        for (const agentId of this.agents.keys()) {
            if (hasCycle(agentId)) return true;
        }
        
        return false;
    }

    /**
     * Update validation result in UI
     */
    updateValidationResult(errors, warnings) {
        const validationResult = document.getElementById('validation-result');
        if (!validationResult) return;
        
        const icon = validationResult.querySelector('.validation-icon');
        const text = validationResult.querySelector('.validation-text');
        
        if (errors.length > 0) {
            icon.textContent = '❌';
            text.textContent = errors[0];
            validationResult.className = 'validation-result error';
        } else if (warnings.length > 0) {
            icon.textContent = '⚠️';
            text.textContent = warnings[0];
            validationResult.className = 'validation-result warning';
        } else {
            icon.textContent = '✅';
            text.textContent = 'Valid flow';
            validationResult.className = 'validation-result success';
        }
    }

    /**
     * Update agent info panel
     */
    updateAgentInfoPanel(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        const agentInfo = document.getElementById('agent-info');
        if (!agentInfo) return;
        
        // Show the panel
        agentInfo.classList.remove('hidden');
        
        // Update form fields
        document.getElementById('agent-name').value = agent.name;
        document.getElementById('agent-type').value = agent.type;
        document.getElementById('agent-status').value = agent.status;
        
        // Update capabilities
        this.updateCapabilitiesList(agent.capabilities);
        
        // Setup form event listeners
        this.setupAgentFormListeners(agentId);
    }

    /**
     * Hide agent info panel
     */
    hideAgentInfoPanel() {
        const agentInfo = document.getElementById('agent-info');
        if (agentInfo) {
            agentInfo.classList.add('hidden');
        }
    }

    /**
     * Update capabilities list
     */
    updateCapabilitiesList(capabilities) {
        const capabilitiesList = document.getElementById('capabilities-list');
        if (!capabilitiesList) return;
        
        capabilitiesList.innerHTML = '';
        
        capabilities.forEach(capability => {
            const item = document.createElement('div');
            item.className = 'capability-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.disabled = true;
            
            const label = document.createElement('label');
            label.textContent = capability;
            
            item.appendChild(checkbox);
            item.appendChild(label);
            capabilitiesList.appendChild(item);
        });
    }

    /**
     * Setup agent form event listeners
     */
    setupAgentFormListeners(agentId) {
        // Remove existing listeners
        const form = document.getElementById('agent-config-form');
        if (!form) return;
        
        // Name field
        const nameField = document.getElementById('agent-name');
        nameField.addEventListener('input', (e) => {
            this.updateAgentProperty(agentId, 'name', e.target.value);
        });
        
        // Status field
        const statusField = document.getElementById('agent-status');
        statusField.addEventListener('change', (e) => {
            this.updateAgentProperty(agentId, 'status', e.target.value);
        });
        
        // Remove button
        const removeButton = document.getElementById('remove-agent');
        removeButton.onclick = () => {
            this.removeAgent(agentId);
            this.deselectAgent();
        };
        
        // Duplicate button
        const duplicateButton = document.getElementById('duplicate-agent');
        duplicateButton.onclick = () => {
            this.duplicateAgent(agentId);
        };
    }

    /**
     * Render the flow diagram
     */
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw grid
        this.drawGrid();
        
        // Draw connections
        this.connections.forEach(connection => {
            connection.draw(this.ctx, this.agents);
        });
        
        // Draw agents
        this.agents.forEach(agent => {
            agent.draw(this.ctx, agent.id === this.selectedAgent);
        });
        
        // Draw connection preview
        if (this.connectionStart) {
            this.drawConnectionPreview();
        }
        
        this.ctx.restore();
    }

    /**
     * Draw grid background
     */
    drawGrid() {
        const gridSize = this.config.gridSize;
        const width = this.canvas.width / this.scale;
        const height = this.canvas.height / this.scale;
        
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Draw connection preview
     */
    drawConnectionPreview() {
        if (!this.connectionStart) return;
        
        const mousePos = this.getMousePosition();
        if (!mousePos) return;
        
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = this.config.connectionWidth;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.connectionStart.x, this.connectionStart.y);
        this.ctx.lineTo(mousePos.x, mousePos.y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }

    /**
     * Handle mouse down events
     */
    handleMouseDown(e) {
        const pos = this.getMousePosition(e);
        if (!pos) return;
        
        // Check if clicking on an agent
        const clickedAgent = this.getAgentAtPosition(pos.x, pos.y);
        
        if (clickedAgent) {
            if (e.button === 0) { // Left click
                this.selectAgent(clickedAgent.id);
                
                if (this.connectionStart) {
                    // Complete connection
                    this.createConnection(this.connectionStart.agentId, clickedAgent.id);
                    this.connectionStart = null;
                } else {
                    // Start dragging
                    this.isDragging = true;
                    this.dragTarget = clickedAgent;
                }
            }
        } else {
            // Clicked on empty space
            if (e.button === 0) {
                this.deselectAgent();
                
                if (this.connectionStart) {
                    this.connectionStart = null;
                } else {
                    // Start panning
                    this.isPanning = true;
                    this.lastPanPoint = pos;
                }
            }
        }
        
        this.render();
    }

    /**
     * Handle mouse move events
     */
    handleMouseMove(e) {
        const pos = this.getMousePosition(e);
        if (!pos) return;
        
        if (this.isDragging && this.dragTarget) {
            // Update agent position
            this.dragTarget.x = pos.x;
            this.dragTarget.y = pos.y;
            this.render();
        } else if (this.isPanning) {
            // Update pan offset
            this.offsetX += pos.x - this.lastPanPoint.x;
            this.offsetY += pos.y - this.lastPanPoint.y;
            this.lastPanPoint = pos;
            this.render();
        }
    }

    /**
     * Handle mouse up events
     */
    handleMouseUp(e) {
        this.isDragging = false;
        this.isPanning = false;
        this.dragTarget = null;
    }

    /**
     * Handle wheel events for zooming
     */
    handleWheel(e) {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));
        
        // Zoom towards mouse position
        const mousePos = this.getMousePosition(e);
        if (mousePos) {
            this.offsetX = mousePos.x - (mousePos.x - this.offsetX) * (newScale / this.scale);
            this.offsetY = mousePos.y - (mousePos.y - this.offsetY) * (newScale / this.scale);
        }
        
        this.scale = newScale;
        this.render();
    }

    /**
     * Handle touch events (mobile support)
     */
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0
            });
            this.handleMouseDown(mouseEvent);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(mouseEvent);
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        this.handleMouseUp(mouseEvent);
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                if (this.selectedAgent) {
                    this.removeAgent(this.selectedAgent);
                    this.deselectAgent();
                }
                break;
            case 'Escape':
                this.deselectAgent();
                this.connectionStart = null;
                this.render();
                break;
        }
    }

    /**
     * Get mouse position relative to canvas
     */
    getMousePosition(e) {
        if (!this.canvas) return null;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / this.scale;
        const y = (e.clientY - rect.top - this.offsetY) / this.scale;
        
        return { x, y };
    }

    /**
     * Get agent at position
     */
    getAgentAtPosition(x, y) {
        for (const agent of this.agents.values()) {
            const distance = Math.sqrt(
                Math.pow(x - agent.x, 2) + Math.pow(y - agent.y, 2)
            );
            if (distance <= this.config.nodeRadius) {
                return agent;
            }
        }
        return null;
    }

    /**
     * Resize canvas
     */
    resize() {
        this.setupCanvas();
        this.render();
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.undoStack.length === 0) return;
        
        const action = this.undoStack.pop();
        this.redoStack.push(action);
        
        switch (action.type) {
            case 'connection-created':
                this.connections.delete(action.connection.id);
                break;
            case 'connection-removed':
                this.connections.set(action.connection.id, action.connection);
                break;
        }
        
        this.render();
        this.log('Undo:', action.type);
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.redoStack.length === 0) return;
        
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        
        switch (action.type) {
            case 'connection-created':
                this.connections.set(action.connection.id, action.connection);
                break;
            case 'connection-removed':
                this.connections.delete(action.connection.id);
                break;
        }
        
        this.render();
        this.log('Redo:', action.type);
    }

    /**
     * Add action to undo stack
     */
    addToUndoStack(action) {
        this.undoStack.push(action);
        this.redoStack = []; // Clear redo stack when new action is performed
    }

    /**
     * Export flow data
     */
    export() {
        return {
            agents: Array.from(this.agents.values()).map(agent => agent.toJSON()),
            connections: Array.from(this.connections.values()).map(conn => conn.toJSON()),
            version: '1.0'
        };
    }

    /**
     * Import flow data
     */
    import(data) {
        this.agents.clear();
        this.connections.clear();
        
        data.agents.forEach(agentData => {
            const agent = AgentNode.fromJSON(agentData);
            this.agents.set(agent.id, agent);
        });
        
        data.connections.forEach(connData => {
            const connection = AgentConnection.fromJSON(connData);
            this.connections.set(connection.id, connection);
        });
        
        this.render();
        this.log('Flow imported:', data.agents.length, 'agents,', data.connections.length, 'connections');
    }

    /**
     * Update agent status from protocol
     */
    updateAgentStatus(agents) {
        agents.forEach(agentData => {
            const agent = this.agents.get(agentData.id);
            if (agent) {
                agent.status = agentData.status;
            }
        });
        this.render();
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        if (window.AgentCraftAcademy) {
            window.AgentCraftAcademy.showToast(message, type);
        }
    }

    /**
     * Event handling
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    this.log('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Log message
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[FlowDiagram]', ...args);
        }
    }
}

/**
 * Agent Node Class
 */
class AgentNode {
    constructor(type, x, y, name = null) {
        this.id = this.generateId();
        this.type = type;
        this.x = x;
        this.y = y;
        this.name = name || this.generateName(type);
        this.status = 'idle';
        this.capabilities = this.getDefaultCapabilities(type);
        this.createdAt = Date.now();
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'agent-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate default name
     */
    generateName(type) {
        const typeNames = {
            planner: 'PlannerAgent',
            executor: 'ExecutorAgent',
            evaluator: 'EvaluatorAgent'
        };
        return typeNames[type] || 'UnknownAgent';
    }

    /**
     * Get default capabilities for agent type
     */
    getDefaultCapabilities(type) {
        const capabilities = {
            planner: ['planning', 'reasoning', 'strategy'],
            executor: ['execution', 'action', 'implementation'],
            evaluator: ['evaluation', 'feedback', 'assessment']
        };
        return capabilities[type] || ['basic'];
    }

    /**
     * Draw the agent node
     */
    draw(ctx, isSelected = false) {
        const radius = 60;
        
        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw background
        ctx.fillStyle = this.getStatusColor();
        ctx.beginPath();
        ctx.roundRect(this.x - radius, this.y - radius, radius * 2, radius * 2, 12);
        ctx.fill();
        
        // Draw border if selected
        if (isSelected) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getIcon(), this.x, this.y - 10);
        
        // Draw name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(this.name, this.x, this.y + 15);
        
        // Draw status indicator
        ctx.fillStyle = this.getStatusIndicatorColor();
        ctx.beginPath();
        ctx.arc(this.x + radius - 10, this.y - radius + 10, 6, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Get status color
     */
    getStatusColor() {
        const colors = {
            active: '#10b981',
            idle: '#6b7280',
            error: '#ef4444'
        };
        return colors[this.status] || colors.idle;
    }

    /**
     * Get status indicator color
     */
    getStatusIndicatorColor() {
        const colors = {
            active: '#ffffff',
            idle: '#d1d5db',
            error: '#ffffff'
        };
        return colors[this.status] || colors.idle;
    }

    /**
     * Get agent icon
     */
    getIcon() {
        const icons = {
            planner: '🧠',
            executor: '⚡',
            evaluator: '🔍'
        };
        return icons[this.type] || '🤖';
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            name: this.name,
            status: this.status,
            capabilities: this.capabilities,
            createdAt: this.createdAt
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(data) {
        const agent = new AgentNode(data.type, data.x, data.y, data.name);
        agent.id = data.id;
        agent.status = data.status;
        agent.capabilities = data.capabilities;
        agent.createdAt = data.createdAt;
        return agent;
    }
}

/**
 * Agent Connection Class
 */
class AgentConnection {
    constructor(sourceId, targetId, type = 'data') {
        this.id = this.generateId();
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.type = type;
        this.createdAt = Date.now();
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'conn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Draw the connection
     */
    draw(ctx, agents) {
        const source = agents.get(this.sourceId);
        const target = agents.get(this.targetId);
        
        if (!source || !target) return;
        
        // Calculate connection points
        const start = this.getConnectionPoint(source, target);
        const end = this.getConnectionPoint(target, source);
        
        // Draw line
        ctx.strokeStyle = this.getConnectionColor();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        
        // Draw arrow
        this.drawArrow(ctx, start, end);
    }

    /**
     * Get connection point on agent
     */
    getConnectionPoint(agent, targetAgent) {
        const radius = 60;
        const dx = targetAgent.x - agent.x;
        const dy = targetAgent.y - agent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return { x: agent.x, y: agent.y };
        
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        return {
            x: agent.x + unitX * radius,
            y: agent.y + unitY * radius
        };
    }

    /**
     * Draw arrow head
     */
    drawArrow(ctx, start, end) {
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.fillStyle = this.getConnectionColor();
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
            end.x - arrowLength * Math.cos(angle - arrowAngle),
            end.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.lineTo(
            end.x - arrowLength * Math.cos(angle + arrowAngle),
            end.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Get connection color
     */
    getConnectionColor() {
        const colors = {
            data: '#3b82f6',
            control: '#ef4444'
        };
        return colors[this.type] || colors.data;
    }

    /**
     * Check if point is on connection
     */
    isClicked(x, y, agents) {
        const source = agents.get(this.sourceId);
        const target = agents.get(this.targetId);
        
        if (!source || !target) return false;
        
        const start = this.getConnectionPoint(source, target);
        const end = this.getConnectionPoint(target, source);
        
        // Calculate distance from point to line
        const A = x - start.x;
        const B = y - start.y;
        const C = end.x - start.x;
        const D = end.y - start.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = start.x;
            yy = start.y;
        } else if (param > 1) {
            xx = end.x;
            yy = end.y;
        } else {
            xx = start.x + param * C;
            yy = start.y + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= 5; // Click tolerance
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            sourceId: this.sourceId,
            targetId: this.targetId,
            type: this.type,
            createdAt: this.createdAt
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(data) {
        const connection = new AgentConnection(data.sourceId, data.targetId, data.type);
        connection.id = data.id;
        connection.createdAt = data.createdAt;
        return connection;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FlowDiagram, AgentNode, AgentConnection };
} 