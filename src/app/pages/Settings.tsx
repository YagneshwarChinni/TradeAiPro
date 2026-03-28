import React from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

export const Settings: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl">Notifications</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-alerts">Price Alerts</Label>
                <Switch id="price-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="news-updates">News Updates</Label>
                <Switch id="news-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="trading-signals">AI Trading Signals</Label>
                <Switch id="trading-signals" defaultChecked />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-xl">Appearance</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch id="dark-mode" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <Switch id="animations" defaultChecked />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl">Security</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <Switch id="2fa" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="session-timeout">Auto Logout</Label>
                <Switch id="session-timeout" defaultChecked />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
