import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Globe, Radio, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { StockCard } from '../components/StockCard';
import { GlassCard } from '../components/GlassCard';
import { MarketStatusBar } from '../components/MarketStatusBar';
import { DataModeToggle, useDataMode } from '../components/DataModeToggle';
import { DataSourceInfo } from '../components/DataSourceInfo';
import { getMockIndices, getMockStocks, getMarketSentiment, realtimeStore } from '../services/mockData';
import { fetchNSEIndices, fetchTopGainers, realTimePoller } from '../services/realNSEData';
import type { IndexData, Stock } from '../services/mockData';

export const Dashboard: React.FC = () => {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [topStocks, setTopStocks] = useState<Stock[]>([]);
  const [sentiment, setSentiment] = useState(getMarketSentiment());
  const { dataMode, setDataMode } = useDataMode();

  useEffect(() => {
    if (dataMode === 'mock') {
      // Use mock data
      const allIndices = getMockIndices();
      setIndices(allIndices);
      
      // Get mix of US and Indian stocks
      const usStocks = getMockStocks(3, 'US');
      const inStocks = getMockStocks(3, 'IN');
      const stocks = [...usStocks, ...inStocks];
      setTopStocks(stocks);

      // Subscribe to real-time updates for all stocks
      const unsubscribeFns = stocks.map(stock => 
        realtimeStore.subscribe(stock.symbol, (data) => {
          setTopStocks(prevStocks => 
            prevStocks.map(s => 
              s.symbol === stock.symbol 
                ? { ...s, price: data.price, change: data.change, changePercent: data.changePercent, high: data.high, low: data.low }
                : s
            )
          );
        })
      );

      return () => {
        unsubscribeFns.forEach(fn => fn());
      };
    } else {
      // Use real NSE data
      const loadRealData = async () => {
        // Load indices
        const realIndices = await fetchNSEIndices();
        if (realIndices.length > 0) {
          setIndices(realIndices.map(idx => ({
            name: idx.name,
            symbol: idx.symbol,
            value: idx.value,
            change: idx.change,
            changePercent: idx.changePercent,
            sparkline: Array.from({ length: 20 }, () => Math.random() * 100 + idx.value - 50),
          })));
        }

        // Load top gainers
        const gainers = await fetchTopGainers(6);
        if (gainers.length > 0) {
          setTopStocks(gainers.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: stock.volume,
            marketCap: stock.marketCap,
            high: stock.high,
            low: stock.low,
            open: stock.open,
            market: stock.exchange === 'NSE' ? 'IN' : 'US',
            exchange: stock.exchange,
          })));
        }
      };

      loadRealData();

      // Subscribe to real-time updates
      const unsubscribeIndices = realTimePoller.subscribeToIndices((data) => {
        setIndices(data.map(idx => ({
          name: idx.name,
          symbol: idx.symbol,
          value: idx.value,
          change: idx.change,
          changePercent: idx.changePercent,
          sparkline: Array.from({ length: 20 }, () => Math.random() * 100 + idx.value - 50),
        })));
      }, 30000);

      return () => {
        unsubscribeIndices();
      };
    }
  }, [dataMode]);

  // Update sentiment every 5 seconds regardless of data mode
  useEffect(() => {
    const sentimentInterval = setInterval(() => {
      setSentiment(getMarketSentiment());
    }, 5000);

    return () => {
      clearInterval(sentimentInterval);
    };
  }, []);

  const usIndices = indices.filter(index => ['SPX', 'NDX', 'DJI'].includes(index.symbol));
  const indianIndices = indices.filter(index => ['NIFTY', 'SENSEX', 'NIFTY50', 'NIFTYBANK'].includes(index.symbol));
  const otherIndices = indices.filter(index => !['SPX', 'NDX', 'DJI', 'NIFTY', 'SENSEX', 'NIFTY50', 'NIFTYBANK'].includes(index.symbol));

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Market Dashboard</h1>
            <span className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-success/20 text-success text-xs sm:text-sm ml-auto sm:ml-2">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" />
              <span className="hidden xs:inline">LIVE</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Real-time overview of global markets - US & India</p>
        </motion.div>

        {/* Data Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <DataModeToggle currentMode={dataMode} onModeChange={setDataMode} />
        </motion.div>

        {/* Data Source Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <DataSourceInfo dataMode={dataMode} />
        </motion.div>

        {/* Quick Access to Live Market Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
        >
          <Link to="/live-data">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:from-primary/30 hover:to-secondary/30 transition-all cursor-pointer group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                    <Radio className="w-4 h-4 sm:w-6 sm:h-6 text-primary animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-semibold">Live Market Data Table</p>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      View detailed real-time prices for NIFTY 50, SENSEX, RELIANCE, TCS, INFOSYS
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Market Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MarketStatusBar />
        </motion.div>

        {/* Market Sentiment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard className="max-w-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Market Sentiment</p>
                <h3 className="text-xl sm:text-2xl mb-1">{sentiment.sentiment}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Fear & Greed Index: {sentiment.fearGreedIndex.toFixed(0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">VIX (Volatility)</p>
                <p className="text-xl sm:text-2xl">{sentiment.volatilityIndex.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-destructive via-yellow-500 to-success transition-all duration-500"
                style={{ width: `${sentiment.fearGreedIndex}%` }}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* US Indices */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 flex items-center gap-2">
            🇺🇸 <span>US Market Indices</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {usIndices.map((index, i) => (
              <motion.div
                key={index.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <StockCard
                  name={index.name}
                  symbol={index.symbol}
                  initialPrice={index.value}
                  initialChange={index.change}
                  initialChangePercent={index.changePercent}
                  sparkline={index.sparkline}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Indian Indices */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 flex items-center gap-2">
            🇮🇳 <span>Indian Market Indices</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {indianIndices.map((index, i) => (
              <motion.div
                key={index.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <StockCard
                  name={index.name}
                  symbol={index.symbol}
                  initialPrice={index.value}
                  initialChange={index.change}
                  initialChangePercent={index.changePercent}
                  sparkline={index.sparkline}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other Global Indices */}
        {otherIndices.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">Other Global Indices</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {otherIndices.map((index, i) => (
                <motion.div
                  key={index.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <StockCard
                    name={index.name}
                    symbol={index.symbol}
                    initialPrice={index.value}
                    initialChange={index.change}
                    initialChangePercent={index.changePercent}
                    sparkline={index.sparkline}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Top Movers */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">Top Movers (US & India)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {topStocks.map((stock, i) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <GlassCard hover className="group cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium group-hover:text-primary transition-colors truncate">{stock.symbol}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stock.name}</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs whitespace-nowrap ml-2">
                      {stock.exchange}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-medium">{formatPrice(stock.price)}</p>
                      <p className={`text-xs sm:text-sm ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${stock.change >= 0 ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center flex-shrink-0`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      ) : (
                        <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};