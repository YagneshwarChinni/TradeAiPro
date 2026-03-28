// Market status service for NSE and US markets

export interface MarketHours {
  name: string;
  market: 'NSE' | 'NYSE' | 'NASDAQ';
  timezone: string;
  preMarketOpen: { hour: number; minute: number };
  regularOpen: { hour: number; minute: number };
  regularClose: { hour: number; minute: number };
  afterHoursClose: { hour: number; minute: number };
}

export interface MarketStatusInfo {
  market: 'NSE' | 'NYSE' | 'NASDAQ';
  isOpen: boolean;
  status: 'closed' | 'pre-market' | 'open' | 'after-hours';
  nextOpenTime?: Date;
  nextCloseTime?: Date;
  lastUpdated: Date;
  currentTime: Date;
}

// NSE India market hours (IST)
const NSE_HOURS: MarketHours = {
  name: 'NSE India',
  market: 'NSE',
  timezone: 'Asia/Kolkata',
  preMarketOpen: { hour: 9, minute: 0 },
  regularOpen: { hour: 9, minute: 15 },
  regularClose: { hour: 15, minute: 30 },
  afterHoursClose: { hour: 16, minute: 0 },
};

// NYSE/NASDAQ market hours (EST/EDT)
const US_HOURS: MarketHours = {
  name: 'US Markets',
  market: 'NYSE',
  timezone: 'America/New_York',
  preMarketOpen: { hour: 4, minute: 0 },
  regularOpen: { hour: 9, minute: 30 },
  regularClose: { hour: 16, minute: 0 },
  afterHoursClose: { hour: 20, minute: 0 },
};

// Check if a date is a weekend
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

// Check if a date is a market holiday (simplified - add actual holidays as needed)
function isMarketHoliday(date: Date, market: 'NSE' | 'NYSE' | 'NASDAQ'): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (market === 'NSE') {
    // Major NSE holidays 2026 (Add actual holidays)
    const nseHolidays = [
      { month: 1, day: 26 }, // Republic Day
      { month: 3, day: 14 }, // Holi
      { month: 3, day: 25 }, // Mahavir Jayanti
      { month: 4, day: 2 },  // Good Friday
      { month: 4, day: 14 }, // Dr. Ambedkar Jayanti
      { month: 5, day: 1 },  // Maharashtra Day
      { month: 8, day: 15 }, // Independence Day
      { month: 10, day: 2 }, // Gandhi Jayanti
      { month: 10, day: 24 }, // Dussehra
      { month: 11, day: 12 }, // Diwali
      { month: 11, day: 13 }, // Diwali (Day 2)
      { month: 11, day: 23 }, // Guru Nanak Jayanti
      { month: 12, day: 25 }, // Christmas
    ];
    
    return nseHolidays.some(h => h.month === month && h.day === day);
  } else {
    // Major US market holidays 2026
    const usHolidays = [
      { month: 1, day: 1 },  // New Year's Day
      { month: 1, day: 19 }, // MLK Day
      { month: 2, day: 16 }, // Presidents Day
      { month: 4, day: 2 },  // Good Friday
      { month: 5, day: 25 }, // Memorial Day
      { month: 7, day: 3 },  // Independence Day (observed)
      { month: 9, day: 7 },  // Labor Day
      { month: 11, day: 26 }, // Thanksgiving
      { month: 12, day: 25 }, // Christmas
    ];
    
    return usHolidays.some(h => h.month === month && h.day === day);
  }
}

// Get current time in IST (for NSE)
function getISTTime(): Date {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
}

// Get market status for NSE
export function getNSEMarketStatus(): MarketStatusInfo {
  const now = getISTTime();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const preMarketStart = NSE_HOURS.preMarketOpen.hour * 60 + NSE_HOURS.preMarketOpen.minute;
  const regularStart = NSE_HOURS.regularOpen.hour * 60 + NSE_HOURS.regularOpen.minute;
  const regularEnd = NSE_HOURS.regularClose.hour * 60 + NSE_HOURS.regularClose.minute;
  const afterHoursEnd = NSE_HOURS.afterHoursClose.hour * 60 + NSE_HOURS.afterHoursClose.minute;

  // Check if weekend or holiday
  if (isWeekend(now) || isMarketHoliday(now, 'NSE')) {
    return {
      market: 'NSE',
      isOpen: false,
      status: 'closed',
      nextOpenTime: getNextMarketOpen('NSE'),
      lastUpdated: new Date(),
      currentTime: now,
    };
  }

  // Determine market status
  let status: 'closed' | 'pre-market' | 'open' | 'after-hours';
  let isOpen: boolean;

  if (currentTimeInMinutes < preMarketStart) {
    status = 'closed';
    isOpen = false;
  } else if (currentTimeInMinutes < regularStart) {
    status = 'pre-market';
    isOpen = false;
  } else if (currentTimeInMinutes < regularEnd) {
    status = 'open';
    isOpen = true;
  } else if (currentTimeInMinutes < afterHoursEnd) {
    status = 'after-hours';
    isOpen = false;
  } else {
    status = 'closed';
    isOpen = false;
  }

  return {
    market: 'NSE',
    isOpen,
    status,
    nextOpenTime: isOpen ? undefined : getNextMarketOpen('NSE'),
    nextCloseTime: isOpen ? getNextMarketClose('NSE') : undefined,
    lastUpdated: new Date(),
    currentTime: now,
  };
}

