import { useState, useEffect } from 'react';
import { 
  getNSEMarketStatus, 
  getUSMarketStatus, 
  formatTimeUntil, 
  getStatusBadgeColor, 
  getStatusDisplayText,
  type MarketStatusInfo 
} from '../services/marketStatus';
import { Clock, Activity, Calendar } from 'lucide-react';

export function MarketStatusBar() {
  const [nseStatus, setNseStatus] = useState<MarketStatusInfo>(getNSEMarketStatus());
  const [usStatus, setUsStatus] = useState<MarketStatusInfo>(getUSMarketStatus());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Update market status every 10 seconds
    const interval = setInterval(() => {
      setNseStatus(getNSEMarketStatus());
      setUsStatus(getUSMarketStatus());
      setCurrentTime(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* NSE Status */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border ${getStatusBadgeColor(nseStatus.status)} flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${nseStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm font-semibold">NSE: {getStatusDisplayText(nseStatus.status)}</span>
          </div>
          {!nseStatus.isOpen && nseStatus.nextOpenTime && (
            <span className="text-xs text-slate-400">
              Opens in {formatTimeUntil(nseStatus.nextOpenTime)}
            </span>
          )}
          {nseStatus.isOpen && nseStatus.nextCloseTime && (
            <span className="text-xs text-slate-400">
              Closes in {formatTimeUntil(nseStatus.nextCloseTime)}
            </span>
          )}
        </div>

        {/* US Markets Status */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border ${getStatusBadgeColor(usStatus.status)} flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${usStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm font-semibold">US: {getStatusDisplayText(usStatus.status)}</span>
          </div>
          {!usStatus.isOpen && usStatus.nextOpenTime && (
            <span className="text-xs text-slate-400">
              Opens in {formatTimeUntil(usStatus.nextOpenTime)}
            </span>
          )}
          {usStatus.isOpen && usStatus.nextCloseTime && (
            <span className="text-xs text-slate-400">
              Closes in {formatTimeUntil(usStatus.nextCloseTime)}
            </span>
          )}
        </div>

        {/* Current Time & Date */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(currentTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{formatDate(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3" />
          <span>NSE: 9:15 AM - 3:30 PM IST (Mon-Fri)</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3" />
          <span>US: 9:30 AM - 4:00 PM EST (Mon-Fri)</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <span>Real-time data simulation</span>
        </div>
      </div>
    </div>
  );
}
