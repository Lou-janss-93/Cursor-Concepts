/**
 * Test Engine for AgentCraft Academy
 * Test case execution, result tracking, and assertion utilities
 */

class TestEngine {
    constructor() {
        this.tests = new Map();
        this.results = new Map();
        this.currentTest = null;
        this.isRunning = false;
        this.testQueue = [];
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        // Configuration
        this.config = {
            debug: true,
            autoSave: true,
            maxRetries: 3,
            timeout: 30000
        };
        
        // Event listeners
        this.eventListeners = new Map();
    }

    /**
     * Initialize the test engine
     */
    async initialize() {
        this.log('Test engine initialized');
        
        // Load saved results
        this.loadResults();
        
        // Register default tests
        this.registerDefaultTests();
    }

    /**
     * Register a test case
     */
    registerTest(name, testFunction, options = {}) {
        const test = {
            id: this.generateId(),
            name,
            function: testFunction,
            description: options.description || '',
            category: options.category || 'general',
            timeout: options.timeout || this.config.timeout,
            retries: options.retries || this.config.maxRetries,
            dependencies: options.dependencies || [],
            tags: options.tags || [],
            createdAt: Date.now()
        };
        
        this.tests.set(test.id, test);
        this.log('Registered test:', name);
        
        // Emit event
        this.emit('test-registered', { test });
        
        return test.id;
    }

    /**
     * Run a specific test
     */
    async runTest(testId) {
        const test = this.tests.get(testId);
        if (!test) {
            throw new Error(`Test not found: ${testId}`);
        }
        
        this.log('Running test:', test.name);
        
        // Check dependencies
        for (const dependency of test.dependencies) {
            const depResult = this.results.get(dependency);
            if (!depResult || !depResult.passed) {
                throw new Error(`Dependency failed: ${dependency}`);
            }
        }
        
        this.currentTest = test;
        this.isRunning = true;
        
        // Emit event
        this.emit('test-started', { test });
        
        let result;
        let attempts = 0;
        
        while (attempts < test.retries) {
            attempts++;
            
            try {
                result = await this.executeTest(test);
                break;
            } catch (error) {
                this.log(`Test attempt ${attempts} failed:`, error.message);
                
                if (attempts < test.retries) {
                    await this.delay(test.retryDelay * attempts);
                } else {
                    result = {
                        testId: test.id,
                        name: test.name,
                        passed: false,
                        error: error.message,
                        attempts,
                        duration: 0,
                        timestamp: Date.now()
                    };
                }
            }
        }
        
        this.results.set(test.id, result);
        this.currentTest = null;
        this.isRunning = false;
        
        // Save results
        if (this.config.autoSave) {
            this.saveResults();
        }
        
        // Emit event
        this.emit('test-completed', { test, result });
        
        this.log(`Test completed: ${test.name} - ${result.passed ? 'PASSED' : 'FAILED'}`);
        
        return result;
    }

    /**
     * Execute a single test
     */
    async executeTest(test) {
        const startTime = Date.now();
        
        // Create test context
        const context = {
            test: test,
            assert: this.createAssertions(),
            log: (message) => this.log(`[${test.name}] ${message}`),
            timeout: (ms) => this.createTimeout(ms)
        };
        
        // Execute test with timeout
        const testPromise = test.function(context);
        const timeoutPromise = this.createTimeoutPromise(test.timeout);
        
        const result = await Promise.race([testPromise, timeoutPromise]);
        
        const duration = Date.now() - startTime;
        
        return {
            testId: test.id,
            name: test.name,
            passed: true,
            duration,
            timestamp: Date.now(),
            attempts: 1
        };
    }

