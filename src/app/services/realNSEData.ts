// Real NSE Data Service - connects to backend API
// Falls back to mock data if backend is unavailable

interface RealStockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  exchange: string;
  timestamp: string;
}

interface RealIndexQuote {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

// Check if backend is available
let backendAvailable = false;

async function checkBackendHealth(): Promise<boolean> {
  try {
    const projectId = 'mpmfxxkautzsqzfartip';
    const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWZ4eGthdXR6c3F6ZmFydGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTE2MzMsImV4cCI6MjA5MDE2NzYzM30.QIgm2HaBWbtYKaMXGVE7fTQEpob3TVyePCQVOpsr_g4';
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1386e4ec/health`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.warn('Backend not available, using mock data');
    return false;
  }
}

// Initialize backend check
checkBackendHealth().then(available => {
  backendAvailable = available;
});

// Mock data generators for fallback
function generateMockIndexData(): RealIndexQuote[] {
  return [
    {
      symbol: 'NIFTY50',
      name: 'NIFTY 50',
      value: 24234.56 + (Math.random() - 0.5) * 100,
      change: (Math.random() - 0.5) * 200,
      changePercent: (Math.random() - 0.5) * 2,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: 'NIFTYBANK',
      name: 'NIFTY BANK',
      value: 52345.78 + (Math.random() - 0.5) * 200,
      change: (Math.random() - 0.5) * 300,
      changePercent: (Math.random() - 0.5) * 2,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: 'NIFTYIT',
      name: 'NIFTY IT',
      value: 34567.89 + (Math.random() - 0.5) * 150,
      change: (Math.random() - 0.5) * 250,
      changePercent: (Math.random() - 0.5) * 2,
      timestamp: new Date().toISOString(),
    },
  ];
}

function generateMockStockData(symbol: string): RealStockQuote {
  const basePrice = Math.random() * 2000 + 500;
  const change = (Math.random() - 0.5) * 50;
  
  return {
    symbol,
    name: `${symbol} Limited`,
    price: basePrice,
    change,
    changePercent: (change / basePrice) * 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 50000000000000) + 1000000000000,
    high: basePrice + Math.random() * 20,
    low: basePrice - Math.random() * 20,
    open: basePrice + (Math.random() - 0.5) * 10,
    exchange: 'NSE',
    timestamp: new Date().toISOString(),
  };
}

function generateTopGainers(limit: number): RealStockQuote[] {
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'WIPRO', 'TECHM', 'MARUTI', 'TITAN', 'BAJFINANCE'];
  return symbols.slice(0, limit).map(symbol => {
    const basePrice = Math.random() * 2000 + 500;
    const change = Math.random() * 50 + 10; // Always positive for gainers
    
    return {
      symbol,
      name: `${symbol} Limited`,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 50000000000000) + 1000000000000,
      high: basePrice + Math.random() * 20,
      low: basePrice - Math.random() * 20,
      open: basePrice - change,
      exchange: 'NSE',
      timestamp: new Date().toISOString(),
    };
  });
}

// Fetch NSE indices (NIFTY 50, NIFTY BANK, etc.)
export async function fetchNSEIndices(): Promise<RealIndexQuote[]> {
  try {
    if (!backendAvailable) {
      console.info('Using mock index data (backend not available)');
      return generateMockIndexData();
    }

    const projectId = 'mpmfxxkautzsqzfartip';
    const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWZ4eGthdXR6c3F6ZmFydGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTE2MzMsImV4cCI6MjA5MDE2NzYzM30.QIgm2HaBWbtYKaMXGVE7fTQEpob3TVyePCQVOpsr_g4';
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1386e4ec/indices`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.success ? data.data : generateMockIndexData();
  } catch (error) {
    console.info('Using mock index data (fetch failed)');
    return generateMockIndexData();
  }
}

// Fetch single stock quote
export async function fetchStockQuote(
  symbol: string,
  exchange: 'NSE' | 'NYSE' | 'NASDAQ' = 'NSE'
): Promise<RealStockQuote | null> {
  try {
    if (!backendAvailable) {
      console.info(`Using mock stock data for ${symbol} (backend not available)`);
      return generateMockStockData(symbol);
    }

    const projectId = 'mpmfxxkautzsqzfartip';
    const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWZ4eGthdXR6c3F6ZmFydGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTE2MzMsImV4cCI6MjA5MDE2NzYzM30.QIgm2HaBWbtYKaMXGVE7fTQEpob3TVyePCQVOpsr_g4';
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1386e4ec/quote/${symbol}?exchange=${exchange}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.success ? data.data : generateMockStockData(symbol);
  } catch (error) {
    console.info(`Using mock stock data for ${symbol} (fetch failed)`);
    return generateMockStockData(symbol);
  }
}

// Fetch multiple stock quotes
export async function fetchMultipleStockQuotes(
  symbols: Array<{ symbol: string; exchange: 'NSE' | 'NYSE' | 'NASDAQ' }>
): Promise<RealStockQuote[]> {
  try {
    if (!backendAvailable) {
      console.info('Using mock stock data (backend not available)');
      return symbols.map(({ symbol }) => generateMockStockData(symbol));
    }

    const projectId = 'mpmfxxkautzsqzfartip';
    const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWZ4eGthdXR6c3F6ZmFydGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTE2MzMsImV4cCI6MjA5MDE2NzYzM30.QIgm2HaBWbtYKaMXGVE7fTQEpob3TVyePCQVOpsr_g4';
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1386e4ec/quotes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols }),
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.success ? data.data : symbols.map(({ symbol }) => generateMockStockData(symbol));
  } catch (error) {
    console.info('Using mock stock data (fetch failed)');
    return symbols.map(({ symbol }) => generateMockStockData(symbol));
  }
}

