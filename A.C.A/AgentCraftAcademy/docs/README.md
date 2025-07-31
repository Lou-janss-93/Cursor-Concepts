# GenAIOS Protocol Client

A modern, client-side web application that seamlessly integrates with the GenAIOS protocol for AI agent orchestration and management.

## 🎯 Problem Statement

Organizations face significant challenges in managing and orchestrating AI agents effectively:
- Lack of standardized interfaces for agent interaction
- Difficulty in visualizing agent workflows and relationships
- Complex setup and maintenance requirements
- Limited real-time monitoring and control capabilities
- No unified command system for agent management

## 💡 Solution

The GenAIOS Protocol Client provides a comprehensive interface for AI agent management:
- Standardized protocol implementation for agent communication
- Visual workflow builder and editor
- Real-time monitoring and metrics
- Interactive terminal for direct agent control
- Extensible architecture for custom integrations

## 🚀 Features

### Protocol Integration
- WebSocket-based communication with automatic reconnection
- Real-time status updates and event system
- Configurable retry logic and timeout handling
- Message queuing for offline operation
- Heartbeat monitoring

### Terminal Interface
- Command history with persistence
- Tab completion for commands
- Rich output formatting
- Command execution timing
- Error handling and recovery

### UI Components
- Responsive layout for mobile and desktop
- Dark/light theme support
- Collapsible sidebar
- Real-time status indicators
- Loading states and animations

### Visualization (Coming Soon)
- Flow diagram visualization
- Real-time metrics display
- Network status visualization
- Interactive graph manipulation
- Custom visualization plugins

## 🛠️ Technical Architecture

### Core Components
- `ProtocolClient`: Handles WebSocket communication and protocol implementation
- `Terminal`: Manages command input, history, and execution
- `Visualization`: Renders flow diagrams and metrics
- `UIManager`: Controls theme, layout, and responsiveness

### Event System
- Custom events for protocol status updates
- Agent status and metrics events
- Flow update events
- System error events

### Data Flow
1. User input via terminal or UI
2. Command processing and validation
3. Protocol message formatting
4. WebSocket transmission
5. Response handling and UI updates
6. Visualization rendering

## 🔧 Setup and Installation

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Modern web browser (Chrome, Firefox, Safari)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-org/genaios-client.git
cd genaios-client

# Run setup script
./setup.sh
```

The setup script will:
1. Check prerequisites
2. Create environment file from template
3. Install dependencies
4. Validate configuration
5. Run tests
6. Provide next steps

### Manual Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/genaios-client.git
   cd genaios-client
   ```

2. Create environment file:
   ```bash
   cp env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Validate configuration:
   ```bash
   ./validate.sh
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Available Scripts

#### Development
- `./dev.sh`: Start in development mode with checks
- `./prod.sh`: Start in production mode with checks
- `./debug.sh`: Start in debug mode with Node.js inspector
- `./setup.sh`: Set up the development environment
- `./test.sh`: Run tests with coverage
- `./validate.sh`: Validate configuration and environment
- `./clean.sh`: Clean up development environment
- `npm run dev`: Start in development mode
- `npm run prod`: Start in production mode
- `npm run validate`: Validate configuration

#### Testing
- `npm test`: Run all tests
- `npm test -- protocol.test.js`: Run specific test suite
- `npm test -- --coverage`: Run tests with coverage

#### Code Quality
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

### Development Mode
Development mode includes:
- Detailed error messages
- Debug logging
- Hot reloading
- Mock responses (optional)
- Disabled caching
- Performance metrics

To start in development mode:
```bash
./dev.sh
```

### Production Mode
Production mode includes:
- Optimized performance
- Minimal logging
- Caching enabled
- Real protocol responses
- Security hardening
- Error recovery

To start in production mode:
```bash
./prod.sh
```

### Debug Mode
Debug mode includes:
- Node.js inspector integration
- Chrome DevTools debugging
- Detailed logging
- Mock responses
- Disabled caching
- Performance profiling

To start in debug mode:
```bash
./debug.sh
```

Then open Chrome DevTools and connect to:
```
chrome://inspect/#devices
```

### Cleanup
The `clean.sh` script helps maintain a clean development environment by removing:
- `node_modules` directory
- Environment files
- Coverage reports
- Build artifacts
- Log files
- Cache directories
- Test artifacts
- Lock files

Each cleanup action requires confirmation:
```bash
./clean.sh
```

