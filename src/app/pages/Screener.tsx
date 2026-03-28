import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { getMockStocks } from '../services/mockData';
import { Link } from 'react-router';

export const Screener: React.FC = () => {
  const [priceRange, setPriceRange] = useState('all');
  const [marketCap, setMarketCap] = useState('all');
  const [performance, setPerformance] = useState('all');

  const stocks = getMockStocks(30);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Filter className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Stock Screener</h1>
          </div>
          <p className="text-muted-foreground">Filter and discover stocks based on criteria</p>
        </motion.div>

        <GlassCard>
          <h2 className="text-xl mb-6">Filters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Price Range</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under50">Under $50</SelectItem>
                  <SelectItem value="50to200">$50 - $200</SelectItem>
                  <SelectItem value="over200">Over $200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Market Cap</Label>
              <Select value={marketCap} onValueChange={setMarketCap}>
                <SelectTrigger className="bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small Cap</SelectItem>
                  <SelectItem value="mid">Mid Cap</SelectItem>
                  <SelectItem value="large">Large Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Performance</Label>
              <Select value={performance} onValueChange={setPerformance}>
                <SelectTrigger className="bg-card/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="gainers">Top Gainers</SelectItem>
                  <SelectItem value="losers">Top Losers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          {stocks.map((stock, index) => {
            const isPositive = stock.change >= 0;
            
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link to={`/chart?symbol=${stock.symbol}`}>
                  <GlassCard hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center`}>
                          {isPositive ? (
                            <TrendingUp className="w-6 h-6 text-success" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{stock.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-xl tabular-nums">${stock.price.toFixed(2)}</p>
                        </div>
                        
                        <div className={`text-right ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          <p className="text-sm text-muted-foreground">Change</p>
                          <p className="text-xl tabular-nums">
                            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Market Cap</p>
                          <p className="text-xl tabular-nums">${(stock.marketCap / 1e9).toFixed(2)}B</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
