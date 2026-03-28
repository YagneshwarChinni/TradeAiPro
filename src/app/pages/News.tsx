import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Clock, ExternalLink } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { getMockNews } from '../services/mockData';
import type { NewsItem } from '../services/mockData';
import { formatDistanceToNow } from 'date-fns';

export const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    setNews(getMockNews());
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-[1920px] mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="w-8 h-8 text-primary" />
            <h1 className="text-4xl">Financial News</h1>
          </div>
          <p className="text-muted-foreground">Latest market news and updates</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover className="h-full group">
                <a href={item.url} className="block space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-primary/50" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
                      {item.headline}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span>{item.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(item.publishedAt))} ago</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-primary text-sm group-hover:gap-3 transition-all">
                    <span>Read more</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
