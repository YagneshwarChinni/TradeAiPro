// NSE Data Fetching Service
// Supports multiple data providers: NSE India, Alpha Vantage, Twelve Data, etc.

interface StockQuote {
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

interface IndexQuote {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

// Fetch from NSE India official API (no API key required for some endpoints)
async function fetchFromNSEIndia(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`NSE API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    return {
      symbol: data.info?.symbol || symbol,
      name: data.info?.companyName || symbol,
      price: data.priceInfo?.lastPrice || 0,
      change: data.priceInfo?.change || 0,
      changePercent: data.priceInfo?.pChange || 0,
      volume: data.preOpenMarket?.totalTradedVolume || 0,
      marketCap: data.metadata?.marketCap || 0,
      high: data.priceInfo?.intraDayHighLow?.max || 0,
      low: data.priceInfo?.intraDayHighLow?.min || 0,
      open: data.priceInfo?.open || 0,
      exchange: 'NSE',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching NSE data for ${symbol}:`, error);
    return null;
  }
}

// Fetch NSE indices
async function fetchNSEIndices(): Promise<IndexQuote[]> {
  try {
    const url = 'https://www.nseindia.com/api/allIndices';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`NSE Indices API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Extract NIFTY 50 and NIFTY BANK
    const indices = data.data
      .filter((idx: any) => ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT'].includes(idx.index))
      .map((idx: any) => ({
        symbol: idx.index.replace(' ', ''),
        name: idx.index,
        value: idx.last || 0,
        change: idx.change || 0,
        changePercent: idx.percentChange || 0,
        timestamp: new Date().toISOString(),
      }));

    return indices;
  } catch (error) {
    console.error('Error fetching NSE indices:', error);
    return [];
  }
}

// Fetch from Alpha Vantage (supports both NSE and US stocks)
async function fetchFromAlphaVantage(symbol: string, exchange: 'NSE' | 'NYSE' | 'NASDAQ'): Promise<StockQuote | null> {
  try {
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY not set');
      return null;
    }

    // For NSE stocks, append .BSE or use NSE prefix
    const adjustedSymbol = exchange === 'NSE' ? `${symbol}.BSE` : symbol;
    
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${adjustedSymbol}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Alpha Vantage API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const quote = data['Global Quote'];

    if (!quote || Object.keys(quote).length === 0) {
      console.error('No data returned from Alpha Vantage');
      return null;
    }

    const price = parseFloat(quote['05. price'] || '0');
    const change = parseFloat(quote['09. change'] || '0');
    const changePercent = parseFloat((quote['10. change percent'] || '0').replace('%', ''));

    return {
      symbol: symbol,
      name: symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: parseInt(quote['06. volume'] || '0'),
      marketCap: 0, // Not provided by Alpha Vantage in GLOBAL_QUOTE
      high: parseFloat(quote['03. high'] || '0'),
      low: parseFloat(quote['04. low'] || '0'),
      open: parseFloat(quote['02. open'] || '0'),
      exchange: exchange,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error);
    return null;
  }
}

// Fetch from Twelve Data (supports NSE and global stocks)
async function fetchFromTwelveData(symbol: string, exchange: 'NSE' | 'NYSE' | 'NASDAQ'): Promise<StockQuote | null> {
  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      console.error('TWELVE_DATA_API_KEY not set');
      return null;
    }

    const url = `https://api.twelvedata.com/quote?symbol=${symbol}&exchange=${exchange}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Twelve Data API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.code === 400 || data.status === 'error') {
      console.error('Twelve Data error:', data.message);
      return null;
    }

    const price = parseFloat(data.close || '0');
    const open = parseFloat(data.open || '0');
    const change = price - open;
    const changePercent = open > 0 ? (change / open) * 100 : 0;

    return {
      symbol: data.symbol || symbol,
      name: data.name || symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: parseInt(data.volume || '0'),
      marketCap: 0,
      high: parseFloat(data.high || '0'),
      low: parseFloat(data.low || '0'),
      open: open,
      exchange: exchange,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching Twelve Data for ${symbol}:`, error);
    return null;
  }
}

// Main function to fetch stock data with fallback
export async function fetchStockData(
  symbol: string,
  exchange: 'NSE' | 'NYSE' | 'NASDAQ' = 'NSE'
): Promise<StockQuote | null> {
  // Try NSE India API first for NSE stocks (free, no API key)
  if (exchange === 'NSE') {
    const nseData = await fetchFromNSEIndia(symbol);
    if (nseData) return nseData;
  }

  // Try Twelve Data (best coverage for NSE stocks)
  const twelveData = await fetchFromTwelveData(symbol, exchange);
  if (twelveData) return twelveData;

  // Fallback to Alpha Vantage
  const alphaData = await fetchFromAlphaVantage(symbol, exchange);
  if (alphaData) return alphaData;

  return null;
}

// Fetch multiple stocks
export async function fetchMultipleStocks(
  symbols: Array<{ symbol: string; exchange: 'NSE' | 'NYSE' | 'NASDAQ' }>
): Promise<StockQuote[]> {
  const promises = symbols.map(({ symbol, exchange }) => 
    fetchStockData(symbol, exchange)
  );
  
  const results = await Promise.all(promises);
  return results.filter((quote): quote is StockQuote => quote !== null);
}

// Fetch NSE market indices
export async function fetchIndices(): Promise<IndexQuote[]> {
  return await fetchNSEIndices();
}

// Fetch top gainers from NSE
export async function fetchTopGainers(limit: number = 10): Promise<StockQuote[]> {
  try {
    const url = 'https://www.nseindia.com/api/live-analysis-variations?index=gainers';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const gainers = data.NIFTY?.data?.slice(0, limit) || [];

    return gainers.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.meta?.companyName || stock.symbol,
      price: stock.lastPrice || 0,
      change: stock.change || 0,
      changePercent: stock.pChange || 0,
      volume: stock.totalTradedVolume || 0,
      marketCap: 0,
      high: stock.dayHigh || 0,
      low: stock.dayLow || 0,
      open: stock.open || 0,
      exchange: 'NSE',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return [];
  }
}

// Fetch top losers from NSE
export async function fetchTopLosers(limit: number = 10): Promise<StockQuote[]> {
  try {
    const url = 'https://www.nseindia.com/api/live-analysis-variations?index=losers';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const losers = data.NIFTY?.data?.slice(0, limit) || [];

    return losers.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.meta?.companyName || stock.symbol,
      price: stock.lastPrice || 0,
      change: stock.change || 0,
      changePercent: stock.pChange || 0,
      volume: stock.totalTradedVolume || 0,
      marketCap: 0,
      high: stock.dayHigh || 0,
      low: stock.dayLow || 0,
      open: stock.open || 0,
      exchange: 'NSE',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching top losers:', error);
    return [];
  }
}
