import { useState, useEffect } from 'react';

export const useRealtimePrice = (initialPrice: number, volatility: number = 0.001) => {
  const [price, setPrice] = useState(initialPrice);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prevPrice) => {
        const change = (Math.random() - 0.5) * 2 * volatility * prevPrice;
        return prevPrice + change;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [volatility]);

  return price;
};
