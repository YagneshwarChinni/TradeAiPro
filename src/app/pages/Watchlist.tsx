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
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Watchlist</h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm ml-2">
              <Activity className="w-4 h-4 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground">Track your favorite US & Indian stocks with live price updates</p>
        </motion.div>

        {/* Market Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <MarketStatusBar />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlist.map((stock, index) => {
            const isPositive = stock.change >= 0;
            
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard hover glow={isPositive ? 'green' : 'red'} className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 h-auto"
                    onClick={() => removeFromWatchlist(stock.symbol)}
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <Link to={`/chart?symbol=${stock.symbol}`}>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center`}>
                          {isPositive ? (
                            <TrendingUp className="w-6 h-6 text-success" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="mb-1">{stock.symbol}</h3>
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {stock.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{stock.name}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-3xl tabular-nums mb-1">
                          {formatPrice(stock.price)}
                        </div>
                        <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Volume</p>
                          <p className="tabular-nums">{(stock.volume / 1e6).toFixed(2)}M</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Market Cap</p>
                          <p className="tabular-nums">{formatMarketCap(stock.marketCap)}</p>
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