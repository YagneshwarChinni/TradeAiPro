// Mock data service for stock trading platform
import { getNSEMarketStatus, getUSMarketStatus } from './marketStatus';

export type Market = 'US' | 'IN';

export interface Stock {
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
  market: Market;
  exchange?: string;
}

export interface IndexData {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  market?: Market;
}

export interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume24h: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  summary: string;
  url: string;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
  market: Market;
  exchange?: string;
}

// Real-time price store for consistent updates across the platform
class RealTimePriceStore {
  private prices: Map<string, { price: number; basePrice: number; open: number; high: number; low: number; dayStart: number; market: Market }> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private lastUpdateTime: Date = new Date();

  constructor() {
    this.startUpdates();
  }

  private startUpdates() {
    // Update prices every 2 seconds, but only if market is open
    this.updateInterval = setInterval(() => {
      const nseStatus = getNSEMarketStatus();
      const usStatus = getUSMarketStatus();
      this.lastUpdateTime = new Date();

      this.prices.forEach((data, symbol) => {
        // Only update if the respective market is open
        const shouldUpdate = 
          (data.market === 'IN' && nseStatus.isOpen) ||
          (data.market === 'US' && usStatus.isOpen);

        if (!shouldUpdate) {
          return; // Skip update if market is closed
        }

        // Simulate realistic price movement (0.05% - 0.2% per update)
        // More volatility for small cap stocks
        const baseVolatility = data.price < 1000 ? 0.003 : 0.002;
        const volatility = baseVolatility;
        const change = (Math.random() - 0.5) * 2 * volatility * data.price;
        const newPrice = data.price + change;
        
        // Update high/low for the day
        const high = Math.max(data.high, newPrice);
        const low = Math.min(data.low, newPrice);
        
        this.prices.set(symbol, {
          ...data,
          price: newPrice,
          high,
          low,
        });

        // Notify listeners
        const symbolListeners = this.listeners.get(symbol);
        if (symbolListeners) {
          const changeFromOpen = newPrice - data.open;
          const changePercentFromOpen = (changeFromOpen / data.open) * 100;
          
          symbolListeners.forEach(callback => {
            callback({
              price: newPrice,
              change: changeFromOpen,
              changePercent: changePercentFromOpen,
              high,
              low,
              open: data.open,
              lastUpdate: this.lastUpdateTime,
            });
          });
        }
      });
    }, 2000);
  }

  initPrice(symbol: string, basePrice: number, market: Market) {
    if (!this.prices.has(symbol)) {
      const open = basePrice;
      this.prices.set(symbol, {
        price: basePrice,
        basePrice,
        open,
        high: basePrice * 1.002,
        low: basePrice * 0.998,
        dayStart: Date.now(),
        market,
      });
    }
    return this.prices.get(symbol)!;
  }

  subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    this.listeners.get(symbol)!.add(callback);

    // Return unsubscribe function
    return () => {
      const symbolListeners = this.listeners.get(symbol);
      if (symbolListeners) {
        symbolListeners.delete(callback);
      }
    };
  }

  getCurrentPrice(symbol: string): number {
    return this.prices.get(symbol)?.price || 0;
  }

  getMarketData(symbol: string) {
    return this.prices.get(symbol);
  }

  getLastUpdateTime(): Date {
    return this.lastUpdateTime;
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.prices.clear();
    this.listeners.clear();
  }
}

export const realtimeStore = new RealTimePriceStore();

// Generate mock indices data with real-time support
export const getMockIndices = (): IndexData[] => {
  const baseIndices = [
    { name: 'S&P 500', symbol: 'SPX', value: 5875.34 },
    { name: 'NASDAQ', symbol: 'NDX', value: 20458.67 },
    { name: 'Dow Jones', symbol: 'DJI', value: 43289.45 },
    { name: 'NIFTY 50', symbol: 'NIFTY', value: 24234.56 },
    { name: 'SENSEX', symbol: 'SENSEX', value: 79876.23 },
    { name: 'FTSE 100', symbol: 'FTSE', value: 8234.12 },
  ];

  return baseIndices.map(index => {
    // Initialize real-time price
    realtimeStore.initPrice(index.symbol, index.value, 'US');
    
    return {
      ...index,
      change: (Math.random() - 0.4) * 100,
      changePercent: (Math.random() - 0.4) * 2,
      sparkline: Array.from({ length: 20 }, () => Math.random() * 100 + index.value - 50),
    };
  });
};

