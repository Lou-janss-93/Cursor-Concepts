// PluginCard.js - Plugin display component

import React from 'react';

const PluginCard = ({ plugin, onRun, onViewLogs, status = 'idle' }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'idle':
      default:
        return '⏸️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'idle':
      default:
        return '#6b7280';
    }
  };

  const handleRun = () => {
    if (onRun) {
      onRun(plugin.name);
    }
  };

  const handleViewLogs = () => {
    if (onViewLogs) {
      onViewLogs(plugin.name);
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem',
      background: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      minWidth: '200px'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>{plugin.icon || '🔌'}</span>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {plugin.name}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              v{plugin.version}
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <span style={{
            fontSize: '1rem',
            color: getStatusColor(status)
          }}>
            {getStatusIcon(status)}
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: getStatusColor(status),
            textTransform: 'capitalize'
          }}>
            {status}
          </span>
        </div>
      </div>

      {plugin.description && (
        <p style={{
          margin: '0.5rem 0',
          fontSize: '0.875rem',
          color: '#4b5563',
          lineHeight: '1.4'
        }}>
          {plugin.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem'
      }}>
        <button
          onClick={handleRun}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#2563eb'}
          onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
        >
          Run Plugin
        </button>
        
        <button
          onClick={handleViewLogs}
          style={{
            padding: '0.5rem 1rem',
            background: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#e5e7eb';
            e.target.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#f3f4f6';
            e.target.style.borderColor = '#d1d5db';
          }}
        >
          View Logs
        </button>
      </div>

      {plugin.actions && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: '#6b7280'
        }}>
          <strong>Actions:</strong> {plugin.actions.join(', ')}
        </div>
      )}
    </div>
  );
};

export default PluginCard; 