'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      color: 'bg-purple-500',
      icon: '🛡️',
      description: '清晰表达自己的底线和原则',
    },
    strategy: {
      label: '策略性',
      color: 'bg-blue-500',
      icon: '🎯',
      description: '采用有效的沟通策略',
    },
    empathy: {
      label: '同理心',
      color: 'bg-green-500',
      icon: '💚',
      description: '理解对方的感受和处境',
    },
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">你的沟通能力分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(dimensions).map(([key, value], index) => {
          const config =
            dimensionConfig[key as keyof typeof dimensionConfig];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold flex items-center gap-2">
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                <span className="text-white font-bold text-lg">{value}</span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                <motion.div
                  className={`absolute top-0 left-0 h-full ${config.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ delay: 0.5 + 0.1 * index, duration: 1 }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {config.description}
              </p>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
