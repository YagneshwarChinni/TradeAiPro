import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Database, Wifi, WifiOff, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';
import { fetchNSEIndices, fetchStockQuote } from '../services/realNSEData';

type DataMode = 'mock' | 'real';

interface DataModeToggleProps {
  currentMode: DataMode;
  onModeChange: (mode: DataMode) => void;
}

export function DataModeToggle({ currentMode, onModeChange }: DataModeToggleProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // Test NSE API connection
      const indices = await fetchNSEIndices();
      
      if (indices && indices.length > 0) {
        setConnectionStatus('connected');
        setErrorMessage('');
        return true;
      } else {
        setConnectionStatus('failed');
        setErrorMessage('Backend server not available. Using enhanced simulated data with realistic NSE stock information.');
        return false;
      }
    } catch (error) {
      setConnectionStatus('failed');
      setErrorMessage('Backend server not available. Using enhanced simulated data with realistic NSE stock information.');
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleModeChange = async (mode: DataMode) => {
    if (mode === 'real') {
      // Test connection first
      const success = await testConnection();
      if (success) {
        onModeChange(mode);
      } else {
        // Still allow "real" mode - it will use mock data fallback
        onModeChange(mode);
      }
    } else {
      onModeChange(mode);
      setConnectionStatus('idle');
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">Data Source</h3>
            <p className="text-xs text-muted-foreground">
              {currentMode === 'mock' ? 'Using simulated market data' : 'Using real NSE market data'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
              <Check className="w-3 h-3" />
              <span>Connected</span>
            </div>
          )}
          
          {connectionStatus === 'failed' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs">
              <WifiOff className="w-3 h-3" />
              <span>Connection Failed</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
            <Button
              size="sm"
              variant={currentMode === 'mock' ? 'default' : 'ghost'}
              className="h-8 text-xs"
              onClick={() => handleModeChange('mock')}
            >
              <Database className="w-3 h-3 mr-1.5" />
              Simulated
            </Button>
            <Button
              size="sm"
              variant={currentMode === 'real' ? 'default' : 'ghost'}
              className="h-8 text-xs"
              onClick={() => handleModeChange('real')}
              disabled={isTestingConnection}
            >
              <Wifi className="w-3 h-3 mr-1.5" />
              {isTestingConnection ? 'Testing...' : 'Real NSE Data'}
            </Button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-slate-700/50"
        >
          <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Connection Issue</p>
              <p className="text-amber-400/80">{errorMessage}</p>
              <p className="mt-2 text-amber-400/60">
                Note: NSE API may have rate limits or require authentication. The simulated data mode provides realistic market behavior for development and testing.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Create a context for data mode
import { createContext, useContext, ReactNode } from 'react';

interface DataModeContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [dataMode, setDataMode] = useState<DataMode>('mock');

  return (
    <DataModeContext.Provider value={{ dataMode, setDataMode }}>
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within DataModeProvider');
  }
  return context;
}