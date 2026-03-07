'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Card, CardContent } from '@/components/ui/card';

const JOKER_QUESTIONS = [
  {
    id: 'q1',
    question: '你觉得这个冲突的核心问题是什么？',
    placeholder: '例如：代际差异、沟通方式、价值观冲突...',
  },
  {
    id: 'q2',
    question: '如果你是其中一个角色，你会有什么感受？',
    placeholder: '尝试站在角色的角度思考...',
  },
  {
    id: 'q3',
    question: '你认为有什么更好的解决方案吗？',
    placeholder: '分享你的想法...',
  },
];

export default function JokerQuestioningPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();
  const { setUserThoughts } = useDialogueStore();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const currentQuestion = JOKER_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === JOKER_QUESTIONS.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      const thoughts = Object.values(answers).filter((a) => a.trim());
      setUserThoughts(thoughts);
      router.push(`/script/${params.id}/intervention`);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSkip = () => {
    setUserThoughts([]);
    router.push(`/script/${params.id}/intervention`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🤡</div>
            <h1 className="text-4xl font-bold text-white mb-4">小丑提问</h1>
            <p className="text-purple-200 text-lg">
              在介入之前，让我们先思考一下
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20 mb-8">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-purple-300">
                    问题 {currentQuestionIndex + 1} / {JOKER_QUESTIONS.length}
                  </span>
                  <div className="flex gap-2">
                    {JOKER_QUESTIONS.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index <= currentQuestionIndex
                            ? 'bg-purple-500'
                            : 'bg-purple-300/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {currentQuestion.question}
                </h2>
              </div>

              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) =>
                  setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
                }
                placeholder={currentQuestion.placeholder}
                className="w-full h-40 px-4 py-3 bg-white/5 border border-purple-300/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 resize-none"
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-purple-500/30 hover:bg-purple-500/50 text-white rounded-lg transition-colors"
            >
              跳过提问
            </button>
            <div className="flex gap-4">
              {currentQuestionIndex > 0 && (
                <button
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex - 1)
                  }
                  className="px-6 py-3 bg-purple-500/50 hover:bg-purple-500/70 text-white rounded-lg transition-colors"
                >
                  上一题
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                {isLastQuestion ? '开始介入' : '下一题'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
