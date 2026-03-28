import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { getMockCrypto } from '../services/mockData';
import type { CryptoData } from '../services/mockData';
import { useRealtimePrice } from '../hooks/useRealtimePrice';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const CryptoCard: React.FC<{ crypto: CryptoData }> = ({ crypto }) => {
  const price = useRealtimePrice(crypto.price, 0.003);
  const isPositive = crypto.change >= 0;

  const chartData = Array.from({ length: 20 }, (_, i) => ({
    value: crypto.price + (Math.random() - 0.5) * crypto.price * 0.05,
    index: i,
  }));

  return (
    <GlassCard hover glow={isPositive ? 'green' : 'red'}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${isPositive ? 'from-success/20 to-success/10' : 'from-destructive/20 to-destructive/10'} flex items-center justify-center`}>
              <Bitcoin className={`w-6 h-6 ${isPositive ? 'text-success' : 'text-destructive'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
              <h3>{crypto.name}</h3>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{crypto.changePercent.toFixed(2)}%</span>
          </div>
        </div>

        <div>
          <div className="text-3xl tabular-nums mb-1">
            ${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}${crypto.change.toLocaleString('en-US', { maximumFractionDigits: 2 })} 24h
          </div>
        </div>

        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${crypto.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth={2}
                fill={`url(#gradient-${crypto.symbol})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
            <p className="text-sm tabular-nums">${(crypto.marketCap / 1e9).toFixed(2)}B</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
            <p className="text-sm tabular-nums">${(crypto.volume24h / 1e9).toFixed(2)}B</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export const Crypto: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);

  useEffect(() => {
    setCryptos(getMockCrypto());
  }, []);

  const totalMarketCap = cryptos.reduce((sum, c) => sum + c.marketCap, 0);
  const total24hVolume = cryptos.reduce((sum, c) => sum + c.volume24h, 0);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl mb-2">Cryptocurrency Market</h1>
          <p className="text-muted-foreground">Real-time cryptocurrency prices and data</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard glow="blue">
              <p className="text-sm text-muted-foreground mb-1">Total Market Cap</p>
              <p className="text-3xl tabular-nums">${(totalMarketCap / 1e12).toFixed(2)}T</p>
              <p className="text-sm text-success mt-1">+2.4% 24h</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">24h Trading Volume</p>
              <p className="text-3xl tabular-nums">${(total24hVolume / 1e9).toFixed(2)}B</p>
              <p className="text-sm text-success mt-1">+5.8% 24h</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Bitcoin Dominance</p>
              <p className="text-3xl tabular-nums">54.3%</p>
              <p className="text-sm text-muted-foreground mt-1">BTC share of market</p>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cryptos.map((crypto, index) => (
            <motion.div
              key={crypto.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <CryptoCard crypto={crypto} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
