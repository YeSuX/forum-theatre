"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useScriptStore } from "@/lib/stores/script-store";
import { useDialogueStore } from "@/lib/stores/dialogue-store";
import { moonshotAuthHeaders } from "@/lib/moonshot-auth-headers";
import { Report } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeroTypeBadge } from "@/components/report/hero-type-badge";
import { DimensionChart } from "@/components/report/dimension-chart";
import { ShareDialog } from "@/components/report/share-dialog";
import {
  Home,
  RotateCcw,
  Quote,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pointId = searchParams.get("point");

  const { script } = useScriptStore();
  const { messages, analysisResults, userThoughts } = useDialogueStore();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const generateReport = async () => {
    if (!script || !pointId) {
      console.error("[Report Page] Missing required params:", {
        script: !!script,
        pointId,
      });
      setError("缺少必要参数");
      setLoading(false);
      return;
    }

    if (messages.length === 0) {
      console.error("[Report Page] No messages found");
      setError("没有对话记录");
      setLoading(false);
      return;
    }

    try {
      console.log("[Report Page] Starting report generation...", {
        scriptId: script.id,
        pointId,
        messagesCount: messages.length,
        analysisCount: analysisResults.length,
        thoughtsCount: userThoughts.length,
      });

      setProgress(20);
      setError(null);

      const requestBody = {
        scriptId: script.id,
        interventionPointId: pointId,
        messages,
        analysisResults,
        userThoughts,
      };

      console.log("[Report Page] Sending request to /api/report");

      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...moonshotAuthHeaders(),
        },
        body: JSON.stringify(requestBody),
      });

      setProgress(60);
      console.log("[Report Page] Response received:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Report Page] API error:", errorData);
        throw new Error(errorData.message || errorData.error || "报告生成失败");
      }

      const data = await response.json();
      console.log("[Report Page] Report data received:", {
        hasReport: !!data.report,
        heroType: data.report?.heroType?.name,
        dimensions: data.report?.dimensions,
      });

      setProgress(90);

      if (!data.report) {
        throw new Error("服务器返回数据格式错误");
      }

      setReport(data.report);
      setProgress(100);
      console.log("[Report Page] Report set successfully");
      toast.success("报告生成完成！");
    } catch (error) {
      console.error("[Report Page] Failed to generate report:", error);
      console.error(
        "[Report Page] Error stack:",
        error instanceof Error ? error.stack : "No stack",
      );
      const errorMessage =
        error instanceof Error ? error.message : "报告生成失败";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsRegenerating(false);
    }
  };

  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    generateReport();
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setLoading(true);
    setProgress(0);
    setReport(null);
    generateReport();
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 标题骨架屏 */}
            <div className="text-center space-y-3">
              <Skeleton className="h-10 w-48 mx-auto" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>

            {/* 进度指示 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <p className="text-lg font-medium">正在生成你的专属报告</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress < 30 && "分析对话内容..."}
                    {progress >= 30 && progress < 70 && "评估沟通能力..."}
                    {progress >= 70 && progress < 95 && "生成个性化建议..."}
                    {progress >= 95 && "即将完成..."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 内容骨架屏 */}
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !report) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "无法生成报告，请重试"}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetry} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                重新生成
              </Button>
              <Button
                onClick={() =>
                  router.push(`/script/${params.id}/dialogue?point=${pointId}`)
                }
                variant="outline"
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                返回对话
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const point = script?.interventionPoints.find((p) => p.id === pointId);
  const userMessages = messages.filter((m) => m.role === "user");
  const aiMessages = messages.filter((m) => m.role === "ai");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 md:space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-bold">你的参演报告</h1>
                <p className="text-base md:text-lg text-muted-foreground mt-1">
                  恭喜完成这次探索！让我们看看你的表现
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="gap-2 shrink-0"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    生成中
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    重新生成
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* 对话概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  对话概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {messages.length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      总消息数
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {userMessages.length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      你的发言
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {aiMessages.length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      对方回应
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {analysisResults.length}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      分析轮次
                    </div>
                  </div>
                </div>
                {point && (
                  <div className="mt-4 p-3 rounded-lg border bg-card">
                    <div className="text-sm font-medium mb-2">介入点</div>
                    <div className="text-sm text-muted-foreground">
                      {point.title}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 英雄类型 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <HeroTypeBadge heroType={report.heroType} />
          </motion.div>

          {/* 能力维度 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <DimensionChart dimensions={report.dimensions} />
          </motion.div>

          {/* 关键时刻 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Quote className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg md:text-xl">关键时刻</CardTitle>
                </div>
                <CardDescription>这是你对话中最精彩的瞬间</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary rounded-r-lg p-4 bg-muted/50">
                  {report.keyMoment.speaker && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {report.keyMoment.speaker}
                    </div>
                  )}
                  <p className="italic leading-relaxed text-sm md:text-base">
                    &ldquo;{report.keyMoment.quote}&rdquo;
                  </p>
                </div>
                <div className="rounded-lg p-4 bg-card border">
                  <p className="text-sm md:text-base leading-relaxed">
                    {report.keyMoment.comment}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 对话回放 */}
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg md:text-xl">
                        对话回顾
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{messages.length} 条消息</Badge>
                  </div>
                  <CardDescription>回顾你与角色的精彩对话</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {messages.slice(0, 6).map((message) => {
                      const character = script?.characters.find(
                        (c) => c.id === message.characterId,
                      );
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={character?.avatar} />
                            <AvatarFallback>
                              {character?.name[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
                          >
                            <span className="text-xs text-muted-foreground">
                              {character?.name}
                            </span>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                isUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {messages.length > 6 && (
                      <div className="text-center text-xs text-muted-foreground py-2">
                        还有 {messages.length - 6} 条消息未显示
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 知识卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg md:text-xl">
                    {report.knowledge.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base leading-relaxed">
                  {report.knowledge.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-6 md:my-8" />

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4"
          >
            <ShareDialog report={report} />
            <Button
              variant="outline"
              onClick={() => router.push(`/script/${params.id}/intervention`)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              尝试其他介入点
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="gap-2"
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