    /**
     * Create timeout promise
     */
    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Test timeout after ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Create timeout utility
     */
    createTimeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create assertion utilities
     */
    createAssertions() {
        return {
            equal: (actual, expected, message = '') => {
                if (actual !== expected) {
                    throw new Error(`Assertion failed: ${actual} !== ${expected} ${message}`);
                }
            },
            
            notEqual: (actual, expected, message = '') => {
                if (actual === expected) {
                    throw new Error(`Assertion failed: ${actual} === ${expected} ${message}`);
                }
            },
            
            true: (value, message = '') => {
                if (!value) {
                    throw new Error(`Assertion failed: expected true, got ${value} ${message}`);
                }
            },
            
            false: (value, message = '') => {
                if (value) {
                    throw new Error(`Assertion failed: expected false, got ${value} ${message}`);
                }
            },
            
            throws: (fn, message = '') => {
                try {
                    fn();
                    throw new Error(`Assertion failed: expected function to throw ${message}`);
                } catch (error) {
                    // Expected
                }
            },
            
            notThrows: (fn, message = '') => {
                try {
                    fn();
                } catch (error) {
                    throw new Error(`Assertion failed: function threw ${error.message} ${message}`);
                }
            },
            
            deepEqual: (actual, expected, message = '') => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Assertion failed: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)} ${message}`);
                }
            },
            
            contains: (array, item, message = '') => {
                if (!array.includes(item)) {
                    throw new Error(`Assertion failed: ${array} does not contain ${item} ${message}`);
                }
            },
            
            greaterThan: (actual, expected, message = '') => {
                if (actual <= expected) {
                    throw new Error(`Assertion failed: ${actual} <= ${expected} ${message}`);
                }
            },
            
            lessThan: (actual, expected, message = '') => {
                if (actual >= expected) {
                    throw new Error(`Assertion failed: ${actual} >= ${expected} ${message}`);
                }
            }
        };
    }

    /**
     * Run test suite
     */
    async runTestSuite(suiteName, testIds = null) {
        this.log('Running test suite:', suiteName);
        
        const testsToRun = testIds || Array.from(this.tests.keys());
        const results = [];
        
        for (const testId of testsToRun) {
            try {
                const result = await this.runTest(testId);
                results.push(result);
            } catch (error) {
                this.log('Test suite error:', error.message);
                results.push({
                    testId,
                    name: this.tests.get(testId)?.name || 'Unknown',
                    passed: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        }
        
        const summary = this.generateSummary(results);
        
        // Emit event
        this.emit('suite-completed', { suiteName, results, summary });
        
        this.log('Test suite completed:', summary);
        
        return { results, summary };
    }

    /**
     * Generate test summary
     */
    generateSummary(results) {
        const total = results.length;
        const passed = results.filter(r => r.passed).length;
        const failed = total - passed;
        const duration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
        
        return {
            total,
            passed,
            failed,
            duration,
            successRate: total > 0 ? (passed / total) * 100 : 0
        };
    }

    /**
     * Get test results
     */
    getResults(testId = null) {
        if (testId) {
            return this.results.get(testId);
        }
        return Array.from(this.results.values());
    }

    /**
     * Clear test results
     */
    clearResults(testId = null) {
        if (testId) {
            this.results.delete(testId);
        } else {
            this.results.clear();
        }
        
        this.saveResults();
    }

    /**
     * Export results
     */
    exportResults(format = 'json') {
        const data = {
            tests: Array.from(this.tests.values()),
            results: Array.from(this.results.values()),
            summary: this.generateSummary(Array.from(this.results.values())),
            exportedAt: new Date().toISOString()
        };
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                return this.exportToCSV(data);
                
            case 'markdown':
                return this.exportToMarkdown(data);
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export to CSV
     */
    exportToCSV(data) {
        const headers = ['Test Name', 'Status', 'Duration (ms)', 'Error', 'Timestamp'];
        const rows = data.results.map(result => [
            result.name,
            result.passed ? 'PASSED' : 'FAILED',
            result.duration || 0,
            result.error || '',
            new Date(result.timestamp).toISOString()
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Export to Markdown
     */
    exportToMarkdown(data) {
        let markdown = `# Test Results\n\n`;
        markdown += `**Generated:** ${data.exportedAt}\n\n`;
        
        // Summary
        markdown += `## Summary\n\n`;
        markdown += `- **Total Tests:** ${data.summary.total}\n`;
        markdown += `- **Passed:** ${data.summary.passed}\n`;
        markdown += `- **Failed:** ${data.summary.failed}\n`;
        markdown += `- **Success Rate:** ${data.summary.successRate.toFixed(1)}%\n`;
        markdown += `- **Total Duration:** ${data.summary.duration}ms\n\n`;
        
