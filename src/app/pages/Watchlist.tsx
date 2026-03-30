import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, X, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { GlassCard } from '../components/GlassCard';
import { MarketStatusBar } from '../components/MarketStatusBar';
import { getMockStocks, realtimeStore } from '../services/mockData';
import type { Stock } from '../services/mockData';
import { Link } from 'react-router';

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);

  useEffect(() => {
    // Get mix of US and Indian stocks for watchlist
    const usStocks = getMockStocks(4, 'US');
    const inStocks = getMockStocks(4, 'IN');
    const stocks = [...usStocks, ...inStocks];
    setWatchlist(stocks);

    // Subscribe to real-time updates for all watchlist items
    const unsubscribeFns = stocks.map(stock => 
      realtimeStore.subscribe(stock.symbol, (data) => {
        setWatchlist(prevWatchlist => 
          prevWatchlist.map(s => 
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

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s.symbol !== symbol));
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    return `₹${(marketCap / 1e12).toFixed(2)}T`;
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Watchlist</h1>
            <span className="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-success/20 text-success text-xs sm:text-sm ml-auto sm:ml-2">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" />
              <span className="hidden xs:inline">LIVE</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Track your favorite US & Indian stocks with live price updates</p>
        </motion.div>

        {/* Market Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <MarketStatusBar />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {watchlist.map((stock, index) => {
            const isPositive = stock.change >= 0;
            
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard hover glow={isPositive ? 'green' : 'red'} className="relative group h-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
                    onClick={() => removeFromWatchlist(stock.symbol)}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  <Link to={`/chart?symbol=${stock.symbol}`}>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center flex-shrink-0`}>
                          {isPositive ? (
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm sm:text-base">{stock.symbol}</h3>
                            <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded bg-primary/10 text-primary flex-shrink-0">
                              {stock.exchange}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl sm:text-3xl tabular-nums mb-1">
                          {formatPrice(stock.price)}
                        </div>
                        <div className={`flex items-center gap-2 text-xs sm:text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-border text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">Volume</p>
                          <p className="tabular-nums font-semibold">{(stock.volume / 1e6).toFixed(2)}M</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-0.5 sm:mb-1 text-xs">Market Cap</p>
                          <p className="tabular-nums font-semibold">{formatMarketCap(stock.marketCap)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};