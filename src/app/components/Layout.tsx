import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen w-screen overflow-x-hidden">
      {!isLandingPage && !isLoginPage && <Navbar />}
      <Outlet />
    </div>
  );
};