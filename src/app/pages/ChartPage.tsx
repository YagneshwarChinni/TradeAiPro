import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/ui/button';
import { getMockStocks, generateHistoricalData, realtimeStore } from '../services/mockData';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | 'MAX';

export const ChartPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const symbol = searchParams.get('symbol') || 'AAPL';
  
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [stock, setStock] = useState(() => getMockStocks(50).find(s => s.symbol === symbol) || getMockStocks(1)[0]);
  const [isLive, setIsLive] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const isPositive = stock.change >= 0;

  // Subscribe to real-time price updates
  useEffect(() => {
    const unsubscribe = realtimeStore.subscribe(symbol, (data) => {
      setStock(prevStock => ({
        ...prevStock,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        high: data.high,
        low: data.low,
        open: data.open,
      }));

      // Update the latest data point in real-time
      if (isLive) {
        setChartData(prevData => {
          if (prevData.length === 0) return prevData;
          
          const newData = [...prevData];
          const lastIndex = newData.length - 1;
          newData[lastIndex] = {
            ...newData[lastIndex],
            value: data.price,
            close: data.price,
            high: Math.max(newData[lastIndex].high || data.price, data.price),
            low: Math.min(newData[lastIndex].low || data.price, data.price),
          };
          return newData;
        });
      }
    });

    return unsubscribe;
  }, [symbol, isLive]);

  // Update chart data when timeframe changes
  useEffect(() => {
    const days = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '6M': 180,
      '1Y': 365,
      'MAX': 1825,
    }[timeframe];

    const data = generateHistoricalData(stock.price, days, 0.02);
    const formattedData = data.map(d => ({
      time: d.time,
      value: d.close,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    setChartData(formattedData);
  }, [timeframe, symbol, stock.price]);

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '6M', '1Y', 'MAX'];

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl mb-1">{stock.symbol}</h1>
              {isLive && (
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm">
                  <Activity className="w-4 h-4 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{stock.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
              {stock.exchange}
            </span>
          </div>
          <div className="text-right">
            <div className="text-4xl tabular-nums mb-1">{formatPrice(stock.price)}</div>
            <div className={`flex items-center gap-2 justify-end ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="text-xl">
                {isPositive ? '+' : ''}{formatPrice(Math.abs(stock.change))} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl">Price Chart</h2>
                <Button
                  variant={isLive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsLive(!isLive)}
                  className={isLive ? 'shadow-lg shadow-success/30' : ''}
                >
                  <Activity className={`w-4 h-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
                  {isLive ? 'Live Updates ON' : 'Live Updates OFF'}
                </Button>
              </div>
              <div className="flex gap-2">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className={timeframe === tf ? 'shadow-lg shadow-primary/30' : ''}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>

            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="#94A3B8"
                    tick={{ fill: '#94A3B8' }}
                  />
                  <YAxis 
                    stroke="#94A3B8"
                    tick={{ fill: '#94A3B8' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(51, 65, 85, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#F1F5F9',
                    }}
                    formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? "#10B981" : "#EF4444"}
                    strokeWidth={2}
                    fill="url(#colorValue)"
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Open', value: formatPrice(stock.open) },
            { label: 'High', value: formatPrice(stock.high) },
            { label: 'Low', value: formatPrice(stock.low) },
            { label: 'Volume', value: `${(stock.volume / 1e6).toFixed(2)}M` },
            { label: 'Market Cap', value: `₹${(stock.marketCap / 1e9).toFixed(2)}B` },
            { label: 'P/E Ratio', value: (Math.random() * 30 + 10).toFixed(2) },
            { label: '52W High', value: formatPrice(stock.price * 1.25) },
            { label: '52W Low', value: formatPrice(stock.price * 0.75) },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <GlassCard>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl tabular-nums">{stat.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};