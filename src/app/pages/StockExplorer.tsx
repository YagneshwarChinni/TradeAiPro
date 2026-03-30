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
      <div className="space-y-4 sm:space-y-6">
        {/* Market Status Bar */}
        <MarketStatusBar />
        
        <>
          {/* Desktop Table Header */}
          <div className="hidden md:flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-3 sm:px-4 mb-4">
            <div className="flex-1">Symbol / Name</div>
            <div className="w-20 sm:w-24 text-right">Exchange</div>
            <div className="w-24 sm:w-32 text-right">Price (₹)</div>
            <div className="w-24 sm:w-32 text-right hidden lg:block">Change (₹)</div>
            <div className="w-20 sm:w-32 text-right">% Change</div>
            <div className="w-32 text-right hidden xl:block">Market Cap</div>
          </div>

          {/* Stock List */}
          <div className="space-y-3 sm:space-y-4">
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
                    {/* Desktop View */}
                    <GlassCard hover className="group hidden md:block">
                      <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex-1 flex items-center gap-2 sm:gap-4 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center flex-shrink-0`}>
                            {isPositive ? (
                              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                            ) : (
                              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium group-hover:text-primary transition-colors truncate">
                              {stock.symbol}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{stock.name}</p>
                          </div>
                        </div>

                        <div className="w-20 sm:w-24 text-right text-xs sm:text-sm flex-shrink-0">
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                            {stock.exchange}
                          </span>
                        </div>

                        <div className="w-24 sm:w-32 text-right tabular-nums font-medium text-xs sm:text-sm flex-shrink-0">
                          {formatPrice(stock.price)}
                        </div>

                        <div className={`w-24 sm:w-32 text-right tabular-nums text-xs sm:text-sm hidden lg:block flex-shrink-0 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}₹{Math.abs(stock.change).toFixed(2)}
                        </div>

                        <div className={`w-20 sm:w-32 text-right tabular-nums font-medium text-xs sm:text-sm flex-shrink-0 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>

                        <div className="w-32 text-right text-xs sm:text-sm text-muted-foreground tabular-nums hidden xl:block flex-shrink-0">
                          {formatMarketCap(stock.marketCap)}
                        </div>
                      </div>
                    </GlassCard>

                    {/* Mobile Card View */}
                    <GlassCard hover className="group md:hidden">
                      <div className="flex items-center gap-3 justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold group-hover:text-primary transition-colors">{stock.symbol}</p>
                            <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary flex-shrink-0">
                              {stock.exchange}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                        </div>
                        
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center flex-shrink-0`}>
                          {isPositive ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Price</p>
                          <p className="font-semibold text-sm">{formatPrice(stock.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-0.5">Change</p>
                          <p className={`font-semibold text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {marketStocks.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {searchTerm ? `No stocks found matching "${searchTerm}"` : 'Loading stocks...'}
              </p>
            </div>
          )}
        </>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Stock Explorer</h1>
            <span className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-success/20 text-success text-xs sm:text-sm ml-auto sm:ml-2">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" />
              <span className="hidden xs:inline">LIVE</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Browse and analyze stocks from India and US markets with real-time prices</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-12 h-10 sm:h-14 text-xs sm:text-base bg-card/50 backdrop-blur-md border-border"
            />
          </div>
        </motion.div>

        <Tabs value={selectedMarket} onValueChange={(value) => setSelectedMarket(value as Market)}>
          <TabsList className="grid w-full max-w-md sm:max-w-lg grid-cols-2">
            <TabsTrigger value="US" className="text-xs sm:text-base">
              🇺🇸 <span className="hidden sm:inline">US Stocks</span>
            </TabsTrigger>
            <TabsTrigger value="IN" className="text-xs sm:text-base">
              🇮🇳 <span className="hidden sm:inline">Indian Stocks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="US" className="mt-6 sm:mt-8">
            {renderStockList('US')}
          </TabsContent>

          <TabsContent value="IN" className="mt-6 sm:mt-8">
            {renderStockList('IN')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
