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
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Market Dashboard</h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm ml-2">
              <Activity className="w-4 h-4 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground">Real-time overview of global markets - US & India</p>
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
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-4 hover:from-primary/30 hover:to-secondary/30 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Radio className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Live Market Data Table</p>
                    <p className="text-sm text-muted-foreground">
                      View detailed real-time prices for NIFTY 50, SENSEX, RELIANCE, TCS, INFOSYS
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Market Sentiment</p>
                <h3 className="text-2xl mb-1">{sentiment.sentiment}</h3>
                <p className="text-sm text-muted-foreground">
                  Fear & Greed Index: {sentiment.fearGreedIndex.toFixed(0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">VIX (Volatility)</p>
                <p className="text-2xl">{sentiment.volatilityIndex.toFixed(2)}</p>
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
          <h2 className="text-2xl mb-4 flex items-center gap-2">
            🇺🇸 US Market Indices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h2 className="text-2xl mb-4 flex items-center gap-2">
            🇮🇳 Indian Market Indices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <h2 className="text-2xl mb-4">Other Global Indices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h2 className="text-2xl mb-4">Top Movers (US & India)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStocks.map((stock, i) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <GlassCard hover className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                      {stock.exchange}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-medium">{formatPrice(stock.price)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stock.change >= 0 ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="w-6 h-6 text-success" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-destructive" />
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