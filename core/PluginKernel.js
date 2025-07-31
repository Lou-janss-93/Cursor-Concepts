// PluginKernel.js - Core plugin management system

class PluginKernel {
  constructor() {
    this.registry = new Map();
    this.registryArray = [];
    this.actionQueue = [];
    this.isProcessingQueue = false;
    this.maxRetries = 3;
  }

  // Plugin registration with version tracking
  register(config) {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('Plugin name is required');
    }
    if (!config.exec || typeof config.exec !== 'function') {
      throw new Error('Plugin exec function is required');
    }
    if (this.registry.has(config.name)) {
      throw new Error(`Plugin '${config.name}' is already registered`);
    }
    
    // Add version tracking
    const pluginConfig = {
      ...config,
      version: config.version || '1.0.0',
      registeredAt: Date.now()
    };
    
    this.registry.set(pluginConfig.name, pluginConfig);
    this.registryArray.push(pluginConfig);
    
    console.log(`Plugin registered: ${pluginConfig.name} v${pluginConfig.version}`);
    return pluginConfig;
  }

  getPlugin(name) {
    return this.registry.get(name) || null;
  }

  listPlugins() {
    return this.registryArray.map(p => ({
      name: p.name,
      version: p.version,
      registeredAt: p.registeredAt
    }));
  }

  // Simple dependency checker
  checkDependencies(plugin) {
    if (!plugin.dependencies) return true;
    
    for (const dep of plugin.dependencies) {
      if (!this.registry.has(dep)) {
        console.warn(`Dependency '${dep}' not found for plugin '${plugin.name}'`);
        return false;
      }
    }
    return true;
  }

  enqueueAction(pluginName, params, retries = 0) {
    this.actionQueue.push({ pluginName, params, retries });
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;
    
    while (this.actionQueue.length > 0) {
      const { pluginName, params, retries } = this.actionQueue.shift();
      try {
        await this.run(pluginName, params, retries);
      } catch (e) {
        console.error(`Action for plugin ${pluginName} failed:`, e);
      }
    }
    
    this.isProcessingQueue = false;
  }

  async run(pluginName, params = {}, retries = 0) {
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Unknown plugin: ${pluginName}`);
    }
    
    if (!this.checkDependencies(plugin)) {
      throw new Error(`Not all dependencies available for plugin: ${pluginName}`);
    }

    try {
      const result = await plugin.exec(params, this);
      return result;
    } catch (err) {
      if (retries < this.maxRetries) {
        console.warn(`Retry ${retries + 1} for plugin ${pluginName}`);
        this.enqueueAction(pluginName, params, retries + 1);
      } else {
        throw new Error(`Plugin ${pluginName} failed after ${this.maxRetries} attempts: ${err.message}`);
      }
    }
  }

  // Get plugin statistics
  getStats() {
    return {
      totalPlugins: this.registry.size,
      queueLength: this.actionQueue.length,
      isProcessing: this.isProcessingQueue,
      plugins: this.listPlugins()
    };
  }
}

export default PluginKernel; 