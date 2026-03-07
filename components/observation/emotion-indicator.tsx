'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EmotionIndicatorProps {
  stressLevel: number;
  tensionLevel: 'low' | 'medium' | 'high';
  compact?: boolean;
}

export function EmotionIndicator({
  stressLevel,
  tensionLevel,
  compact = false,
}: EmotionIndicatorProps) {
  const tensionConfig = {
    low: { icon: '💧', label: '平静', color: 'text-blue-400' },
    medium: { icon: '🔥', label: '升温', color: 'text-orange-400' },
    high: { icon: '🔥🔥', label: '爆发', color: 'text-red-400' },
  };

  const config = tensionConfig[tensionLevel];

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">压力值</span>
          <span className="text-white font-bold">{stressLevel}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">火药味</span>
          <span className={config.color}>
            {config.icon} {config.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-slate-900 border-2 border-slate-700 p-3">
              <div className="text-white/60 text-xs mb-2">压力值</div>
              <div className="relative w-12 h-32 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-red-500"
                  initial={{ height: 0 }}
                  animate={{ height: `${stressLevel}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-white text-center mt-2 font-bold">
                {stressLevel}%
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>角色的压力水平</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-slate-900 border-2 border-slate-700 p-3">
              <div className="text-white/60 text-xs mb-2">火药味</div>
              <div className="text-3xl text-center">{config.icon}</div>
              <div className={`text-center mt-2 text-xs ${config.color}`}>
                {config.label}
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>对话的紧张程度</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
