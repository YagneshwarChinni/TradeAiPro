import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { getMockStocks, getAISignal } from '../services/mockData';
import type { Stock, AISignal } from '../services/mockData';

const SignalCard: React.FC<{ stock: Stock; signal: AISignal }> = ({ stock, signal }) => {
  const signalColors = {
    BUY: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', glow: 'green' as const },
    SELL: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', glow: 'red' as const },
    HOLD: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30', glow: 'none' as const },
  };

  const colors = signalColors[signal.signal];

  return (
    <GlassCard hover glow={colors.glow}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl mb-1">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
            {signal.signal}
          </Badge>
        </div>

        <div className="text-3xl tabular-nums">${stock.price.toFixed(2)}</div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">AI Confidence</span>
              <span className="text-primary">{signal.confidence.toFixed(1)}%</span>
            </div>
            <Progress value={signal.confidence} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
              <p className="text-xs text-muted-foreground mb-1">Bullish</p>
              <p className={`text-lg ${colors.text}`}>{signal.bullishProbability.toFixed(1)}%</p>
            </div>
            <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
              <p className="text-xs text-muted-foreground mb-1">Bearish</p>
              <p className={`text-lg ${colors.text}`}>{signal.bearishProbability.toFixed(1)}%</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Price Targets</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Support</p>
                <p className="text-success">${signal.supportLevel.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Resistance</p>
                <p className="text-destructive">${signal.resistanceLevel.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">Risk Score</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={signal.riskScore * 10} className="h-2 flex-1" />
              <span className="text-sm tabular-nums">{signal.riskScore.toFixed(1)}/10</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground italic">
            {signal.trendPrediction}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export const AIInsights: React.FC = () => {
  const [signals, setSignals] = useState<Array<{ stock: Stock; signal: AISignal }>>([]);

  useEffect(() => {
    const stocks = getMockStocks(12);
    const stockSignals = stocks.map(stock => ({
      stock,
      signal: getAISignal(stock),
    }));
    setSignals(stockSignals);
  }, []);

  const buySignals = signals.filter(s => s.signal.signal === 'BUY').length;
  const sellSignals = signals.filter(s => s.signal.signal === 'SELL').length;
  const holdSignals = signals.filter(s => s.signal.signal === 'HOLD').length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">AI Trading Insights</h1>
          </div>
          <p className="text-muted-foreground">
            Advanced AI algorithms analyze market data to provide actionable trading signals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard glow="blue">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Total Signals</p>
              </div>
              <p className="text-3xl">{signals.length}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard glow="green">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">Buy Signals</p>
              </div>
              <p className="text-3xl text-success">{buySignals}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard glow="red">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground">Sell Signals</p>
              </div>
              <p className="text-3xl text-destructive">{sellSignals}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">Hold Signals</p>
              </div>
              <p className="text-3xl text-yellow-500">{holdSignals}</p>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map(({ stock, signal }, index) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <SignalCard stock={stock} signal={signal} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl">How AI Insights Work</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="mb-2 text-primary">Machine Learning</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes millions of data points including price movements, volume, and market sentiment using advanced ML algorithms.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-secondary">Technical Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Automated detection of chart patterns, support/resistance levels, and technical indicators to identify trading opportunities.
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-success">Risk Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  Each signal includes a comprehensive risk score helping you make informed decisions based on your risk tolerance.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
