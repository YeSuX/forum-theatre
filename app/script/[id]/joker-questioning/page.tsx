'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useScriptStore } from '@/lib/stores/script-store';
import { useDialogueStore } from '@/lib/stores/dialogue-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JokerAvatar } from '@/components/joker/joker-avatar';
import { QuestionInput } from '@/components/joker/question-input';
import { AnalysisResult } from '@/components/joker/analysis-result';
import { JokerAnalysisResponse } from '@/lib/engines/joker-analysis-engine';
import { Lightbulb, ChevronLeft, ChevronRight, SkipForward, Sparkles, Loader2 } from 'lucide-react';

const JOKER_QUESTIONS = [
  {
    id: 'q1',
    question: '你觉得这个冲突的核心问题是什么?',
    placeholder: '例如:代际差异、沟通方式、价值观冲突...',
    hint: '试着找出表面现象背后的深层原因',
  },
  {
    id: 'q2',
    question: '如果你是其中一个角色,你会有什么感受?',
    placeholder: '尝试站在角色的角度思考...',
    hint: '同理心是理解冲突的第一步',
  },
  {
    id: 'q3',
    question: '你认为有什么更好的解决方案吗?',
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
  const [analysis, setAnalysis] = useState<JokerAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!script) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const currentQuestion = JOKER_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === JOKER_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / JOKER_QUESTIONS.length) * 100;

  const handleAnalyze = async () => {
    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer || currentAnswer.trim().length < 10) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/joker-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptId: script.id,
          question: currentQuestion.question,
          userAnswer: currentAnswer,
          questionIndex: currentQuestionIndex,
          allAnswers: answers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API Error:', result);
        throw new Error(result.error || '分析请求失败');
      }

      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({
        analysis: '抱歉,分析过程中出现了问题。但你的思考本身就很有价值!',
        insights: ['继续保持这样的思考深度'],
        encouragement: '每一次思考都是成长的机会。',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const thoughts = Object.values(answers).filter((a) => a.trim());
      setUserThoughts(thoughts);
      router.push(`/script/${params.id}/intervention`);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnalysis(null); // 清除上一题的分析
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnalysis(null); // 清除分析
    }
  };

  const handleSkip = () => {
    setUserThoughts([]);
    router.push(`/script/${params.id}/intervention`);
  };

  const currentAnswer = answers[currentQuestion.id] || '';
  const canAnalyze = currentAnswer.trim().length >= 10 && !isAnalyzing;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="flex justify-center">
              <JokerAvatar size="lg" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                让我们先思考一下
              </h1>
              <p className="text-lg text-muted-foreground">
                在介入之前,理解冲突的本质很重要
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                问题 {currentQuestionIndex + 1} / {JOKER_QUESTIONS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hint */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  {currentQuestion.hint}
                </AlertDescription>
              </Alert>

              {/* Input */}
              <QuestionInput
                id={currentQuestion.id}
                value={answers[currentQuestion.id] || ''}
                onChange={(value) => {
                  setAnswers({ ...answers, [currentQuestion.id]: value });
                  setAnalysis(null); // 清除分析当用户修改答案时
                }}
                placeholder={currentQuestion.placeholder}
                label="你的思考"
                minLength={10}
                maxLength={500}
              />

              {/* Analyze Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      小丑分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      小丑分析
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Result */}
          {analysis && (
            <AnalysisResult analysis={analysis} />
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="order-3 sm:order-1"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              跳过提问
            </Button>
            <div className="flex gap-3 order-1 sm:order-2">
              {currentQuestionIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  上一题
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 sm:flex-none"
              >
                {isLastQuestion ? '开始介入' : '下一题'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
