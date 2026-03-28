import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, Shield, Zap, BarChart3, Brain, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TradeAI Pro
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/login">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary">AI-Powered Trading Platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              The Future of
              <br />
              Smart Trading
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade trading platform with real-time analytics, AI insights, 
              and advanced charting tools. Trade smarter, not harder.
            </p>

            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-8 shadow-lg shadow-primary/30">
                    Go to Dashboard
                    <TrendingUp className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg" className="text-lg px-8 shadow-lg shadow-primary/30">
                      Get Started
                      <LogIn className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/trading">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Try Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need for professional trading</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: 'AI Trading Insights',
              description: 'Advanced AI algorithms analyze market trends and provide actionable trading signals.',
              gradient: 'from-primary to-blue-600',
            },
            {
              icon: BarChart3,
              title: 'Advanced Charts',
              description: 'Professional TradingView-style charts with 50+ technical indicators.',
              gradient: 'from-secondary to-purple-600',
            },
            {
              icon: Zap,
              title: 'Real-Time Data',
              description: 'Live market data updates every second for instant decision making.',
              gradient: 'from-yellow-500 to-orange-600',
            },
            {
              icon: Shield,
              title: 'Paper Trading',
              description: 'Practice with $100,000 virtual money before risking real capital.',
              gradient: 'from-green-500 to-emerald-600',
            },
            {
              icon: TrendingUp,
              title: 'Portfolio Management',
              description: 'Track your investments, monitor performance, and optimize your strategy.',
              gradient: 'from-pink-500 to-rose-600',
            },
            {
              icon: Sparkles,
              title: 'Market Insights',
              description: 'Comprehensive market analysis, news, and sentiment indicators.',
              gradient: 'from-cyan-500 to-blue-600',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl bg-card/30 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 border border-primary/30 p-12 text-center"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
          
          <div className="relative space-y-6">
            <h2 className="text-4xl md:text-5xl">Ready to Start Trading?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of traders using AI-powered insights to make smarter investment decisions.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 shadow-lg shadow-primary/30">
                Launch Platform
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2026 TradeAI Pro. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Disclaimer: Trading involves risk. Past performance is not indicative of future results.
          </p>
        </div>
      </footer>
    </div>
  );
};