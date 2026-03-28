import { useState, useEffect } from 'react';
import { realtimeStore } from '../services/mockData';

interface RealtimeStockData {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
}

export const useRealtimeStock = (symbol: string, initialPrice: number): RealtimeStockData => {
  const [data, setData] = useState<RealtimeStockData>(() => {
    // Initialize the price in the store
    const marketData = realtimeStore.initPrice(symbol, initialPrice);
    return {
      price: marketData.price,
      change: marketData.price - marketData.open,
      changePercent: ((marketData.price - marketData.open) / marketData.open) * 100,
      high: marketData.high,
      low: marketData.low,
      open: marketData.open,
    };
  });

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = realtimeStore.subscribe(symbol, (updateData) => {
      setData({
        price: updateData.price,
        change: updateData.change,
        changePercent: updateData.changePercent,
        high: updateData.high,
        low: updateData.low,
        open: updateData.open,
      });
    });

    return unsubscribe;
  }, [symbol]);

  return data;
};
