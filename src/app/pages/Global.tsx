import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { StockCard } from '../components/StockCard';
import { getMockIndices } from '../services/mockData';

export const Global: React.FC = () => {
  const indices = getMockIndices();

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Global Markets</h1>
          </div>
          <p className="text-muted-foreground">Major indices from around the world</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indices.map((index, i) => (
            <motion.div
              key={index.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StockCard
                name={index.name}
                symbol={index.symbol}
                initialPrice={index.value}
                initialChange={index.change}
                initialChangePercent={index.changePercent}
                sparkline={index.sparkline}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
