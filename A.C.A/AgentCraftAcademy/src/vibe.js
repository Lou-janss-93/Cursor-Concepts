/**
 * Vibe Utilities for AgentCraft Academy
 * Core UI/UX utilities including toast notifications, loading indicators, and more
 */

class Vibe {
    constructor() {
        this.toastContainer = null;
        this.modalContainer = null;
        this.loadingOverlay = null;
        this.toastQueue = [];
        this.isProcessingToasts = false;
        
        // Configuration
        this.config = {
            toastDuration: 3000,
            maxToasts: 5,
            debug: true
        };
        
        this.initialize();
    }

    /**
     * Initialize Vibe utilities
     */
    initialize() {
        this.createContainers();
        this.injectStyles();
        this.log('Vibe utilities initialized');
    }

    /**
     * Create necessary DOM containers
     */
    createContainers() {
        // Create toast container
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'vibe-toast-container';
        this.toastContainer.className = 'vibe-toast-container';
        document.body.appendChild(this.toastContainer);
        
        // Create modal container
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'vibe-modal-container';
        this.modalContainer.className = 'vibe-modal-container';
        document.body.appendChild(this.modalContainer);
        
        // Create loading overlay
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.id = 'vibe-loading-overlay';
        this.loadingOverlay.className = 'vibe-loading-overlay hidden';
        document.body.appendChild(this.loadingOverlay);
    }

    /**
     * Inject Vibe-specific styles
     */
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .vibe-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            }
            
            .vibe-toast {
                background: var(--bg-light);
                border: 1px solid var(--border-light);
                border-radius: 8px;
                padding: 12px 16px;
                margin-bottom: 8px;
                box-shadow: var(--shadow-lg);
                color: var(--text-primary);
                font-size: 14px;
                font-weight: 500;
                max-width: 300px;
                pointer-events: auto;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease-out;
            }
            
            .vibe-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .vibe-toast.success {
                border-left: 4px solid var(--success);
            }
            
            .vibe-toast.error {
                border-left: 4px solid var(--danger);
            }
            
            .vibe-toast.warning {
                border-left: 4px solid var(--warning);
            }
            
            .vibe-toast.info {
                border-left: 4px solid var(--primary);
            }
            
            .vibe-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
                pointer-events: none;
            }
            
            .vibe-modal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: var(--bg-light);
                border: 1px solid var(--border-light);
                border-radius: 12px;
                padding: 24px;
                box-shadow: var(--shadow-lg);
                max-width: 500px;
                width: 90%;
                pointer-events: auto;
                opacity: 0;
                transition: all 0.3s ease-out;
            }
            
            .vibe-modal.show {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            
            .vibe-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                opacity: 0;
                transition: opacity 0.3s ease-out;
            }
            
            .vibe-modal-backdrop.show {
                opacity: 1;
            }
            
            .vibe-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .vibe-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--bg-secondary);
                border-top: 4px solid var(--primary);
                border-radius: 50%;
                animation: vibe-spin 1s linear infinite;
            }
            
            @keyframes vibe-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .vibe-progress-bar {
                width: 100%;
                height: 4px;
                background: var(--bg-secondary);
                border-radius: 2px;
                overflow: hidden;
                margin: 8px 0;
            }
            
            .vibe-progress-fill {
                height: 100%;
                background: var(--primary);
                transition: width 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = null) {
        const toast = {
            id: this.generateId(),
            message,
            type,
            duration: duration || this.config.toastDuration,
            timestamp: Date.now()
        };
        
        this.toastQueue.push(toast);
        this.processToastQueue();
        
        return toast.id;
    }

    /**
     * Process toast queue
     */
    async processToastQueue() {
        if (this.isProcessingToasts || this.toastQueue.length === 0) return;
        
        this.isProcessingToasts = true;
        
        while (this.toastQueue.length > 0) {
            const toast = this.toastQueue.shift();
            await this.displayToast(toast);
            
            // Wait a bit before showing next toast
            await this.delay(100);
        }
        
        this.isProcessingToasts = false;
    }

    /**
     * Display individual toast
     */
    async displayToast(toast) {
        const toastElement = document.createElement('div');
        toastElement.className = `vibe-toast ${toast.type}`;
        toastElement.textContent = toast.message;
        
        this.toastContainer.appendChild(toastElement);
        
        // Trigger animation
        await this.delay(10);
        toastElement.classList.add('show');
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toastElement);
        }, toast.duration);
    }

    /**
     * Remove toast element
     */
    removeToast(toastElement) {
        toastElement.classList.remove('show');
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }

    /**
     * Show modal dialog
     */
    showModal(options = {}) {
        const {
            title = 'Dialog',
            content = '',
            buttons = [],
            onClose = null,
            width = '500px'
        } = options;
        
        const modalId = this.generateId();
        
        const modal = document.createElement('div');
        modal.className = 'vibe-modal';
        modal.style.width = width;
        modal.innerHTML = `
            <div class="vibe-modal-backdrop"></div>
            <div class="modal-content">
                <h3 class="modal-title">${title}</h3>
                <div class="modal-body">${content}</div>
                ${buttons.length > 0 ? `
                    <div class="modal-actions">
                        ${buttons.map(btn => `
                            <button class="modal-btn ${btn.class || ''}" data-action="${btn.action}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        this.modalContainer.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
            modal.querySelector('.vibe-modal-backdrop').classList.add('show');
        }, 10);
        
        // Setup event listeners
        const backdrop = modal.querySelector('.vibe-modal-backdrop');
        backdrop.addEventListener('click', () => {
            this.closeModal(modalId);
        });
        
        // Button actions
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-btn')) {
                const action = e.target.dataset.action;
                if (action === 'close') {
                    this.closeModal(modalId);
                } else if (onClose) {
                    onClose(action);
                }
            }
        });
        
        return modalId;
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = this.modalContainer.querySelector(`[data-modal-id="${modalId}"]`);
        if (modal) {
            modal.classList.remove('show');
            modal.querySelector('.vibe-modal-backdrop').classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    /**
     * Show confirmation dialog
     */
    async confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.showModal({
                title,
                content: message,
                buttons: [
                    { text: 'Cancel', action: 'cancel', class: 'btn-secondary' },
                    { text: 'Confirm', action: 'confirm', class: 'btn-primary' }
                ],
                onClose: (action) => {
                    resolve(action === 'confirm');
                }
            });
        });
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        this.loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="vibe-spinner"></div>
                <p class="loading-text">${message}</p>
            </div>
        `;
        this.loadingOverlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    /**
     * Show progress bar
     */
    showProgress(container, progress = 0, message = '') {
        const progressElement = document.createElement('div');
        progressElement.className = 'vibe-progress-bar';
        progressElement.innerHTML = `
            <div class="vibe-progress-fill" style="width: ${progress}%"></div>
            ${message ? `<div class="progress-message">${message}</div>` : ''}
        `;
        
        container.appendChild(progressElement);
        
        return {
            update: (newProgress, newMessage) => {
                const fill = progressElement.querySelector('.vibe-progress-fill');
                const messageEl = progressElement.querySelector('.progress-message');
                
                fill.style.width = `${newProgress}%`;
                if (messageEl && newMessage) {
                    messageEl.textContent = newMessage;
                }
            },
            remove: () => {
                if (progressElement.parentNode) {
                    progressElement.parentNode.removeChild(progressElement);
                }
            }
        };
    }

    /**
     * Utility functions
     */
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Format bytes
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Format duration
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'vibe-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Log message
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[Vibe]', ...args);
        }
    }
}

