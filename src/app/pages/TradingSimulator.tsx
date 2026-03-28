import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, History, Search } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getMockStocks } from '../services/mockData';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export const TradingSimulator: React.FC = () => {
  const [balance, setBalance] = useState(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [quantity, setQuantity] = useState('10');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const stocks = getMockStocks(10);
  const stock = stocks.find(s => s.symbol === selectedStock) || stocks[0];

  const handleTrade = () => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const total = stock.price * qty;

    if (tradeType === 'BUY') {
      if (total > balance) {
        toast.error('Insufficient balance');
        return;
      }

      setBalance(prev => prev - total);
      
      const existingPosition = positions.find(p => p.symbol === stock.symbol);
      if (existingPosition) {
        const newQuantity = existingPosition.quantity + qty;
        const newAvgPrice = ((existingPosition.avgPrice * existingPosition.quantity) + total) / newQuantity;
        setPositions(prev => prev.map(p => 
          p.symbol === stock.symbol 
            ? { ...p, quantity: newQuantity, avgPrice: newAvgPrice, currentPrice: stock.price }
            : p
        ));
      } else {
        setPositions(prev => [...prev, {
          symbol: stock.symbol,
          quantity: qty,
          avgPrice: stock.price,
          currentPrice: stock.price,
        }]);
      }

      toast.success(`Bought ${qty} shares of ${stock.symbol} for $${total.toFixed(2)}`);
    } else {
      const position = positions.find(p => p.symbol === stock.symbol);
      if (!position || position.quantity < qty) {
        toast.error('Insufficient shares to sell');
        return;
      }

      setBalance(prev => prev + total);
      
      if (position.quantity === qty) {
        setPositions(prev => prev.filter(p => p.symbol !== stock.symbol));
      } else {
        setPositions(prev => prev.map(p =>
          p.symbol === stock.symbol
            ? { ...p, quantity: p.quantity - qty }
            : p
        ));
      }

      toast.success(`Sold ${qty} shares of ${stock.symbol} for $${total.toFixed(2)}`);
    }

    const trade: Trade = {
      id: Date.now().toString(),
      symbol: stock.symbol,
      type: tradeType,
      quantity: qty,
      price: stock.price,
      total,
      timestamp: new Date(),
    };

    setTradeHistory(prev => [trade, ...prev]);
    setQuantity('10');
  };

  const portfolioValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
  const totalValue = balance + portfolioValue;
  const totalReturn = totalValue - 100000;
  const totalReturnPercent = (totalReturn / 100000) * 100;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl mb-2">Paper Trading Simulator</h1>
          <p className="text-muted-foreground">Practice trading with virtual money</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard glow="blue">
              <p className="text-sm text-muted-foreground mb-1">Cash Balance</p>
              <p className="text-3xl tabular-nums">${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
              <p className="text-3xl tabular-nums">${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="text-3xl tabular-nums">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard glow={totalReturn >= 0 ? 'green' : 'red'}>
              <p className="text-sm text-muted-foreground mb-1">Total Return</p>
              <p className={`text-3xl tabular-nums ${totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
              </p>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <GlassCard>
              <h2 className="text-xl mb-6">Place Order</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock Symbol</Label>
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger className="bg-card/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stocks.map(s => (
                          <SelectItem key={s.symbol} value={s.symbol}>
                            {s.symbol} - ${s.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Order Type</Label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setTradeType('BUY')}
                        variant={tradeType === 'BUY' ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        Buy
                      </Button>
                      <Button
                        onClick={() => setTradeType('SELL')}
                        variant={tradeType === 'SELL' ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-card/50"
                    min="1"
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Price</span>
                    <span className="tabular-nums">${stock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="tabular-nums">{quantity || 0}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="text-xl tabular-nums">
                      ${(stock.price * (parseInt(quantity) || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleTrade}
                  className="w-full h-12 text-lg"
                  disabled={!quantity || parseInt(quantity) <= 0}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  {tradeType === 'BUY' ? 'Buy' : 'Sell'} {stock.symbol}
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <GlassCard className="h-full">
              <h3 className="mb-4">Current Positions</h3>
              {positions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No positions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {positions.map(position => {
                    const profit = (position.currentPrice - position.avgPrice) * position.quantity;
                    const profitPercent = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100;
                    
                    return (
                      <div key={position.symbol} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{position.symbol}</span>
                          <span className={profit >= 0 ? 'text-success' : 'text-destructive'}>
                            {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {position.quantity} shares @ ${position.avgPrice.toFixed(2)}
                        </div>
                        <div className={`text-xs ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-xl">Trade History</h2>
            </div>
            {tradeHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No trades yet
              </p>
            ) : (
              <div className="space-y-2">
                {tradeHistory.slice(0, 10).map(trade => (
                  <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg text-sm ${
                        trade.type === 'BUY' 
                          ? 'bg-success/10 text-success border border-success/30' 
                          : 'bg-destructive/10 text-destructive border border-destructive/30'
                      }`}>
                        {trade.type}
                      </div>
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.quantity} shares @ ${trade.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums">${trade.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
