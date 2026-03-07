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

interface HeroTypeBadgeProps {
  heroType: HeroType;
}

export function HeroTypeBadge({ heroType }: HeroTypeBadgeProps) {
  return (
    <Card className="bg-purple-950 border-2 border-purple-500 overflow-hidden">
      <CardHeader className="text-center pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          className="flex justify-center mb-4"
        >
          <div className="w-24 h-24 rounded-full bg-purple-600 border-4 border-purple-400 flex items-center justify-center text-4xl">
            🏆
          </div>
        </motion.div>
        <CardTitle className="text-3xl text-white">{heroType.name}</CardTitle>
        <CardDescription className="text-purple-200 text-lg">
          {heroType.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