Example output:
```
Remove node_modules? [y/N] y
Removing node_modules...
Remove .env file? [y/N] n
Remove coverage reports? [y/N] y
Removing coverage reports...
Remove build artifacts? [y/N] y
Removing build artifacts...
Cleanup complete!
```

## ⚙️ Configuration

The client can be configured through environment variables or the `config.js` file:

```javascript
{
  protocol: {
    host: 'ws://localhost:8080',  // WebSocket server URL
    reconnectAttempts: 3,         // Number of reconnection attempts
    reconnectInterval: 1000,      // Milliseconds between attempts
    timeout: 3000                 // Connection timeout in milliseconds
  },
  terminal: {
    maxHistory: 100,              // Maximum command history entries
    maxLines: 1000               // Maximum terminal output lines
  }
}
```

### Environment Variables
See `env.example` for all available environment variables and their descriptions.

### Configuration Validation
The `validate.sh` script checks:
1. Node.js and npm versions
2. Environment file existence
3. Required dependencies
4. Configuration values:
   - Protocol settings
   - Terminal settings
   - UI settings
   - Visualization settings
   - Security settings
   - Performance settings
   - Development settings

To validate your configuration:
```bash
./validate.sh
```

### Development Settings
```javascript
{
  development: {
    debug: true,                // Enable debug logging
    logLevel: 'debug',         // Log level (debug, info, warn, error)
    mockResponses: true,       // Use mock protocol responses
    disableCache: true         // Disable browser caching
  }
}
```

### Production Settings
```javascript
{
  development: {
    debug: false,               // Disable debug logging
    logLevel: 'error',         // Log only errors
    mockResponses: false,      // Use real protocol responses
    disableCache: false        // Enable browser caching
  }
}
```

### Debug Settings
```javascript
{
  development: {
    debug: true,                // Enable debug logging
    logLevel: 'debug',         // Log level (debug, info, warn, error)
    mockResponses: true,       // Use mock protocol responses
    disableCache: true,        // Disable browser caching
    inspector: true,           // Enable Node.js inspector
    profiling: true           // Enable performance profiling
  }
}
```

## 🎮 Usage

### Terminal Commands
- `help`: Show available commands
- `clear`: Clear terminal output
- `history`: Show command history

### Agent Management
- `agent.list`: List all available agents
- `agent.status <id>`: Show agent status
- `agent.start <id>`: Start an agent
- `agent.stop <id>`: Stop an agent

### Flow Management
- `flow.list`: List all flows
- `flow.start <id>`: Start a flow
- `flow.stop <id>`: Stop a flow

### System Commands
- `system.status`: Show system status
- `system.metrics`: Show system metrics

## 🧪 Testing

### Running Tests
```bash
# Run all tests
./test.sh

# Run specific test suite
npm test -- protocol.test.js

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage
Current test coverage:
- Statements: 37.86%
- Branches: 37.17%
- Functions: 38.40%
- Lines: 38.64%

## 📈 Performance

### Load Time
- Initial page load: < 2s
- Asset loading: < 3s
- Memory usage: < 100MB

### Responsiveness
- UI interaction latency: < 100ms
- Animation frame rate: 58fps
- Command execution: < 500ms

## 🔒 Security

### Data Protection
- All WebSocket communication is encrypted
- No sensitive data stored in localStorage
- Input sanitization for all commands
- XSS prevention in terminal output

### Error Handling
- Graceful connection failure recovery
- Command validation and sanitization
- Error logging and reporting
- User-friendly error messages

### Development vs Production
| Feature | Development | Production |
|---------|-------------|------------|
| Error Messages | Detailed | Generic |
| Logging | Debug | Error only |
| Caching | Disabled | Enabled |
| Protocol | Mock (optional) | Real |
| Performance | Debug metrics | Optimized |
| Security | Standard | Hardened |

### Debug vs Development
| Feature | Debug | Development |
|---------|-------|-------------|
| Inspector | Enabled | Disabled |
| Profiling | Enabled | Disabled |
| Logging | Verbose | Debug |
| Breakpoints | Supported | Not supported |
| Hot Reload | Disabled | Enabled |
| Performance | Profiling | Metrics |

## 🚧 Known Issues

### Critical
1. Visualization components not implemented
   - Flow diagram rendering
   - Metrics display
   - Network visualization

### Minor
1. Animation frame rate below 60fps target
2. Test coverage below 80% target

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`./test.sh`)
5. Clean environment (`./clean.sh`)
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 