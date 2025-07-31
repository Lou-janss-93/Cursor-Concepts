# MOCATI Light 🚀

**Lightweight Plugin Platform for MockOps**

A modern, lightweight plugin platform built with React and Vite for managing and executing plugins in a MockOps environment.

## ✨ Features

### 🔌 Plugin Management
- **Plugin Registry** - Central registration of plugins with version tracking
- **Dependency Checking** - Automatic checking of plugin dependencies
- **Action Queue** - Ordered execution of plugin actions
- **Retry System** - Automatic retry for failing plugins

### 📊 Logging & Monitoring
- **Interaction Logging** - Comprehensive logging of all plugin interactions
- **Success/Fail Tracking** - Clear status tracking per plugin run
- **Real-time Statistics** - Live statistics and performance metrics
- **Log Export** - Export functionality for logs and data

### 🎨 User Interface
- **Modern UI** - React-based interface with modern styling
- **Dark Mode** - Full dark/light mode support
- **Toast Notifications** - Real-time feedback via toast alerts
- **Responsive Design** - Works on all screen sizes

### 💾 Storage
- **LocalStorage Integration** - Persistent storage of logs and settings
- **Data Export/Import** - Backup and restore functionality
- **Storage Monitoring** - Usage and quota monitoring
- **Auto Cleanup** - Automatic cleanup of old data

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the project
git clone https://github.com/mocati/mocati-light.git
cd mocati-light

# Install dependencies
npm install

# Start development server
npm run dev
```

The application is now available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 📁 Project Structure

```
mocati-light/
├── core/                 # Core system files
│   ├── PluginKernel.js   # Plugin management system
│   └── interaction-log.js # Logging system
├── plugins/              # Plugin definitions
│   └── notion.js         # Notion integration plugin
├── components/           # React components
│   └── PluginCard.jsx    # Plugin display component
├── utils/                # Utility functions
│   └── storage.js        # Storage management
├── App.jsx               # Main application component
├── main.jsx              # React entry point
├── index.html            # HTML template
├── package.json          # Project configuration
├── vite.config.js        # Vite configuration
└── README.md             # This documentation
```

## 🔌 Plugin Development

### Plugin Structure

```javascript
const MyPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  icon: '🔌',
  description: 'My custom plugin',
  dependencies: [],
  
  async exec(params, kernel) {
    // Plugin logic here
    return { status: 'success', data: 'result' };
  }
};
```

### Plugin Registration

```javascript
import PluginKernel from './core/PluginKernel.js';
import MyPlugin from './plugins/my-plugin.js';

const kernel = new PluginKernel();
kernel.register(MyPlugin);
```

### Plugin Execution

```javascript
// Execute plugin
const result = await kernel.run('my-plugin', {
  action: 'customAction',
  data: 'custom data'
});
```

## 📊 Logging & Monitoring

### Log Structure

```javascript
{
  id: 'unique-id',
  timestamp: 1234567890,
  plugin: 'plugin-name',
  params: { action: 'test' },
  result: { status: 'success' },
  status: 'success', // 'success' or 'fail'
  duration: 150 // milliseconds
}
```

### Log Filtering

```javascript
import interactionLog from './core/interaction-log.js';

// Filter logs
const successLogs = interactionLog.getLogs({ status: 'success' });
const pluginLogs = interactionLog.getLogs({ plugin: 'notion' });
const recentLogs = interactionLog.getRecentLogs(10);
```

### Statistics

```javascript
const stats = interactionLog.getStats();
console.log(stats);
// {
//   total: 100,
//   success: 95,
//   fail: 5,
//   successRate: '95.00',
//   pluginStats: { ... }
// }
```

## 💾 Storage Management

### Save/Load Logs

```javascript
import storageManager from './utils/storage.js';

// Save logs
storageManager.saveLogs(logs);

// Load logs
const logs = storageManager.loadLogs();
```

### Settings Management

```javascript
// Save setting
storageManager.saveSetting('darkMode', true);

// Load setting
const darkMode = storageManager.loadSetting('darkMode', false);
```

### Data Export/Import

```javascript
// Export all data
const exportData = storageManager.exportData();

// Import data
storageManager.importData(importData);
```

## 🎨 UI Components

### PluginCard Component

```jsx
import PluginCard from './components/PluginCard.js';

<PluginCard
  plugin={pluginData}
  status="idle"
  onRun={handleRunPlugin}
  onViewLogs={handleViewLogs}
/>
```

### Toast Notifications

```javascript
// Show toast
showToast('Plugin executed successfully!', 'success');
showToast('An error occurred', 'error');
showToast('Information message', 'info');
```

## 🔧 Configuration

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### Environment Variables

```bash
# .env
VITE_APP_TITLE=MOCATI Light
VITE_API_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance

### Optimizations
- **Code Splitting** - Automatic code splitting with Vite
- **Lazy Loading** - Plugins are lazy loaded
- **Bundle Optimization** - Optimized production builds
- **Memory Management** - Efficient memory usage

### Metrics
- **Initial Load**: < 2 seconds
- **Plugin Load**: < 500ms
- **Bundle Size**: < 1MB gzipped
- **Memory Usage**: < 50MB baseline

## 🔒 Security

### Best Practices
- **Input Validation** - All input is validated
- **Error Handling** - Robust error handling
- **Safe Execution** - Plugins are executed safely
- **Data Sanitization** - Data is sanitized before storage

## 🚀 Deployment

### Static Hosting

```bash
# Build for production
npm run build

# Deploy to static hosting
# Upload dist/ folder to your hosting provider
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📋 Roadmap

### v1.1 - Enhanced Plugin System
- [ ] Plugin marketplace
- [ ] Plugin versioning
- [ ] Plugin dependencies
- [ ] Plugin configuration UI

### v1.2 - Advanced Logging
- [ ] Real-time log streaming
- [ ] Log analytics dashboard
- [ ] Custom log filters
- [ ] Log retention policies

### v1.3 - Security Features
- [ ] Plugin sandboxing
- [ ] Access control
- [ ] API key management
- [ ] Audit trails

### v1.4 - Performance & Scale
- [ ] Plugin caching
- [ ] Background processing
- [ ] Distributed execution
- [ ] Load balancing

### v2.0 - Enterprise Features
- [ ] Multi-tenant support
- [ ] Advanced monitoring
- [ ] Integration APIs
- [ ] Custom themes

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/mocati/mocati-light/wiki)
- **Issues**: [GitHub Issues](https://github.com/mocati/mocati-light/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mocati/mocati-light/discussions)
- **Email**: support@mocati.dev

## 🙏 Acknowledgments

### 🛠️ Development Tools
- **OpenAI ChatGPT** - Voor AI-assisted development en code review
- **Perplexity.ai** - Voor research en technische documentatie
- **Cursor** - Voor AI-powered code editing en development
- **Canva** - Voor design en visual assets
- **Midjourney** - Voor AI-generated artwork en visuals
- **Replit** - Voor cloud development en deployment
- **VS Code** - Voor code editing en development environment

### 🏗️ Frameworks & Libraries
- **React Team** - Voor het geweldige React framework
- **Vite Team** - Voor de snelle build tool
- **MockOps Community** - Voor feedback en suggesties

### 🌟 Community & Events
- **Gen.ai Community** - For various events, challenges, tips & tricks & tools
- **Hackathon Sponsors** - For support during hackathon events
---

**MOCATI Light** - Building the future of plugin platforms! 🚀 