// Fetch top gainers from NSE
export async function fetchTopGainers(limit: number = 10): Promise<RealStockQuote[]> {
  try {
    if (!backendAvailable) {
      console.info('Using mock top gainers data (backend not available)');
      return generateTopGainers(limit);
    }

    const projectId = 'mpmfxxkautzsqzfartip';
    const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWZ4eGthdXR6c3F6ZmFydGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTE2MzMsImV4cCI6MjA5MDE2NzYzM30.QIgm2HaBWbtYKaMXGVE7fTQEpob3TVyePCQVOpsr_g4';
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1386e4ec/top-gainers?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.success ? data.data : generateTopGainers(limit);
  } catch (error) {
    console.info('Using mock top gainers data (fetch failed)');
    return generateTopGainers(limit);
  }
}

// Fetch top losers from NSE
export async function fetchTopLosers(limit: number = 10): Promise<RealStockQuote[]> {
  try {
    if (!backendAvailable) {
      console.info('Using mock top losers data (backend not available)');
      return generateTopGainers(limit).map(stock => ({
        ...stock,
        change: -Math.abs(stock.change),
        changePercent: -Math.abs(stock.changePercent),
      }));
    }

    const projectId = 'mpmfxxkautzsqzfartip';
    const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbWZ4eGthdXR6c3F6ZmFydGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTE2MzMsImV4cCI6MjA5MDE2NzYzM30.QIgm2HaBWbtYKaMXGVE7fTQEpob3TVyePCQVOpsr_g4';
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-1386e4ec/top-losers?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.success ? data.data : generateTopGainers(limit).map(stock => ({
      ...stock,
      change: -Math.abs(stock.change),
      changePercent: -Math.abs(stock.changePercent),
    }));
  } catch (error) {
    console.info('Using mock top losers data (fetch failed)');
    return generateTopGainers(limit).map(stock => ({
      ...stock,
      change: -Math.abs(stock.change),
      changePercent: -Math.abs(stock.changePercent),
    }));
  }
}

// Convert USD prices to INR (approximate conversion)
const USD_TO_INR_RATE = 83;

export function convertUSDtoINR(usdPrice: number): number {
  return usdPrice * USD_TO_INR_RATE;
}

// Cache management for real-time data
class RealDataCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10000; // 10 seconds cache

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const realDataCache = new RealDataCache();

// Polling service for real-time updates
export class RealTimePollingService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Subscribe to real-time updates for a stock
  subscribe(
    symbol: string,
    exchange: 'NSE' | 'NYSE' | 'NASDAQ',
    callback: (data: RealStockQuote | null) => void,
    intervalMs: number = 10000 // Poll every 10 seconds
  ) {
    const key = `${symbol}-${exchange}`;

    // Add listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Start polling if not already started
    if (!this.intervals.has(key)) {
      // Fetch immediately
      fetchStockQuote(symbol, exchange).then(callback);

      // Set up polling
      const interval = setInterval(async () => {
        const data = await fetchStockQuote(symbol, exchange);
        const callbacks = this.listeners.get(key);
        if (callbacks) {
          callbacks.forEach(cb => cb(data));
        }
      }, intervalMs);

      this.intervals.set(key, interval);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        
        // If no more listeners, stop polling
        if (callbacks.size === 0) {
          const interval = this.intervals.get(key);
          if (interval) {
            clearInterval(interval);
            this.intervals.delete(key);
          }
          this.listeners.delete(key);
        }
      }
    };
  }

  // Subscribe to indices updates
  subscribeToIndices(
    callback: (data: RealIndexQuote[]) => void,
    intervalMs: number = 30000 // Poll every 30 seconds
  ) {
    const key = 'indices';

    // Add listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Start polling if not already started
    if (!this.intervals.has(key)) {
      // Fetch immediately
      fetchNSEIndices().then(callback);

      // Set up polling
      const interval = setInterval(async () => {
        const data = await fetchNSEIndices();
        const callbacks = this.listeners.get(key);
        if (callbacks) {
          callbacks.forEach(cb => cb(data));
        }
      }, intervalMs);

      this.intervals.set(key, interval);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        
        if (callbacks.size === 0) {
          const interval = this.intervals.get(key);
          if (interval) {
            clearInterval(interval);
            this.intervals.delete(key);
          }
          this.listeners.delete(key);
        }
      }
    };
  }

  // Clean up all subscriptions
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
  }
}

export const realTimePoller = new RealTimePollingService();