/**
 * Vibe Logger Class
 */
class VibeLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.levels = ['debug', 'info', 'warn', 'error'];
        this.currentLevel = 'info';
    }

    log(level, message, data = null) {
        if (!this.levels.includes(level)) return;
        
        const logEntry = {
            timestamp: new Date(),
            level,
            message,
            data
        };
        
        this.logs.push(logEntry);
        
        // Keep logs under max limit
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Console output
        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warn' ? 'warn' : 
                             level === 'info' ? 'info' : 'log';
        
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    debug(message, data) {
        this.log('debug', message, data);
    }

    info(message, data) {
        this.log('info', message, data);
    }

    warn(message, data) {
        this.log('warn', message, data);
    }

    error(message, data) {
        this.log('error', message, data);
    }

    getLogs(level = null, limit = 100) {
        let filteredLogs = this.logs;
        
        if (level) {
            filteredLogs = this.logs.filter(log => log.level === level);
        }
        
        return filteredLogs.slice(-limit);
    }

    clear() {
        this.logs = [];
    }

    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}

/**
 * Vibe Animations Class
 */
class VibeAnimations {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }

    static fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, duration);
    }

    static slideIn(element, direction = 'left', duration = 300) {
        const transforms = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };
        
        element.style.transform = transforms[direction];
        element.style.transition = `transform ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'translateX(0) translateY(0)';
        }, 10);
    }

    static slideOut(element, direction = 'left', duration = 300) {
        const transforms = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };
        
        element.style.transition = `transform ${duration}ms ease-out`;
        element.style.transform = transforms[direction];
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, duration);
    }

    static scaleIn(element, duration = 300) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 10);
    }

    static scaleOut(element, duration = 300) {
        element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, duration);
    }
}

// Create global Vibe instance
window.Vibe = new Vibe();
window.VibeLogger = new VibeLogger();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Vibe, VibeLogger, VibeAnimations };
} 