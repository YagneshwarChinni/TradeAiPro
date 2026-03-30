import { createBrowserRouter } from 'react-router';
import { createElement } from 'react';
import type { ComponentType } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
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
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

const protectedPage = (PageComponent: ComponentType) => {
  return () => createElement(ProtectedRoute, null, createElement(PageComponent));
};

const adminPage = (PageComponent: ComponentType) => {
  return () => createElement(AdminRoute, null, createElement(PageComponent));
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Landing },
      { path: 'login', Component: Login },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'dashboard', Component: protectedPage(Dashboard) },
      { path: 'live-data', Component: protectedPage(LiveMarketData) },
      { path: 'stocks', Component: protectedPage(StockExplorer) },
      { path: 'chart', Component: protectedPage(ChartPage) },
      { path: 'watchlist', Component: protectedPage(Watchlist) },
      { path: 'portfolio', Component: protectedPage(Portfolio) },
      { path: 'trading', Component: protectedPage(TradingSimulator) },
      { path: 'heatmap', Component: protectedPage(Heatmap) },
      { path: 'crypto', Component: protectedPage(Crypto) },
      { path: 'global', Component: protectedPage(Global) },
      { path: 'screener', Component: protectedPage(Screener) },
      { path: 'news', Component: protectedPage(News) },
      { path: 'ai-insights', Component: protectedPage(AIInsights) },
      { path: 'profile', Component: protectedPage(Profile) },
      { path: 'settings', Component: protectedPage(Settings) },
      { path: 'admin', Component: adminPage(AdminDashboard) },
    ],
  },
]);