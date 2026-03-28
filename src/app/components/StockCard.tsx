import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { realtimeStore } from '../services/mockData';

interface StockCardProps {
  name: string;
  symbol: string;
  initialPrice: number;
  initialChange: number;
  initialChangePercent: number;
  sparkline?: number[];
  currency?: 'USD' | 'INR';
  market?: 'US' | 'IN';
}

export const StockCard: React.FC<StockCardProps> = ({
  name,
  symbol,
  initialPrice,
  initialChange,
  initialChangePercent,
  sparkline,
  currency,
  market,
}) => {
  const [price, setPrice] = useState(initialPrice);
  const [change, setChange] = useState(initialChange);
  const [changePercent, setChangePercent] = useState(initialChangePercent);
  
  const isPositive = change >= 0;

  // Subscribe to real-time price updates
  useEffect(() => {
    // Initialize the price in the store
    realtimeStore.initPrice(symbol, initialPrice);
    
    // Subscribe to updates
    const unsubscribe = realtimeStore.subscribe(symbol, (data) => {
      setPrice(data.price);
      setChange(data.change);
      setChangePercent(data.changePercent);
    });

    return unsubscribe;
  }, [symbol, initialPrice]);

  const chartData = sparkline?.map((value, index) => ({ value, index })) || [];

  return (
    <GlassCard hover glow={isPositive ? 'green' : 'red'} className="min-w-[280px]">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{symbol}</p>
            <h3 className="mt-1">{name}</h3>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm">{changePercent.toFixed(2)}%</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl tabular-nums">
            ₹{price.toFixed(2)}
          </div>
          <div className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}₹{Math.abs(change).toFixed(2)} Today
          </div>
        </div>

        {sparkline && chartData.length > 0 && (
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? '#10B981' : '#EF4444'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </GlassCard>
  );
};