// Generate mock stock data with real-time support
export const getMockStocks = (count: number = 50, market?: Market): Stock[] => {
  const usCompanies = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', exchange: 'NYSE' },
    { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
    { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
    { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE' },
    { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE' },
    { symbol: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE' },
    { symbol: 'DIS', name: 'Walt Disney Company', exchange: 'NYSE' },
    { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE' },
    { symbol: 'PYPL', name: 'PayPal Holdings', exchange: 'NASDAQ' },
    { symbol: 'BAC', name: 'Bank of America', exchange: 'NYSE' },
    { symbol: 'VZ', name: 'Verizon Communications', exchange: 'NYSE' },
    { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
    { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' },
    { symbol: 'KO', name: 'Coca-Cola Company', exchange: 'NYSE' },
    { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE' },
    { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
  ];

  const indianCompanies = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE' },
    { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', exchange: 'NSE' },
    { symbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE' },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', exchange: 'NSE' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', exchange: 'NSE' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', exchange: 'NSE' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', exchange: 'NSE' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', exchange: 'NSE' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', exchange: 'NSE' },
    { symbol: 'TITAN', name: 'Titan Company Ltd', exchange: 'NSE' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', exchange: 'NSE' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', exchange: 'NSE' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', exchange: 'NSE' },
    { symbol: 'NTPC', name: 'NTPC Ltd', exchange: 'NSE' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp', exchange: 'NSE' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd', exchange: 'NSE' },
  ];

  let companies = market === 'US' ? usCompanies : market === 'IN' ? indianCompanies : [...usCompanies, ...indianCompanies];
  companies = companies.slice(0, count);

  return companies.map(({ symbol, name, exchange }) => {
    const isIndian = exchange === 'NSE' || exchange === 'BSE';
    // All prices in INR - US stocks converted approximately at 1 USD = 83 INR
    const basePrice = isIndian 
      ? Math.random() * 3000 + 100  // Indian stocks in INR (100-3100)
      : (Math.random() * 500 + 50) * 83;    // US stocks converted to INR (4150-45650)
    
    // Initialize real-time price
    realtimeStore.initPrice(symbol, basePrice, isIndian ? 'IN' : 'US');
    const marketData = realtimeStore.getMarketData(symbol);
    
    const changePercent = (Math.random() - 0.45) * 5;
    const change = (basePrice * changePercent) / 100;

    return {
      symbol,
      name,
      price: marketData?.price || basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: isIndian
        ? Math.floor(Math.random() * 50000000000000) + 1000000000000  // In INR
        : Math.floor(Math.random() * 1000000000000) + 10000000000,   // In INR (converted)
      high: marketData?.high || basePrice + Math.random() * 10,
      low: marketData?.low || basePrice - Math.random() * 10,
      open: marketData?.open || basePrice + (Math.random() - 0.5) * 5,
      market: isIndian ? 'IN' as Market : 'US' as Market,
      exchange,
    };
  });
};

// Generate mock crypto data
export const getMockCrypto = (): CryptoData[] => {
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', basePrice: 67000 },
    { symbol: 'ETH', name: 'Ethereum', basePrice: 3400 },
    { symbol: 'SOL', name: 'Solana', basePrice: 145 },
    { symbol: 'BNB', name: 'Binance Coin', basePrice: 580 },
    { symbol: 'XRP', name: 'Ripple', basePrice: 0.62 },
    { symbol: 'ADA', name: 'Cardano', basePrice: 0.58 },
    { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.17 },
    { symbol: 'AVAX', name: 'Avalanche', basePrice: 38 },
  ];

  return cryptos.map(crypto => {
    const changePercent = (Math.random() - 0.45) * 10;
    const change = (crypto.basePrice * changePercent) / 100;

    return {
      ...crypto,
      price: crypto.basePrice,
      change,
      changePercent,
      marketCap: Math.floor(Math.random() * 500000000000) + 10000000000,
      volume24h: Math.floor(Math.random() * 50000000000) + 1000000000,
    };
  });
};

// Generate mock news
export const getMockNews = (market?: Market): NewsItem[] => {
  const usHeadlines = [
    'Fed Holds Interest Rates Steady, Signals Potential Cuts in 2026',
    'Tech Stocks Rally on Strong AI Earnings Reports',
    'Major US Bank Announces Record Q1 Profits',
    'NASDAQ Hits New All-Time High on Tech Rally',
    'Apple Unveils Revolutionary AI Features in Latest Product Launch',
    'Tesla Reports Record Deliveries in Q1 2026',
    'US Retail Sales Data Exceeds Expectations',
    'Amazon Announces Major Expansion Plans',
  ];

  const indianHeadlines = [
    'RBI Maintains Repo Rate at 6.5%, Focuses on Inflation Control',
    'Reliance Industries Announces Major Green Energy Investment',
    'NIFTY 50 Crosses 24,000 Mark on Strong FII Inflows',
    'Tata Group Plans ₹50,000 Crore Investment in Semiconductor Manufacturing',
    'Indian IT Sector Shows Strong Growth in Q4 Results',
    'Adani Group Stocks Surge on Positive Quarterly Earnings',
    'HDFC Bank Reports Record Profit, Stock Hits New High',
    'Indian EV Market Expected to Grow 40% in 2026',
  ];

  const globalHeadlines = [
    'Oil Prices Surge Amid Middle East Tensions',
    'Cryptocurrency Market Sees Institutional Investment Surge',
    'Global Markets React to Trade Policy Changes',
    'Pharmaceutical Giant Receives FDA Approval for New Drug',
    'Economic Growth Forecast Revised Upward for 2026',
  ];

  let headlines: string[];
  if (market === 'US') {
    headlines = [...usHeadlines, ...globalHeadlines].slice(0, 10);
  } else if (market === 'IN') {
    headlines = [...indianHeadlines, ...globalHeadlines].slice(0, 10);
  } else {
    headlines = [...usHeadlines.slice(0, 3), ...indianHeadlines.slice(0, 3), ...globalHeadlines].slice(0, 10);
  }

  const sources = ['Bloomberg', 'Reuters', 'CNBC', 'Financial Times', 'WSJ', 'MarketWatch', 'Economic Times', 'Moneycontrol'];

  return headlines.map((headline, index) => ({
    id: `news-${index}`,
    headline,
    source: sources[Math.floor(Math.random() * sources.length)],
    publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    url: '#',
  }));
};

// Generate historical price data
export const generateHistoricalData = (
  basePrice: number,
  days: number,
  volatility: number = 0.02
): Array<{ time: string; value: number; open: number; high: number; low: number; close: number }> => {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const open = currentPrice;
    currentPrice += change;
    const high = currentPrice + Math.random() * volatility * currentPrice;
    const low = currentPrice - Math.random() * volatility * currentPrice;
    const close = currentPrice;

    data.push({
      time: date.toISOString().split('T')[0],
      value: close,
      open,
      high,
      low,
      close,
    });
  }

  return data;
};

// Generate real-time candlestick data generator
export function* generateRealtimeCandlestick(basePrice: number) {
  let currentPrice = basePrice;
  let candleOpen = basePrice;
  let candleHigh = basePrice;
  let candleLow = basePrice;
  
  while (true) {
    const volatility = 0.001;
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice += change;
    
    candleHigh = Math.max(candleHigh, currentPrice);
    candleLow = Math.min(candleLow, currentPrice);
    
    yield {
      time: Date.now() / 1000, // Timestamp in seconds
      open: candleOpen,
      high: candleHigh,
      low: candleLow,
      close: currentPrice,
    };
  }
}

// Generate intraday data
export const generateIntradayData = (
  basePrice: number,
  intervals: number = 390
): Array<{ time: string; value: number }> => {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();
  now.setHours(9, 30, 0, 0); // Market open

  for (let i = 0; i < intervals; i++) {
    const time = new Date(now.getTime() + i * 60 * 1000); // 1-minute intervals
    const change = (Math.random() - 0.5) * 0.002 * currentPrice;
    currentPrice += change;

    data.push({
      time: time.toISOString(),
      value: currentPrice,
    });
  }

  return data;
};

// Generate mock portfolio
export const getMockPortfolio = (): PortfolioItem[] => {
  // Get mix of US and Indian stocks
  const usStocks = getMockStocks(5, 'US');
  const inStocks = getMockStocks(5, 'IN');
  const stocks = [...usStocks, ...inStocks];
  
  return stocks.map(stock => {
    const quantity = Math.floor(Math.random() * 100) + 10;
    const avgPrice = stock.price * (0.9 + Math.random() * 0.2);
    const value = stock.price * quantity;
    const change = (stock.price - avgPrice) * quantity;
    const changePercent = ((stock.price - avgPrice) / avgPrice) * 100;

    return {
      symbol: stock.symbol,
      name: stock.name,
      quantity,
      avgPrice,
      currentPrice: stock.price,
      value,
      change,
      changePercent,
      market: stock.market,
      exchange: stock.exchange,
    };
  });
};

// AI Trading signals
export interface AISignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  bullishProbability: number;
  bearishProbability: number;
  riskScore: number;
  trendPrediction: string;
  supportLevel: number;
  resistanceLevel: number;
}

export const getAISignal = (stock: Stock): AISignal => {
  const bullish = Math.random() * 100;
  const bearish = 100 - bullish;
  
  let signal: 'BUY' | 'SELL' | 'HOLD';
  if (bullish > 65) signal = 'BUY';
  else if (bearish > 65) signal = 'SELL';
  else signal = 'HOLD';

  return {
    signal,
    confidence: Math.random() * 30 + 70,
    bullishProbability: bullish,
    bearishProbability: bearish,
    riskScore: Math.random() * 10,
    trendPrediction: bullish > 50 ? 'Upward Trend Expected' : 'Downward Trend Expected',
    supportLevel: stock.price * 0.95,
    resistanceLevel: stock.price * 1.05,
  };
};

// Market sentiment
export interface MarketSentiment {
  fearGreedIndex: number;
  sentiment: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  volatilityIndex: number;
}

export const getMarketSentiment = (): MarketSentiment => {
  const fearGreedIndex = Math.random() * 100;
  let sentiment: MarketSentiment['sentiment'];
  
  if (fearGreedIndex < 20) sentiment = 'Extreme Fear';
  else if (fearGreedIndex < 40) sentiment = 'Fear';
  else if (fearGreedIndex < 60) sentiment = 'Neutral';
  else if (fearGreedIndex < 80) sentiment = 'Greed';
  else sentiment = 'Extreme Greed';

  return {
    fearGreedIndex,
    sentiment,
    volatilityIndex: Math.random() * 50 + 10,
  };
};