// Get market status for US markets
export function getUSMarketStatus(): MarketStatusInfo {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const preMarketStart = US_HOURS.preMarketOpen.hour * 60 + US_HOURS.preMarketOpen.minute;
  const regularStart = US_HOURS.regularOpen.hour * 60 + US_HOURS.regularOpen.minute;
  const regularEnd = US_HOURS.regularClose.hour * 60 + US_HOURS.regularClose.minute;
  const afterHoursEnd = US_HOURS.afterHoursClose.hour * 60 + US_HOURS.afterHoursClose.minute;

  // Check if weekend or holiday
  if (isWeekend(now) || isMarketHoliday(now, 'NYSE')) {
    return {
      market: 'NYSE',
      isOpen: false,
      status: 'closed',
      nextOpenTime: getNextMarketOpen('NYSE'),
      lastUpdated: new Date(),
      currentTime: now,
    };
  }

  // Determine market status
  let status: 'closed' | 'pre-market' | 'open' | 'after-hours';
  let isOpen: boolean;

  if (currentTimeInMinutes < preMarketStart) {
    status = 'closed';
    isOpen = false;
  } else if (currentTimeInMinutes < regularStart) {
    status = 'pre-market';
    isOpen = false;
  } else if (currentTimeInMinutes < regularEnd) {
    status = 'open';
    isOpen = true;
  } else if (currentTimeInMinutes < afterHoursEnd) {
    status = 'after-hours';
    isOpen = false;
  } else {
    status = 'closed';
    isOpen = false;
  }

  return {
    market: 'NYSE',
    isOpen,
    status,
    nextOpenTime: isOpen ? undefined : getNextMarketOpen('NYSE'),
    nextCloseTime: isOpen ? getNextMarketClose('NYSE') : undefined,
    lastUpdated: new Date(),
    currentTime: now,
  };
}

// Get next market open time
function getNextMarketOpen(market: 'NSE' | 'NYSE' | 'NASDAQ'): Date {
  const hours = market === 'NSE' ? NSE_HOURS : US_HOURS;
  const now = market === 'NSE' ? getISTTime() : new Date();
  
  let nextOpen = new Date(now);
  nextOpen.setHours(hours.regularOpen.hour, hours.regularOpen.minute, 0, 0);

  // If market already opened today, move to next day
  if (nextOpen <= now) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }

  // Skip weekends and holidays
  while (isWeekend(nextOpen) || isMarketHoliday(nextOpen, market)) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }

  return nextOpen;
}

// Get next market close time
function getNextMarketClose(market: 'NSE' | 'NYSE' | 'NASDAQ'): Date {
  const hours = market === 'NSE' ? NSE_HOURS : US_HOURS;
  const now = market === 'NSE' ? getISTTime() : new Date();
  
  const nextClose = new Date(now);
  nextClose.setHours(hours.regularClose.hour, hours.regularClose.minute, 0, 0);

  return nextClose;
}

// Format time until next event
export function formatTimeUntil(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export interface LiveMarketStatus {
  nseOpen: boolean;
  countdown?: string;
}

export function getMarketStatus(): LiveMarketStatus {
  const nseStatus = getNSEMarketStatus();

  return {
    nseOpen: nseStatus.isOpen,
    countdown: !nseStatus.isOpen && nseStatus.nextOpenTime
      ? formatTimeUntil(nseStatus.nextOpenTime)
      : undefined,
  };
}

// Get status badge color
export function getStatusBadgeColor(status: 'closed' | 'pre-market' | 'open' | 'after-hours'): string {
  switch (status) {
    case 'open':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'pre-market':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'after-hours':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'closed':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

// Get status display text
export function getStatusDisplayText(status: 'closed' | 'pre-market' | 'open' | 'after-hours'): string {
  switch (status) {
    case 'open':
      return 'Market Open';
    case 'pre-market':
      return 'Pre-Market';
    case 'after-hours':
      return 'After Hours';
    case 'closed':
      return 'Market Closed';
  }
}
