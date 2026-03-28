import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, TrendingDown, Globe, Activity } from 'lucide-react';
import { Input } from '../components/ui/input';
import { GlassCard } from '../components/GlassCard';
import { MarketStatusBar } from '../components/MarketStatusBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { getMockStocks, realtimeStore } from '../services/mockData';
import type { Stock, Market } from '../services/mockData';
import { Link } from 'react-router';

export const StockExplorer: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<Market>('US');

  useEffect(() => {
    const initialStocks = getMockStocks(50);
    setStocks(initialStocks);

    // Subscribe to real-time updates for all stocks
    const unsubscribeFns = initialStocks.map(stock => 
      realtimeStore.subscribe(stock.symbol, (data) => {
        setStocks(prevStocks => 
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
  }, []);

  const filteredStocks = stocks.filter(
    (stock) =>
      (stock.market === selectedMarket) &&
      (stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    return `₹${(marketCap / 1e12).toFixed(2)}T`;
  };

  const renderStockList = (market: Market) => {
    const marketStocks = filteredStocks;

    return (
      <div className="space-y-6">
        {/* Market Status Bar */}
        <MarketStatusBar />
        
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground px-4 mb-4">
            <div className="flex-1">Symbol / Name</div>
            <div className="w-24 text-right">Exchange</div>
            <div className="w-32 text-right">Price (₹)</div>
            <div className="w-32 text-right">Change (₹)</div>
            <div className="w-32 text-right">% Change</div>
            <div className="w-40 text-right">Market Cap</div>
          </div>

          <div className="space-y-4">
            {marketStocks.map((stock, index) => {
              const isPositive = stock.change >= 0;
              
              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link to={`/chart?symbol=${stock.symbol}`}>
                    <GlassCard hover className="group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center`}>
                            {isPositive ? (
                              <TrendingUp className="w-6 h-6 text-success" />
                            ) : (
                              <TrendingDown className="w-6 h-6 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {stock.symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>

                        <div className="w-24 text-right text-sm">
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                            {stock.exchange}
                          </span>
                        </div>

                        <div className="w-32 text-right tabular-nums font-medium">
                          {formatPrice(stock.price)}
                        </div>

                        <div className={`w-32 text-right tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}₹{Math.abs(stock.change).toFixed(2)}
                        </div>

                        <div className={`w-32 text-right tabular-nums font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>

                        <div className="w-40 text-right text-sm text-muted-foreground tabular-nums">
                          {formatMarketCap(stock.marketCap)}
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {marketStocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? `No stocks found matching "${searchTerm}"` : 'Loading stocks...'}
              </p>
            </div>
          )}
        </>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Stock Explorer</h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm ml-2">
              <Activity className="w-4 h-4 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground">Browse and analyze stocks from India and US markets with real-time prices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-md border-border"
            />
          </div>
        </motion.div>

        <Tabs value={selectedMarket} onValueChange={(value) => setSelectedMarket(value as Market)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="US" className="text-base">
              🇺🇸 US Stocks (NYSE/NASDAQ)
            </TabsTrigger>
            <TabsTrigger value="IN" className="text-base">
              🇮🇳 Indian Stocks (NSE)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="US" className="mt-8">
            {renderStockList('US')}
          </TabsContent>

          <TabsContent value="IN" className="mt-8">
            {renderStockList('IN')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};