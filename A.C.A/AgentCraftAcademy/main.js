/**
 * AgentCraft Academy - Main Application
 * Core logic for the AgentCraft Academy interface
 */

class AgentCraftAcademy {
    constructor() {
        this.currentModule = 'flow';
        this.theme = 'light';
        this.modules = {};
        this.isInitialized = false;
        
        // DOM elements
        this.elements = {
            app: null,
            workspace: null,
            sidebar: null,
            statusPanel: null,
            themeToggle: null,
            navItems: null,
            welcomeMessage: null,
            flowContainer: null,
            terminalContainer: null,
            metricsContainer: null
        };
        
        // Configuration
        this.config = {
            debug: true,
            autoConnect: true,
            refreshInterval: 5000,
            version: '1.0'
        };
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            this.log('Initializing AgentCraft Academy...');
            
            // Initialize DOM elements
            this.initializeElements();
            
            // Load theme from localStorage
            this.loadTheme();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize modules
            await this.initializeModules();
            
            // Show welcome message
            this.showModule('flow');
            
            this.isInitialized = true;
            this.log('AgentCraft Academy initialized successfully');
            
            // Log to console as requested
            console.log('AgentCraft v1.0 loaded');
            
        } catch (error) {
            this.log('Error initializing application:', error);
            this.showToast('Error initializing application', 'error');
        }
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.elements.app = document.getElementById('app');
        this.elements.workspace = document.querySelector('.workspace');
        this.elements.sidebar = document.querySelector('.sidebar');
        this.elements.statusPanel = document.querySelector('.status-panel');
        this.elements.themeToggle = document.getElementById('theme-toggle');
        this.elements.navItems = document.querySelectorAll('.nav-item');
        this.elements.welcomeMessage = document.getElementById('welcome-message');
        this.elements.flowContainer = document.getElementById('flow-canvas-container');
        this.elements.terminalContainer = document.getElementById('terminal-container');
        this.elements.metricsContainer = document.getElementById('metrics-container');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Navigation items
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const module = e.currentTarget.dataset.module;
                this.switchModule(module);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        try {
            // Initialize Vibe utilities
            if (window.Vibe) {
                this.modules.vibe = window.Vibe;
            }

            // Initialize Protocol client
            if (window.ProtocolClient) {
                this.modules.protocol = new window.ProtocolClient();
                if (this.config.autoConnect) {
                    await this.modules.protocol.connect();
                }
            }

            // Initialize Flow module
            if (window.FlowDiagram) {
                this.modules.flow = new window.FlowDiagram();
                await this.modules.flow.initialize();
            }

            // Initialize Terminal module
            this.modules.terminal = new TerminalModule();
            await this.modules.terminal.initialize();

            // Initialize Metrics module
            if (window.MetricsRenderer) {
                this.modules.metrics = new window.MetricsRenderer();
                await this.modules.metrics.initialize();
            }

            this.log('All modules initialized');
        } catch (error) {
            this.log('Error initializing modules:', error);
        }
    }

    /**
     * Switch between modules
     */
    switchModule(moduleName) {
        if (this.currentModule === moduleName) return;

        // Update navigation
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            }
        });

        // Hide current module
        this.hideCurrentModule();

        // Show new module
        this.showModule(moduleName);

        this.currentModule = moduleName;
        this.log(`Switched to module: ${moduleName}`);
    }

    /**
     * Hide current module
     */
    hideCurrentModule() {
        this.elements.welcomeMessage.classList.add('hidden');
        this.elements.flowContainer.classList.add('hidden');
        this.elements.terminalContainer.classList.add('hidden');
        this.elements.metricsContainer.classList.add('hidden');
    }

    /**
     * Show specific module
     */
    showModule(moduleName) {
        this.hideCurrentModule();

        switch (moduleName) {
            case 'flow':
                this.elements.flowContainer.classList.remove('hidden');
                if (this.modules.flow) {
                    this.modules.flow.resize();
                }
                break;
            case 'terminal':
                this.elements.terminalContainer.classList.remove('hidden');
                if (this.modules.terminal) {
                    this.modules.terminal.focus();
                }
                break;
            case 'metrics':
                this.elements.metricsContainer.classList.remove('hidden');
                if (this.modules.metrics) {
                    this.modules.metrics.update();
                }
                break;
            default:
                this.elements.welcomeMessage.classList.remove('hidden');
        }
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('agentcraft-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('agentcraft-theme', theme);
        
        // Update theme toggle icon
        const icon = this.elements.themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
        
        this.log(`Theme changed to: ${theme}`);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            if (this.modules.flow) {
                this.modules.flow.undo();
            }
        }

        // Ctrl+S for save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveFlow();
        }

        // Escape to deselect
        if (e.key === 'Escape') {
            if (this.modules.flow) {
                this.modules.flow.deselectAgent();
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.modules.flow) {
            this.modules.flow.resize();
        }
    }

    /**
     * Save current flow
     */
    saveFlow() {
        if (this.modules.flow) {
            const flowData = this.modules.flow.export();
            localStorage.setItem('agentcraft-flow', JSON.stringify(flowData));
            this.showToast('Flow saved successfully', 'success');
        }
    }

    /**
     * Load saved flow
     */
    loadFlow() {
        const savedFlow = localStorage.getItem('agentcraft-flow');
        if (savedFlow && this.modules.flow) {
            try {
                const flowData = JSON.parse(savedFlow);
                this.modules.flow.import(flowData);
                this.showToast('Flow loaded successfully', 'success');
            } catch (error) {
                this.showToast('Error loading flow', 'error');
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        if (this.modules.vibe && this.modules.vibe.showToast) {
            this.modules.vibe.showToast(message, type);
        } else {
            // Fallback toast implementation
            this.createToast(message, type);
        }
    }

    /**
     * Create fallback toast
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Log message
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[AgentCraft]', ...args);
        }
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Get current module
     */
    getCurrentModule() {
        return this.currentModule;
    }

    /**
     * Get application version
     */
    getVersion() {
        return this.config.version;
    }
}

/**
 * Terminal Module
 */
class TerminalModule {
    constructor() {
        this.logElement = null;
        this.inputElement = null;
        this.sendButton = null;
        this.commandHistory = [];
        this.historyIndex = -1;
    }

    async initialize() {
        this.logElement = document.getElementById('terminal-log');
        this.inputElement = document.getElementById('terminal-input');
        this.sendButton = document.getElementById('terminal-send');

        this.setupEventListeners();
        this.log('Terminal initialized');
        this.log('Type "help" for available commands');
    }

    setupEventListeners() {
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });

        this.sendButton.addEventListener('click', () => {
            this.executeCommand();
        });
    }

    executeCommand() {
        const command = this.inputElement.value.trim();
        if (!command) return;

        this.log(`> ${command}`);
        this.log(`Received: ${command}`);

        // Add to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;

        // Clear input
        this.inputElement.value = '';

        // Process command
        this.processCommand(command);
    }

    processCommand(command) {
        const cmd = command.toLowerCase();
        
        switch (cmd) {
            case 'help':
                this.log('Available commands:');
                this.log('  help - Show this help');
                this.log('  clear - Clear terminal');
                this.log('  status - Show connection status');
                this.log('  version - Show version');
                break;
            case 'clear':
                this.clear();
                break;
            case 'status':
                this.log('Connection status: Checking...');
                break;
            case 'version':
                this.log('AgentCraft Academy v1.0');
                break;
            default:
                this.log(`Unknown command: ${command}`);
                this.log('Type "help" for available commands');
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.inputElement.value = '';
            return;
        }

        this.inputElement.value = this.commandHistory[this.historyIndex];
    }

    log(message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        this.logElement.appendChild(logEntry);
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }

    clear() {
        this.logElement.innerHTML = '';
    }

    focus() {
        this.inputElement.focus();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AgentCraftAcademy = new AgentCraftAcademy();
    window.AgentCraftAcademy.initialize();
}); 