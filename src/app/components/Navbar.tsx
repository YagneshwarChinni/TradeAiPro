import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Eye, 
  Briefcase, 
  Activity, 
  Flame,
  Bitcoin,
  Globe,
  Filter,
  Newspaper,
  Sparkles,
  Shield,
  User,
  Settings,
  LogOut,
  Radio,
  Menu,
  X
} from 'lucide-react';
import { cn } from './ui/utils';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Market', href: '/live-data', icon: Radio },
  { name: 'Stock Explorer', href: '/stocks', icon: TrendingUp },
  { name: 'Chart', href: '/chart', icon: Activity },
  { name: 'Watchlist', href: '/watchlist', icon: Eye },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Trading', href: '/trading', icon: Activity },
  { name: 'Heatmap', href: '/heatmap', icon: Flame },
  { name: 'Crypto', href: '/crypto', icon: Bitcoin },
  { name: 'Global Markets', href: '/global', icon: Globe },
  { name: 'Screener', href: '/screener', icon: Filter },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'AI Insights', href: '/ai-insights', icon: Sparkles },
];

const adminNavigation = { name: 'Admin', href: '/admin', icon: Shield };

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const navItems = user?.isAdmin ? [...navigation, adminNavigation] : navigation;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavigate = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/30 border-b border-border">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="hidden xs:inline text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TradeAI Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side - Settings, User, Mobile Menu */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <Link
                  to="/settings"
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    location.pathname === '/settings'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-all">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs sm:text-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button className="p-2 rounded-lg hover:bg-accent transition-all">
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        TradeAI
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile User Section */}
                  {user && (
                    <div className="border-t border-border p-4">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};