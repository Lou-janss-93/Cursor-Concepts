/**
 * Network Visualizer for AgentCraft Academy
 * SVG-based network visualization with interactive nodes and connections
 */

class NetworkVisualizer {
    constructor() {
        this.container = null;
        this.svg = null;
        this.networkData = null;
        this.nodes = [];
        this.links = [];
        this.selectedNode = null;
        this.isDragging = false;
        this.dragTarget = null;
        
        // Configuration
        this.config = {
            nodeRadius: 20,
            linkColor: '#a1a1aa',
            nodeColor: '#3b82f6',
            highlightColor: '#f59e0b',
            width: 400,
            height: 300,
            debug: true
        };
        
        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Initialize the network visualizer
     */
    async initialize() {
        try {
            this.container = document.getElementById('network-viz');
            if (!this.container) {
                throw new Error('Network visualization container not found');
            }
            
            this.setupSVG();
            this.setupEventListeners();
            
            this.log('Network visualizer initialized');
            
        } catch (error) {
            this.log('Error initializing network visualizer:', error);
        }
    }

    /**
     * Setup SVG element
     */
    setupSVG() {
        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `0 0 ${this.config.width} ${this.config.height}`);
        this.svg.style.cursor = 'crosshair';
        
        // Add SVG to container
        this.container.appendChild(this.svg);
        
        // Add styles
        this.injectStyles();
    }

    /**
     * Inject network-specific styles
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .network-node {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .network-node:hover {
                stroke-width: 3;
                stroke: var(--accent);
            }
            
            .network-node.selected {
                stroke: var(--primary);
                stroke-width: 3;
            }
            
            .network-link {
                stroke: var(--border-light);
                stroke-width: 2;
                transition: all 0.3s ease;
            }
            
            .network-link:hover {
                stroke: var(--primary);
                stroke-width: 3;
            }
            
            .network-label {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                font-weight: 500;
                text-anchor: middle;
                pointer-events: none;
                fill: var(--text-primary);
            }
            
            .network-tooltip {
                position: absolute;
                background: var(--bg-dark);
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--border-dark);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .network-tooltip.show {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.svg.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.svg.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.svg.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.svg.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.svg.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Window resize
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Update network data
     */
    update(networkData) {
        this.networkData = networkData;
        this.processData();
        this.render();
    }

    /**
     * Process network data
     */
    processData() {
        if (!this.networkData) return;
        
        this.nodes = this.networkData.nodes || [];
        this.links = this.networkData.links || [];
        
        // Add default positions if not provided
        this.nodes.forEach((node, index) => {
            if (!node.x || !node.y) {
                node.x = 50 + (index % 4) * 80;
                node.y = 50 + Math.floor(index / 4) * 80;
            }
        });
        
        this.log('Processed network data:', this.nodes.length, 'nodes,', this.links.length, 'links');
    }

    /**
     * Render the network visualization
     */
    render() {
        if (!this.svg) return;
        
        // Clear SVG
        this.svg.innerHTML = '';
        
        // Render links first (so they appear behind nodes)
        this.renderLinks();
        
        // Render nodes
        this.renderNodes();
        
        // Add tooltip container
        this.addTooltip();
    }

    /**
     * Render network links
     */
    renderLinks() {
        this.links.forEach(link => {
            const sourceNode = this.nodes.find(n => n.id === link.source);
            const targetNode = this.nodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode) return;
            
            const linkElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            linkElement.setAttribute('x1', sourceNode.x);
            linkElement.setAttribute('y1', sourceNode.y);
            linkElement.setAttribute('x2', targetNode.x);
            linkElement.setAttribute('y2', targetNode.y);
            linkElement.setAttribute('class', 'network-link');
            linkElement.setAttribute('data-link-id', link.id || `${link.source}-${link.target}`);
            
            // Add link type styling
            if (link.type) {
                linkElement.setAttribute('data-link-type', link.type);
                if (link.type === 'control') {
                    linkElement.setAttribute('stroke-dasharray', '5,5');
                }
            }
            
            // Add event listeners
            linkElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectLink(link);
            });
            
            linkElement.addEventListener('mouseenter', (e) => {
                this.showLinkTooltip(e, link);
            });
            
