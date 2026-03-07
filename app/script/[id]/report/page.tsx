'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Report } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pointId = searchParams.get('point');

  const { script } = useScriptStore();
  const { messages, analysisResults } = useDialogueStore();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Failed to generate report:', error);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [script, pointId, messages, analysisResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">生成报告中...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">无法生成报告</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            你的沟通报告
          </h1>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-8">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎭</div>
              <CardTitle className="text-white text-3xl mb-2">
                {report.heroType.name}
              </CardTitle>
              <p className="text-purple-200">{report.heroType.description}</p>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                你的沟通维度
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-200">边界感</span>
                  <span className="text-white font-semibold">
                    {report.dimensions.boundary}
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${report.dimensions.boundary}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-200">策略性</span>
                  <span className="text-white font-semibold">
                    {report.dimensions.strategy}
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${report.dimensions.strategy}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-200">同理心</span>
                  <span className="text-white font-semibold">
                    {report.dimensions.empathy}
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${report.dimensions.empathy}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">关键时刻</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-500/20 border-l-4 border-purple-500 p-4 mb-4">
                <p className="text-white italic">{report.keyMoment.quote}</p>
              </div>
              <p className="text-purple-200">{report.keyMoment.comment}</p>
            </CardContent>
          </Card>

          {report.aiThoughts.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  AI 角色的内心独白
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.aiThoughts.map((thought, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4">
                    <div className="text-purple-300 font-semibold mb-2">
                      {thought.characterName}
                    </div>
                    <p className="text-white">{thought.thought}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                {report.knowledge.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-200">{report.knowledge.content}</p>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push(`/script/${params.id}/intervention`)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              尝试其他介入点
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-purple-500/50 hover:bg-purple-500/70 text-white font-semibold rounded-lg transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
