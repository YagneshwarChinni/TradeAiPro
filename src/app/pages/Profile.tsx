import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, TrendingUp, Chrome } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="flex items-start gap-6">
              <div className="relative">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-2 border-primary"
                />
                {user.provider === 'google' && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-background">
                    <Chrome className="w-4 h-4 text-[#4285F4]" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl mb-1">{user.name}</h2>
                <p className="text-muted-foreground mb-4">Premium Trader</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Member since March 2026</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">Signed in with {user.provider}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
              <p className="text-3xl">247</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-3xl text-success">68.4%</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <p className="text-sm text-muted-foreground mb-1">Total Return</p>
              <p className="text-3xl text-success">+24.7%</p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};