import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { StockExplorer } from './pages/StockExplorer';
import { ChartPage } from './pages/ChartPage';
import { Watchlist } from './pages/Watchlist';
import { Portfolio } from './pages/Portfolio';
import { TradingSimulator } from './pages/TradingSimulator';
import { Heatmap } from './pages/Heatmap';
import { Crypto } from './pages/Crypto';
import { Global } from './pages/Global';
import { Screener } from './pages/Screener';
import { News } from './pages/News';
import { AIInsights } from './pages/AIInsights';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { LiveMarketData } from './pages/LiveMarketData';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: 'login', Component: Login },
      { path: 'dashboard', Component: Dashboard },
      { path: 'live-data', Component: LiveMarketData },
      { path: 'stocks', Component: StockExplorer },
      { path: 'chart', Component: ChartPage },
      { path: 'watchlist', Component: Watchlist },
      { path: 'portfolio', Component: Portfolio },
      { path: 'trading', Component: TradingSimulator },
      { path: 'heatmap', Component: Heatmap },
      { path: 'crypto', Component: Crypto },
      { path: 'global', Component: Global },
      { path: 'screener', Component: Screener },
      { path: 'news', Component: News },
      { path: 'ai-insights', Component: AIInsights },
      { path: 'profile', Component: Profile },
      { path: 'settings', Component: Settings },
    ],
  },
]);