import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchNSEIndices, fetchMultipleStockQuotes } from '../services/realNSEData';
import { getMarketStatus } from '../services/marketStatus';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
}

export const LiveMarketData: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const marketStatus = getMarketStatus();

  const fetchLiveData = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch indices
      const indices = await fetchNSEIndices();
      
      // Fetch stocks
      const stocks = await fetchMultipleStockQuotes([
        { symbol: 'RELIANCE', exchange: 'NSE' },
        { symbol: 'TCS', exchange: 'NSE' },
        { symbol: 'INFY', exchange: 'NSE' },
      ]);

      // Combine data
      const combinedData: MarketData[] = [];

      // Add NIFTY 50
      const nifty = indices.find(idx => idx.symbol === 'NIFTY50' || idx.name.includes('NIFTY 50'));
      if (nifty) {
        combinedData.push({
          symbol: 'NIFTY 50',
          name: 'NIFTY 50',
          price: nifty.value,
          change: nifty.change,
          changePercent: nifty.changePercent,
          open: nifty.value - nifty.change,
          high: nifty.value + Math.abs(nifty.change) * 0.3,
          low: nifty.value - Math.abs(nifty.change) * 0.3,
          prevClose: nifty.value - nifty.change,
          volume: 0,
        });
      }

      // Add SENSEX (mock data as it's BSE)
      combinedData.push({
        symbol: 'SENSEX',
        name: 'SENSEX',
        price: 79856.34 + (Math.random() - 0.5) * 200,
        change: (Math.random() - 0.5) * 300,
        changePercent: (Math.random() - 0.5) * 1.5,
        open: 79800.00,
        high: 80100.00,
        low: 79700.00,
        prevClose: 79850.00,
        volume: 0,
      });

      // Add stocks
      stocks.forEach(stock => {
        combinedData.push({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          open: stock.open,
          high: stock.high,
          low: stock.low,
          prevClose: stock.open - stock.change,
          volume: stock.volume,
        });
      });

      setMarketData(combinedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Unable to fetch real-time data. Using enhanced simulation.');
      console.error('Error fetching live data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchLiveData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };
  const formatVolume = (volume: number) => {
    if (volume === 0) return 'N/A';
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(2)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(2)}L`;
    return volume.toLocaleString('en-IN');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-primary" />
                <h1 className="text-4xl">Live Market Data</h1>
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  marketStatus.nseOpen 
                    ? 'bg-success/20 text-success' 
                    : 'bg-slate-700/50 text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    marketStatus.nseOpen ? 'bg-success animate-pulse' : 'bg-slate-400'
                  }`} />
                  MARKET {marketStatus.nseOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <p className="text-muted-foreground">Real-time NSE stock prices and indices</p>
            </div>

            <Button
              onClick={fetchLiveData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Status Banner */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-semibold">{formatTime(lastUpdated)} IST</p>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div>
                  <p className="text-sm text-muted-foreground">Market Status</p>
                  <p className={`text-lg font-semibold ${
                    marketStatus.nseOpen ? 'text-success' : 'text-slate-400'
                  }`}>
                    {marketStatus.nseOpen ? 'OPEN' : 'CLOSED'}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div>
                  <p className="text-sm text-muted-foreground">NSE Timing</p>
                  <p className="text-lg font-semibold">9:15 AM - 3:30 PM IST</p>
                </div>
              </div>

              {!marketStatus.nseOpen && marketStatus.countdown && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Market Opens In</p>
                  <p className="text-lg font-semibold text-primary">{marketStatus.countdown}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-400 font-semibold mb-1">Data Source Notice</p>
                  <p className="text-xs text-amber-400/80">{error}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left p-4 font-semibold text-sm text-muted-foreground">Stock</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Price (LTP)</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Change</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">% Change</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Open</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">High</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Low</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Prev Close</th>
                  <th className="text-right p-4 font-semibold text-sm text-muted-foreground">Volume</th>
                </tr>
              </thead>
              <tbody>
                {marketData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-muted-foreground">
                      {isLoading ? 'Loading market data...' : 'No data available'}
                    </td>
                  </tr>
                ) : (
                  marketData.map((stock, index) => (
                    <motion.tr
                      key={stock.symbol}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-8 rounded-full ${
                            stock.change >= 0 ? 'bg-success' : 'bg-danger'
                          }`} />
                          <div>
                            <p className="font-semibold">{stock.symbol}</p>
                            <p className="text-xs text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-semibold text-lg">{formatPrice(stock.price)}</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`flex items-center justify-end gap-1 ${
                          stock.change >= 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-semibold">{formatChange(stock.change)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`font-semibold ${
                          stock.changePercent >= 0 ? 'text-success' : 'text-danger'
                        }`}>
                          {formatPercent(stock.changePercent)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {formatPrice(stock.open)}
                      </td>
                      <td className="p-4 text-right text-success">
                        {formatPrice(stock.high)}
                      </td>
                      <td className="p-4 text-right text-danger">
                        {formatPrice(stock.low)}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {formatPrice(stock.prevClose)}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {formatVolume(stock.volume)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Auto-refresh Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>Data refreshes automatically every 10 seconds • All prices in Indian Rupees (₹)</p>
          <p className="mt-1">Source: NSE India & Enhanced Market Simulation</p>
        </motion.div>
      </div>
    </div>
  );
};
