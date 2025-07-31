// App.js - Main application component

import React, { useState, useEffect } from 'react';
import PluginKernel from './core/PluginKernel.js';
import NotionPlugin from './plugins/notion.js';
import interactionLog from './core/interaction-log.js';
import PluginCard from './components/PluginCard.jsx';

function App() {
  const [kernel] = useState(new PluginKernel());
  const [plugins, setPlugins] = useState([]);
  const [pluginStatus, setPluginStatus] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [logs, setLogs] = useState([]);

  // Initialize plugins
  useEffect(() => {
    // Register plugins
    kernel.register(NotionPlugin);
    
    // Update plugins list
    setPlugins(kernel.listPlugins());
    
    // Initialize plugin status
    const status = {};
    kernel.listPlugins().forEach(plugin => {
      status[plugin.name] = 'idle';
    });
    setPluginStatus(status);
  }, [kernel]);

  // Load logs
  useEffect(() => {
    setLogs(interactionLog.getRecentLogs(10));
  }, []);

  // Toast system
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Run plugin
  const handleRunPlugin = async (pluginName) => {
    setPluginStatus(prev => ({ ...prev, [pluginName]: 'running' }));
    
    const startTime = Date.now();
    
    try {
      const result = await kernel.run(pluginName, {
        action: 'sendMessage',
        content: `Test bericht van ${pluginName} plugin`
      });
      
      const duration = Date.now() - startTime;
      
      // Log success
      interactionLog.logSuccess(pluginName, { action: 'sendMessage' }, result, duration);
      
      setPluginStatus(prev => ({ ...prev, [pluginName]: 'success' }));
      showToast(`${pluginName} plugin executed successfully!`, 'success');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setPluginStatus(prev => ({ ...prev, [pluginName]: 'idle' }));
      }, 2000);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failure
      interactionLog.logFail(pluginName, { action: 'sendMessage' }, error, duration);
      
      setPluginStatus(prev => ({ ...prev, [pluginName]: 'error' }));
      showToast(`Error executing ${pluginName} plugin: ${error.message}`, 'error');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setPluginStatus(prev => ({ ...prev, [pluginName]: 'idle' }));
      }, 3000);
    }
    
    // Update logs
    setLogs(interactionLog.getRecentLogs(10));
  };

  // View logs
  const handleViewLogs = (pluginName) => {
    const pluginLogs = interactionLog.getLogs({ plugin: pluginName });
    console.log(`${pluginName} logs:`, pluginLogs);
    showToast(`${pluginLogs.length} logs found for ${pluginName}`, 'info');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    showToast(`Dark mode ${!darkMode ? 'on' : 'off'}`, 'info');
  };

  // Clear logs
  const handleClearLogs = () => {
    interactionLog.clearLogs();
    setLogs([]);
    showToast('Logs cleared', 'success');
  };

  // Export logs
  const handleExportLogs = () => {
    const exportData = interactionLog.exportLogs();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mocati-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Logs exported', 'success');
  };

  const appStyle = {
    minHeight: '100vh',
    background: darkMode ? '#1f2937' : '#f9fafb',
    color: darkMode ? '#f9fafb' : '#1f2937',
    transition: 'all 0.3s ease'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`
  };

  const toastContainerStyle = {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const getToastStyle = (type) => ({
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    background: type === 'success' ? '#10b981' : 
                type === 'error' ? '#ef4444' : 
                type === 'warning' ? '#f59e0b' : '#3b82f6'
  });

  return (
    <div style={appStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              MOCATI Light
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.7 }}>
              Plugin platform for MockOps
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={toggleDarkMode}
              style={{
                padding: '0.5rem 1rem',
                background: darkMode ? '#374151' : '#e5e7eb',
                color: darkMode ? '#f9fafb' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {darkMode ? '🌙' : '☀️'} {darkMode ? 'Light' : 'Dark'} Mode
            </button>
            
            <button
              onClick={handleClearLogs}
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🗑️ Clear Logs
            </button>
            
            <button
              onClick={handleExportLogs}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              📥 Export Logs
            </button>
          </div>
        </header>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            background: darkMode ? '#374151' : 'white',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Plugins</h3>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              {plugins.length}
            </p>
          </div>
          
          <div style={{
            padding: '1rem',
            background: darkMode ? '#374151' : 'white',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Logs</h3>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              {logs.length}
            </p>
          </div>
          
          <div style={{
            padding: '1rem',
            background: darkMode ? '#374151' : 'white',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Success Rate</h3>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              {interactionLog.getStats().successRate}%
            </p>
          </div>
        </div>

        {/* Plugins Grid */}
        <section>
          <h2 style={{ marginBottom: '1rem' }}>Plugins</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {plugins.map(plugin => (
              <PluginCard
                key={plugin.name}
                plugin={plugin}
                status={pluginStatus[plugin.name] || 'idle'}
                onRun={handleRunPlugin}
                onViewLogs={handleViewLogs}
              />
            ))}
          </div>
        </section>

        {/* Recent Logs */}
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Recent Logs</h2>
          <div style={{
            background: darkMode ? '#374151' : 'white',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {logs.length === 0 ? (
              <p style={{ padding: '1rem', textAlign: 'center', opacity: 0.7 }}>
                No logs available
              </p>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{log.plugin}</span>
                    <span style={{ margin: '0 0.5rem', opacity: 0.7 }}>-</span>
                    <span style={{
                      color: log.status === 'success' ? '#10b981' : '#ef4444'
                    }}>
                      {log.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Toast Container */}
      <div style={toastContainerStyle}>
        {toasts.map(toast => (
          <div key={toast.id} style={getToastStyle(toast.type)}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 