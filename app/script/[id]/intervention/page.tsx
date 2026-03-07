'use client';

import { useParams, useRouter } from 'next/navigation';
import { useScriptStore } from '@/lib/stores/script-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InterventionPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const typeColors = {
    communication: 'from-blue-500/20 to-blue-600/20',
    empathy: 'from-green-500/20 to-green-600/20',
    boundary: 'from-yellow-500/20 to-orange-600/20',
    systemic: 'from-red-500/20 to-red-600/20',
  };

  const typeLabels = {
    communication: '沟通能力',
    empathy: '同理心',
    boundary: '边界感',
    systemic: '系统性思维',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            选择介入点
          </h1>
          <p className="text-purple-200 text-center mb-12 text-lg">
            在关键时刻介入，改变故事的走向
          </p>

          <div className="space-y-6">
            {script.interventionPoints.map((point) => {
              const act = script.acts.find((a) => a.id === point.actId);
              return (
                <Card
                  key={point.id}
                  className="bg-white/10 backdrop-blur-sm border-purple-300/20 hover:border-purple-300/40 transition-all cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/script/${params.id}/dialogue?point=${point.id}`,
                    )
                  }
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl mb-2">
                          {point.title}
                        </CardTitle>
                        <p className="text-purple-300 text-sm">
                          第 {act?.actNumber} 幕 · 进度 {point.position}%
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 bg-gradient-to-r ${typeColors[point.type]} rounded-full text-white text-sm`}
                      >
                        {typeLabels[point.type]}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-purple-300 font-semibold">
                        场景：
                      </span>
                      <span className="text-white ml-2">{point.scene}</span>
                    </div>
                    <div>
                      <span className="text-purple-300 font-semibold">
                        冲突：
                      </span>
                      <span className="text-white ml-2">{point.conflict}</span>
                    </div>
                    <div>
                      <span className="text-purple-300 font-semibold">
                        挑战：
                      </span>
                      <span className="text-white ml-2">{point.challenge}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
