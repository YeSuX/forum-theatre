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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Lightbulb,
  Heart,
  Scale,
  Shield,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

export default function DeconstructionPage() {
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

  const handleContinue = () => {
    router.push(`/script/${params.id}/joker-questioning`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              让我们重新认识这些角色
            </h1>
            <p className="text-slate-300 text-lg">
              每个人都有自己的故事和压力
            </p>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {script.characters.map((character) => (
                <CarouselItem key={character.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700">
                      <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                          <Avatar className="w-32 h-32 border-4 border-purple-500/30">
                            <AvatarImage src={character.avatar} />
                            <AvatarFallback className="text-4xl">
                              {character.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <CardTitle className="text-3xl text-white">
                          {character.name}
                        </CardTitle>
                        <p className="text-slate-400">
                          {character.age} 岁 · {character.role}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-slate-300 leading-relaxed">
                            {character.background}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-700/30 rounded-lg p-4 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-5 h-5 text-purple-400" />
                              <h4 className="text-white font-semibold">
                                核心动机
                              </h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.coreMotivation}
                            </p>
                          </div>

                          <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="w-5 h-5 text-orange-400" />
                              <h4 className="text-white font-semibold">
                                隐秘压力
                              </h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.hiddenPressure}
                            </p>
                          </div>

                          <div className="bg-slate-700/30 rounded-lg p-4 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Scale className="w-5 h-5 text-blue-400" />
                              <h4 className="text-white font-semibold">
                                权力等级
                              </h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.powerLevel}
                            </p>
                          </div>

                          <div className="bg-slate-700/30 rounded-lg p-4 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-5 h-5 text-red-400" />
                              <h4 className="text-white font-semibold">
                                行为底线
                              </h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.behaviorBoundary}
                            </p>
                          </div>

                          <div className="bg-slate-700/30 rounded-lg p-4 border border-green-500/20 md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-5 h-5 text-green-400" />
                              <h4 className="text-white font-semibold">
                                语言风格
                              </h4>
                            </div>
                            <p className="text-slate-300 text-sm">
                              {character.languageStyle}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-slate-800/80 border-slate-700 text-white" />
            <CarouselNext className="bg-slate-800/80 border-slate-700 text-white" />
          </Carousel>

          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 gap-2"
              onClick={handleContinue}
            >
              继续
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
