'use client';

import { motion } from 'framer-motion';
import { HeroType } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface HeroTypeBadgeProps {
  heroType: HeroType;
}

const heroTypeIcons: Record<string, string> = {
  'peaceful-dove': '🕊️',
  'boundary-guardian': '🛡️',
  'logic-master': '🧠',
  'diplomat': '🤝',
  'idealist-warrior': '⚔️',
  'zen-observer': '🧘',
  'emotional-fighter': '💪',
  'calm-analyst': '📊',
};

export function HeroTypeBadge({ heroType }: HeroTypeBadgeProps) {
  const icon = heroTypeIcons[heroType.id] || '🏆';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="text-center pb-4 md:pb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring', bounce: 0.5 }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-4xl md:text-5xl">
              {icon}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -top-2 -right-2"
            >
              <Badge variant="default" className="gap-1 px-2 py-1">
                <Trophy className="w-3 h-3" />
                <span className="text-xs">认证</span>
              </Badge>
            </motion.div>
          </div>
        </motion.div>
        <CardTitle className="text-2xl md:text-3xl">{heroType.name}</CardTitle>
        <CardDescription className="text-base md:text-lg mt-2">
          {heroType.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
