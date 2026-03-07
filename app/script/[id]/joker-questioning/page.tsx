'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { JokerAvatar } from '@/components/joker/joker-avatar';
import { QuestionInput } from '@/components/joker/question-input';
import { Lightbulb, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

const JOKER_QUESTIONS = [
  {
    id: 'q1',
    question: '你觉得这个冲突的核心问题是什么？',
    placeholder: '例如：代际差异、沟通方式、价值观冲突...',
    hint: '试着找出表面现象背后的深层原因',
  },
  {
    id: 'q2',
    question: '如果你是其中一个角色，你会有什么感受？',
    placeholder: '尝试站在角色的角度思考...',
    hint: '同理心是理解冲突的第一步',
  },
  {
    id: 'q3',
    question: '你认为有什么更好的解决方案吗？',
    placeholder: '分享你的想法...',
    hint: '好的方案往往需要平衡各方需求',
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const currentQuestion = JOKER_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === JOKER_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / JOKER_QUESTIONS.length) * 100;

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
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <JokerAvatar size="lg" animate />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              让我们先思考一下
            </h1>
            <p className="text-slate-300 text-lg">
              在介入之前，理解冲突的本质很重要
            </p>
          </motion.div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">
                问题 {currentQuestionIndex + 1} / {JOKER_QUESTIONS.length}
              </span>
              <span className="text-slate-400 text-sm">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 mb-8">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                      {currentQuestion.question}
                    </h2>
                    <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <Lightbulb className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-purple-300 text-sm">
                        {currentQuestion.hint}
                      </p>
                    </div>
                  </div>

                  <QuestionInput
                    value={answers[currentQuestion.id] || ''}
                    onChange={(value) =>
                      setAnswers({ ...answers, [currentQuestion.id]: value })
                    }
                    placeholder={currentQuestion.placeholder}
                    minLength={10}
                    maxLength={500}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-slate-400 hover:text-white gap-2"
            >
              <SkipForward className="w-4 h-4" />
              跳过提问
            </Button>
            <div className="flex gap-3">
              {currentQuestionIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex - 1)
                  }
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一题
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 gap-2"
              >
                {isLastQuestion ? '开始介入' : '下一题'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
