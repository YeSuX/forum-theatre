'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Report } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Confetti } from '@/components/ui/confetti';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HeroTypeBadge } from '@/components/report/hero-type-badge';
import { DimensionChart } from '@/components/report/dimension-chart';
import { ShareDialog } from '@/components/report/share-dialog';
import { Home, RotateCcw, Quote, Brain, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pointId = searchParams.get('point');

  const { script } = useScriptStore();
  const { messages, analysisResults } = useDialogueStore();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!script || !pointId || messages.length === 0) {
      return;
    }

    const generateReport = async () => {
      try {
        const response = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scriptId: script.id,
            interventionPointId: pointId,
            messages,
            analysisResults,
          }),
        });

        const data = await response.json();
        setReport(data.report);
        setShowConfetti(true);
        toast.success('报告生成完成！');
      } catch (error) {
        console.error('Failed to generate report:', error);
        toast.error('报告生成失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [script, pointId, messages, analysisResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-white text-xl mt-4">正在生成你的专属报告...</p>
        <p className="text-slate-400 text-sm mt-2">分析对话内容中</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">无法生成报告</p>
          <Button onClick={() => router.push('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Confetti trigger={showConfetti} duration={3000} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-3">
              你的参演报告
            </h1>
            <p className="text-slate-300 text-lg">
              恭喜完成这次探索！让我们看看你的表现
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <HeroTypeBadge heroType={report.heroType} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <DimensionChart dimensions={report.dimensions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Quote className="w-5 h-5 text-purple-400" />
                  <CardTitle className="text-white">关键时刻</CardTitle>
                </div>
                <CardDescription className="text-slate-300">
                  这是你对话中最精彩的瞬间
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-950/50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-4">
                  <p className="text-white italic leading-relaxed">
                    "{report.keyMoment.quote}"
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-slate-300">{report.keyMoment.comment}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {report.aiThoughts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mb-8"
            >
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-white">角色内心独白</CardTitle>
                  </div>
                  <CardDescription className="text-slate-300">
                    看看 AI 角色在对话中的真实想法
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.aiThoughts.map((thought, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + 0.1 * index, duration: 0.3 }}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm">
                            {thought.characterName[0]}
                          </span>
                        </div>
                        <span className="text-blue-300 font-semibold">
                          {thought.characterName}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {thought.thought}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-green-950/30 border-2 border-green-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-white">
                    {report.knowledge.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-green-200 leading-relaxed">
                  {report.knowledge.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-8 bg-slate-700" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <ShareDialog report={report} />
            <Button
              variant="outline"
              onClick={() => router.push(`/script/${params.id}/intervention`)}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              尝试其他介入点
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-white gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
