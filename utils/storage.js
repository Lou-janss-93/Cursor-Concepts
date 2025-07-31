// storage.js - Local storage utilities

class StorageManager {
  constructor() {
    this.storageKey = 'mocati-light-data';
    this.logsKey = 'mocati-light-logs';
    this.settingsKey = 'mocati-light-settings';
  }

  // Save logs to localStorage
  saveLogs(logs) {
    try {
      const data = {
        logs: logs,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.logsKey, JSON.stringify(data));
      console.log(`${logs.length} logs saved to localStorage`);
      return true;
    } catch (error) {
      console.error('Error saving logs:', error);
      return false;
    }
  }

  // Load logs from localStorage
  loadLogs() {
    try {
      const data = localStorage.getItem(this.logsKey);
      if (!data) {
        console.log('No logs found in localStorage');
        return [];
      }
      
      const parsed = JSON.parse(data);
      console.log(`${parsed.logs?.length || 0} logs loaded from localStorage`);
      return parsed.logs || [];
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  }

  // Save settings
  saveSettings(settings) {
    try {
      const data = {
        settings: settings,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(data));
      console.log('Settings saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  // Load settings
  loadSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      if (!data) {
        console.log('No settings found in localStorage');
        return {};
      }
      
      const parsed = JSON.parse(data);
      console.log('Settings loaded from localStorage');
      return parsed.settings || {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  // Save single setting
  saveSetting(key, value) {
    try {
      const settings = this.loadSettings();
      settings[key] = value;
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  }

  // Load single setting
  loadSetting(key, defaultValue = null) {
    try {
      const settings = this.loadSettings();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    } catch (error) {
      console.error('Error loading setting:', error);
      return defaultValue;
    }
  }

  // Clear all data
  clearAll() {
    try {
      localStorage.removeItem(this.logsKey);
      localStorage.removeItem(this.settingsKey);
      localStorage.removeItem(this.storageKey);
      console.log('All localStorage data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const logsData = localStorage.getItem(this.logsKey);
      const settingsData = localStorage.getItem(this.settingsKey);
      
      const logsSize = logsData ? new Blob([logsData]).size : 0;
      const settingsSize = settingsData ? new Blob([settingsData]).size : 0;
      const totalSize = logsSize + settingsSize;
      
      return {
        logsSize: logsSize,
        settingsSize: settingsSize,
        totalSize: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        logsCount: logsData ? JSON.parse(logsData).logs?.length || 0 : 0
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        logsSize: 0,
        settingsSize: 0,
        totalSize: 0,
        totalSizeKB: '0.00',
        logsCount: 0
      };
    }
  }

  // Export all data
  exportData() {
    try {
      const data = {
        logs: this.loadLogs(),
        settings: this.loadSettings(),
        storageInfo: this.getStorageInfo(),
        exportTimestamp: Date.now(),
        version: '1.0'
      };
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data
  importData(data) {
    try {
      if (data.logs) {
        this.saveLogs(data.logs);
      }
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      console.log('Data successfully imported');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Backup logs
  backupLogs() {
    try {
      const logs = this.loadLogs();
      const backup = {
        logs: logs,
        backupTimestamp: Date.now(),
        version: '1.0'
      };
      
      const backupKey = `mocati-light-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      console.log(`Backup created with key: ${backupKey}`);
      return backupKey;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  // Restore from backup
  restoreFromBackup(backupKey) {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const backup = JSON.parse(backupData);
      if (backup.logs) {
        this.saveLogs(backup.logs);
        console.log('Backup successfully restored');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  // List all backups
  listBackups() {
    try {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mocati-light-backup-')) {
          const data = localStorage.getItem(key);
          if (data) {
            const backup = JSON.parse(data);
            backups.push({
              key: key,
              timestamp: backup.backupTimestamp,
              logsCount: backup.logs?.length || 0,
              date: new Date(backup.backupTimestamp).toLocaleString('en-US')
            });
          }
        }
      }
      
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }
}

// Create singleton instance
const storageManager = new StorageManager();

export default storageManager; 