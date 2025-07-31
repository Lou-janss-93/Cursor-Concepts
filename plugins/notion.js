// notion.js - Notion integration plugin

const NotionPlugin = {
  name: 'notion',
  version: '1.0.0',
  icon: '📝',
  description: 'Notion integration for messages and documents',
  dependencies: [],
  
  // Basic sendMessage function (placeholder)
  async sendMessage(content, options = {}) {
    console.log('Notion sendMessage called:', { content, options });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure based on content
    const success = content && content.length > 0;
    
    if (success) {
      return {
        status: 'success',
        message: 'Message successfully sent to Notion',
        data: {
          content,
          timestamp: Date.now(),
          messageId: `notion_${Date.now()}`
        }
      };
    } else {
      throw new Error('Message content is empty');
    }
  },

  // Retry system for failed requests (commented out for now)
  /*
  async sendMessageWithRetry(content, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendMessage(content, options);
      } catch (error) {
        lastError = error;
        console.warn(`Notion sendMessage attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Notion sendMessage failed after ${maxRetries} attempts: ${lastError.message}`);
  },
  */

  // Main plugin execution function
  async exec(params, kernel) {
    console.log('Notion plugin executed with params:', params);
    
    const { action, content, options } = params;
    
    switch (action) {
      case 'sendMessage':
        return await this.sendMessage(content, options);
        
      case 'getStatus':
        return {
          status: 'success',
          data: {
            plugin: 'notion',
            version: this.version,
            available: true,
            timestamp: Date.now()
          }
        };
        
      default:
        // Default action - send message
        return await this.sendMessage(content || 'Default Notion message', options);
    }
  },

  // Plugin metadata
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      icon: this.icon,
      description: this.description,
      actions: ['sendMessage', 'getStatus'],
      dependencies: this.dependencies
    };
  }
};

export default NotionPlugin; 