import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { MarketStatusBar } from '../components/MarketStatusBar';
import { getMockPortfolio, realtimeStore } from '../services/mockData';
import type { PortfolioItem } from '../services/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    const initialPortfolio = getMockPortfolio();
    setPortfolio(initialPortfolio);

    // Subscribe to real-time updates for all portfolio items
    const unsubscribeFns = initialPortfolio.map(item => 
      realtimeStore.subscribe(item.symbol, (data) => {
        setPortfolio(prevPortfolio => 
          prevPortfolio.map(p => {
            if (p.symbol === item.symbol) {
              const newValue = data.price * p.quantity;
              const newChange = (data.price - p.avgPrice) * p.quantity;
              const newChangePercent = ((data.price - p.avgPrice) / p.avgPrice) * 100;
              
              return {
                ...p,
                currentPrice: data.price,
                value: newValue,
                change: newChange,
                changePercent: newChangePercent,
              };
            }
            return p;
          })
        );
      })
    );

    return () => {
      unsubscribeFns.forEach(fn => fn());
    };
  }, []);

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  const formatValue = (value: number) => {
    return `₹${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0);
  const totalChange = portfolio.reduce((sum, item) => sum + item.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const pieData = portfolio.map(item => ({
    name: item.symbol,
    value: item.value,
  }));

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'];

  // Generate mock performance data
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: totalValue * (0.95 + Math.random() * 0.1),
  }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl">Portfolio</h1>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm">
              <Activity className="w-4 h-4 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground">Track your US & Indian investments and performance in real-time</p>
        </motion.div>

        {/* Market Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <MarketStatusBar />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard glow="blue">
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
              <p className="text-4xl tabular-nums mb-2">₹{totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <div className={`flex items-center gap-2 ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{totalChange >= 0 ? '+' : ''}₹{totalChange.toFixed(2)} ({totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">All prices in Indian Rupees (₹)</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
              <p className="text-4xl tabular-nums mb-2">₹{(totalValue - totalChange).toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">Across {portfolio.length} positions</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Today's Return</p>
              <p className="text-4xl tabular-nums mb-2">₹{(totalChange * 0.1).toFixed(2)}</p>
              <div className={`text-sm ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalChange >= 0 ? '+' : ''}{(totalChangePercent * 0.1).toFixed(2)}%
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl">Asset Allocation</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="h-full">
              <h2 className="text-xl mb-6">30-Day Performance</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="day" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(51, 65, 85, 0.3)',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard>
            <h2 className="text-xl mb-6">Holdings</h2>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground pb-2 border-b border-border">
                <div className="flex-1">Symbol / Name / Exchange</div>
                <div className="w-24 text-right">Quantity</div>
                <div className="w-32 text-right">Avg Price</div>
                <div className="w-32 text-right">Current Price</div>
                <div className="w-32 text-right">Value</div>
                <div className="w-32 text-right">Return</div>
              </div>

              {portfolio.map((item, index) => {
                const isPositive = item.change >= 0;
                
                return (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center py-3 hover:bg-accent/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.symbol}</p>
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {item.exchange}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.name}</p>
                    </div>
                    <div className="w-24 text-right tabular-nums">{item.quantity}</div>
                    <div className="w-32 text-right text-sm text-muted-foreground tabular-nums">
                      {formatPrice(item.avgPrice)}
                    </div>
                    <div className="w-32 text-right tabular-nums font-medium">{formatPrice(item.currentPrice)}</div>
                    <div className="w-32 text-right tabular-nums">{formatValue(item.value)}</div>
                    <div className={`w-32 text-right tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{formatPrice(Math.abs(item.change))}
                      <br />
                      <span className="text-sm">({isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};