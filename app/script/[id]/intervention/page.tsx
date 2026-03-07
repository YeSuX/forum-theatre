'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Heart,
  Shield,
  Network,
  ChevronRight,
} from 'lucide-react';

export default function InterventionPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();

  if (!script) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const typeConfig = {
    communication: {
      label: '沟通能力',
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      icon: MessageCircle,
    },
    empathy: {
      label: '同理心',
      color: 'bg-green-500/20 text-green-300 border-green-500/30',
      icon: Heart,
    },
    boundary: {
      label: '边界感',
      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: Shield,
    },
    systemic: {
      label: '系统性思维',
      color: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: Network,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              选择你的介入点
            </h1>
            <p className="text-slate-300 text-lg">
              在关键时刻介入，尝试改变故事的走向
            </p>
          </motion.div>

          <div className="space-y-6">
            {script.interventionPoints.map((point, index) => {
              const act = script.acts.find((a) => a.id === point.actId);
              const config = typeConfig[point.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <Card
                    className="group hover:border-purple-500 transition-all duration-300 hover:-translate-y-1 bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/script/${params.id}/dialogue?point=${point.id}`
                      )
                    }
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                            >
                              第 {act?.actNumber} 幕
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-slate-700 text-slate-300 border-slate-600"
                            >
                              进度 {point.position}%
                            </Badge>
                          </div>
                          <CardTitle className="text-white text-xl group-hover:text-purple-400 transition-colors">
                            {point.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`${config.color} flex items-center gap-1`}
                          >
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="text-slate-400 text-sm mb-1">场景</div>
                        <div className="text-white">{point.scene}</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="text-slate-400 text-sm mb-1">冲突</div>
                        <div className="text-white">{point.conflict}</div>
                      </div>
                      <div className="bg-orange-950/30 rounded-lg p-4 border border-orange-500/30">
                        <div className="text-orange-400 text-sm mb-1">
                          你的挑战
                        </div>
                        <div className="text-orange-200">{point.challenge}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
