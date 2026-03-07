'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Target, Heart } from 'lucide-react';

interface DimensionChartProps {
  dimensions: {
    boundary: number;
    strategy: number;
    empathy: number;
  };
}

export function DimensionChart({ dimensions }: DimensionChartProps) {
  const dimensionConfig = {
    boundary: {
      label: '边界感',
      color: 'hsl(var(--chart-1))',
      icon: Shield,
      description: '清晰表达自己的底线和原则',
    },
    strategy: {
      label: '策略性',
      color: 'hsl(var(--chart-2))',
      icon: Target,
      description: '采用有效的沟通策略',
    },
    empathy: {
      label: '同理心',
      color: 'hsl(var(--chart-3))',
      icon: Heart,
      description: '理解对方的感受和处境',
    },
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: '优秀', variant: 'default' as const };
    if (score >= 60) return { label: '良好', variant: 'secondary' as const };
    if (score >= 40) return { label: '中等', variant: 'outline' as const };
    return { label: '待提升', variant: 'destructive' as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            你的沟通能力分析
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 md:space-y-6">
        {Object.entries(dimensions).map(([key, value], index) => {
          const config = dimensionConfig[key as keyof typeof dimensionConfig];
          const Icon = config.icon;
          const level = getScoreLevel(value);
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  <span className="font-semibold text-sm md:text-base">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={level.variant} className="text-xs">
                    {level.label}
                  </Badge>
                  <span className="font-bold text-lg md:text-xl">{value}</span>
                </div>
              </div>
              <div className="relative h-2.5 md:h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: config.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 0.3 + 0.1 * index, duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {config.description}
              </p>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
