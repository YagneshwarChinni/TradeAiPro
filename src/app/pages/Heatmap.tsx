import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { getMockStocks } from '../services/mockData';

export const Heatmap: React.FC = () => {
  const [stocks, setStocks] = useState(getMockStocks(40));

  useEffect(() => {
    setStocks(getMockStocks(40));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Market Heatmap</h1>
          </div>
          <p className="text-muted-foreground">Visual representation of market performance</p>
        </motion.div>

        <GlassCard>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {stocks.map((stock, index) => {
              const intensity = Math.abs(stock.changePercent) / 5;
              const isPositive = stock.changePercent >= 0;
              
              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`aspect-square rounded-lg p-2 flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 ${
                    isPositive 
                      ? 'bg-success/20 hover:bg-success/30' 
                      : 'bg-destructive/20 hover:bg-destructive/30'
                  }`}
                  style={{
                    backgroundColor: isPositive 
                      ? `rgba(16, 185, 129, ${0.1 + intensity * 0.4})`
                      : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`,
                  }}
                >
                  <div className="text-xs font-medium">{stock.symbol}</div>
                  <div className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(1)}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
