'use client';

import { useParams, useRouter } from 'next/navigation';
import { useScriptStore } from '@/lib/stores/script-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeconstructionPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            角色解构
          </h1>
          <p className="text-purple-200 text-center mb-12 text-lg">
            深入了解每个角色的内心世界
          </p>

          <div className="space-y-8">
            {script.characters.map((character) => (
              <Card
                key={character.id}
                className="bg-white/10 backdrop-blur-sm border-purple-300/20"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-20 h-20 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-white text-2xl">
                        {character.name}
                      </CardTitle>
                      <p className="text-purple-300">{character.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">
                      背景故事
                    </h3>
                    <p className="text-white">{character.background}</p>
                  </div>
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">
                      核心动机
                    </h3>
                    <p className="text-white">{character.coreMotivation}</p>
                  </div>
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">
                      隐藏压力
                    </h3>
                    <p className="text-white">{character.hiddenPressure}</p>
                  </div>
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">
                      权力水平
                    </h3>
                    <p className="text-white">{character.powerLevel}</p>
                  </div>
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">
                      行为边界
                    </h3>
                    <p className="text-white">{character.behaviorBoundary}</p>
                  </div>
                  <div>
                    <h3 className="text-purple-300 font-semibold mb-2">
                      语言风格
                    </h3>
                    <p className="text-white">{character.languageStyle}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() =>
                router.push(`/script/${params.id}/joker-questioning`)
              }
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-lg transition-colors"
            >
              继续：小丑提问
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
