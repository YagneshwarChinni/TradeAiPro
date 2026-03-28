import { Info, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface DataSourceInfoProps {
  dataMode: 'mock' | 'real';
}

export function DataSourceInfo({ dataMode }: DataSourceInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {dataMode === 'mock' ? (
            <>
              <p className="text-sm text-blue-400 font-semibold mb-1">
                Simulated Market Data Mode
              </p>
              <p className="text-xs text-blue-400/80">
                Currently using realistic simulated data with live price updates. This mode respects actual market hours (NSE: 9:15 AM - 3:30 PM IST) and provides consistent data for development and testing. 
                <span className="font-semibold"> Switch to "Real NSE Data" mode in the Data Source toggle above to attempt fetching actual market data.</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-emerald-400 font-semibold mb-1">
                Real NSE Data Mode (Enhanced Simulation) ✓
              </p>
              <p className="text-xs text-emerald-400/80">
                Attempting to fetch real market data from NSE India. If the backend is unavailable, the system automatically falls back to enhanced simulated data with realistic NSE stock symbols and prices. All prices are displayed in Indian Rupees (₹).
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-emerald-400/60">
                <span>Real NSE Stocks: RELIANCE, TCS, INFY, HDFCBANK, etc.</span>
                <span>•</span>
                <span>Updates: Every 10-30 sec</span>
                <span>•</span>
                <span>Currency: ₹ INR</span>
              </div>
              <p className="mt-2 text-xs text-emerald-400/60">
                💡 Tip: To enable live NSE API integration, deploy the Supabase Edge Functions included in this project.
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}