        // Results table
        markdown += `## Test Results\n\n`;
        markdown += `| Test Name | Status | Duration | Error |\n`;
        markdown += `|-----------|--------|----------|-------|\n`;
        
        data.results.forEach(result => {
            const status = result.passed ? '✅ PASSED' : '❌ FAILED';
            const duration = result.duration || 0;
            const error = result.error || '';
            
            markdown += `| ${result.name} | ${status} | ${duration}ms | ${error} |\n`;
        });
        
        return markdown;
    }

    /**
     * Save results to localStorage
     */
    saveResults() {
        try {
            const data = {
                results: Array.from(this.results.entries()),
                timestamp: Date.now()
            };
            localStorage.setItem('agentcraft-test-results', JSON.stringify(data));
        } catch (error) {
            this.log('Error saving test results:', error);
        }
    }

    /**
     * Load results from localStorage
     */
    loadResults() {
        try {
            const data = localStorage.getItem('agentcraft-test-results');
            if (data) {
                const parsed = JSON.parse(data);
                this.results = new Map(parsed.results);
                this.log('Loaded test results from storage');
            }
        } catch (error) {
            this.log('Error loading test results:', error);
        }
    }

    /**
     * Register default tests
     */
    registerDefaultTests() {
        // Flow validation test
        this.registerTest('flow-validation', async (context) => {
            const { assert } = context;
            
            if (window.AgentCraftAcademy && window.AgentCraftAcademy.getModule('flow')) {
                const flowModule = window.AgentCraftAcademy.getModule('flow');
                const validation = flowModule.validateFlow();
                
                assert.true(validation.isValid, 'Flow should be valid');
                assert.equal(validation.errors.length, 0, 'Flow should have no errors');
            } else {
                throw new Error('Flow module not available');
            }
        }, {
            description: 'Validates the current flow configuration',
            category: 'flow',
            tags: ['validation', 'flow']
        });
        
        // Connection test
        this.registerTest('connection-test', async (context) => {
            const { assert } = context;
            
            if (window.AgentCraftAcademy && window.AgentCraftAcademy.getModule('protocol')) {
                const protocolModule = window.AgentCraftAcademy.getModule('protocol');
                const status = protocolModule.getConnectionStatus();
                
                assert.true(status.isConnected, 'Should be connected to protocol');
            } else {
                throw new Error('Protocol module not available');
            }
        }, {
            description: 'Tests protocol connection status',
            category: 'protocol',
            tags: ['connection', 'protocol']
        });
        
        // UI responsiveness test
        this.registerTest('ui-responsiveness', async (context) => {
            const { assert } = context;
            
            // Test if main elements are present
            const app = document.getElementById('app');
            const sidebar = document.querySelector('.sidebar');
            const workspace = document.querySelector('.workspace');
            
            assert.true(!!app, 'App container should exist');
            assert.true(!!sidebar, 'Sidebar should exist');
            assert.true(!!workspace, 'Workspace should exist');
        }, {
            description: 'Tests UI responsiveness and element presence',
            category: 'ui',
            tags: ['ui', 'responsiveness']
        });
    }

    /**
     * Get test by name
     */
    getTestByName(name) {
        return Array.from(this.tests.values()).find(test => test.name === name);
    }

    /**
     * Get tests by category
     */
    getTestsByCategory(category) {
        return Array.from(this.tests.values()).filter(test => test.category === category);
    }

    /**
     * Get tests by tag
     */
    getTestsByTag(tag) {
        return Array.from(this.tests.values()).filter(test => test.tags.includes(tag));
    }

    /**
     * Remove test
     */
    removeTest(testId) {
        const test = this.tests.get(testId);
        if (test) {
            this.tests.delete(testId);
            this.results.delete(testId);
            this.log('Removed test:', test.name);
            
            // Emit event
            this.emit('test-removed', { test });
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            console.log('[TestEngine]', ...args);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestEngine;
} 