            linkElement.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            this.svg.appendChild(linkElement);
        });
    }

    /**
     * Render network nodes
     */
    renderNodes() {
        this.nodes.forEach(node => {
            // Create node group
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'network-node');
            group.setAttribute('data-node-id', node.id);
            
            // Create node circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', this.config.nodeRadius);
            circle.setAttribute('fill', this.getNodeColor(node));
            circle.setAttribute('stroke', this.getNodeBorderColor(node));
            circle.setAttribute('stroke-width', node.id === this.selectedNode ? '3' : '2');
            
            // Create node label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', node.x);
            label.setAttribute('y', node.y + this.config.nodeRadius + 15);
            label.setAttribute('class', 'network-label');
            label.textContent = node.name || node.id;
            
            // Add to group
            group.appendChild(circle);
            group.appendChild(label);
            
            // Add event listeners
            group.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectNode(node.id);
            });
            
            group.addEventListener('mouseenter', (e) => {
                this.showNodeTooltip(e, node);
            });
            
            group.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            group.addEventListener('mousedown', (e) => {
                this.startNodeDrag(e, node);
            });
            
            this.svg.appendChild(group);
        });
    }

    /**
     * Add tooltip container
     */
    addTooltip() {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.network-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create new tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'network-tooltip';
        tooltip.id = 'network-tooltip';
        document.body.appendChild(tooltip);
    }

    /**
     * Get node color based on type and status
     */
    getNodeColor(node) {
        const colors = {
            planner: '#3b82f6',
            executor: '#10b981',
            evaluator: '#f59e0b',
            default: '#6b7280'
        };
        
        return colors[node.type] || colors.default;
    }

    /**
     * Get node border color
     */
    getNodeBorderColor(node) {
        if (node.id === this.selectedNode) {
            return this.config.highlightColor;
        }
        
        const colors = {
            active: '#10b981',
            idle: '#6b7280',
            error: '#ef4444'
        };
        
        return colors[node.status] || colors.idle;
    }

    /**
     * Select a node
     */
    selectNode(nodeId) {
        this.selectedNode = nodeId;
        this.render();
        
        // Emit event
        this.emit('node-selected', { nodeId });
        
        this.log('Selected node:', nodeId);
    }

    /**
     * Select a link
     */
    selectLink(link) {
        // Emit event
        this.emit('link-selected', { link });
        
        this.log('Selected link:', link);
    }

    /**
     * Highlight a node
     */
    highlightNode(nodeId) {
        const nodeElement = this.svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.classList.add('highlighted');
        }
    }

    /**
     * Unhighlight a node
     */
    unhighlightNode(nodeId) {
        const nodeElement = this.svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.classList.remove('highlighted');
        }
    }

    /**
     * Show node tooltip
     */
    showNodeTooltip(event, node) {
        const tooltip = document.getElementById('network-tooltip');
        if (!tooltip) return;
        
        const content = `
            <strong>${node.name || node.id}</strong><br>
            Type: ${node.type || 'Unknown'}<br>
            Status: ${node.status || 'Unknown'}<br>
            ${node.capabilities ? `Capabilities: ${node.capabilities.join(', ')}` : ''}
        `;
        
        tooltip.innerHTML = content;
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 10 + 'px';
        tooltip.classList.add('show');
    }

    /**
     * Show link tooltip
     */
    showLinkTooltip(event, link) {
        const tooltip = document.getElementById('network-tooltip');
        if (!tooltip) return;
        
        const content = `
            <strong>Connection</strong><br>
            From: ${link.source}<br>
            To: ${link.target}<br>
            Type: ${link.type || 'data'}
        `;
        
        tooltip.innerHTML = content;
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 10 + 'px';
        tooltip.classList.add('show');
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('network-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    /**
     * Start node dragging
     */
    startNodeDrag(event, node) {
        this.isDragging = true;
        this.dragTarget = node;
        
        // Prevent text selection
        event.preventDefault();
    }

    /**
     * Handle mouse down events
     */
    handleMouseDown(event) {
        // Handle node dragging
        if (this.isDragging && this.dragTarget) {
            const point = this.getMousePosition(event);
            if (point) {
                this.dragTarget.x = point.x;
                this.dragTarget.y = point.y;
                this.render();
            }
        }
    }

    /**
     * Handle mouse move events
     */
    handleMouseMove(event) {
        if (this.isDragging && this.dragTarget) {
            const point = this.getMousePosition(event);
            if (point) {
                this.dragTarget.x = point.x;
                this.dragTarget.y = point.y;
                this.render();
            }
        }
    }

    /**
     * Handle mouse up events
     */
    handleMouseUp(event) {
        this.isDragging = false;
        this.dragTarget = null;
    }

    /**
     * Handle touch events
     */
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseDown(mouseEvent);
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.handleMouseMove(mouseEvent);
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        this.handleMouseUp(mouseEvent);
    }

    /**
     * Get mouse position relative to SVG
     */
    getMousePosition(event) {
        if (!this.svg) return null;
        
        const rect = this.svg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        return { x, y };
    }

    /**
     * Resize visualization
     */
    resize() {
        if (!this.container || !this.svg) return;
        
        const rect = this.container.getBoundingClientRect();
        this.config.width = rect.width;
        this.config.height = rect.height;
        
        this.svg.setAttribute('viewBox', `0 0 ${this.config.width} ${this.config.height}`);
        this.render();
    }

    /**
     * Clear visualization
     */
    clear() {
        if (this.svg) {
            this.svg.innerHTML = '';
        }
        
        this.nodes = [];
        this.links = [];
        this.selectedNode = null;
        this.networkData = null;
    }

    /**
     * Export network data
     */
    export() {
        return {
            nodes: this.nodes,
            links: this.links,
            config: this.config
        };
    }

    /**
     * Import network data
     */
    import(data) {
        this.networkData = data;
        this.processData();
        this.render();
    }

    /**
     * Update node position
     */
    updateNodePosition(nodeId, x, y) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            node.x = x;
            node.y = y;
            this.render();
        }
    }

    /**
     * Add node
     */
    addNode(node) {
        this.nodes.push(node);
        this.render();
        
        // Emit event
        this.emit('node-added', { node });
    }

    /**
     * Remove node
     */
    removeNode(nodeId) {
        const index = this.nodes.findIndex(n => n.id === nodeId);
        if (index !== -1) {
            const node = this.nodes.splice(index, 1)[0];
            
            // Remove related links
            this.links = this.links.filter(link => 
                link.source !== nodeId && link.target !== nodeId
            );
            
            this.render();
            
            // Emit event
            this.emit('node-removed', { nodeId, node });
        }
    }

    /**
     * Add link
     */
    addLink(link) {
        this.links.push(link);
        this.render();
        
        // Emit event
        this.emit('link-added', { link });
    }

    /**
     * Remove link
     */
    removeLink(linkId) {
        const index = this.links.findIndex(l => l.id === linkId);
        if (index !== -1) {
            const link = this.links.splice(index, 1)[0];
            this.render();
            
            // Emit event
            this.emit('link-removed', { linkId, link });
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
            console.log('[NetworkVisualizer]', ...args);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkVisualizer;
}