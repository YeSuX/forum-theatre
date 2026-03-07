'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScriptStore } from '@/lib/stores/script-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  MessageCircle,
  Heart,
  Shield,
  Network,
  ChevronRight,
  Users,
  Loader2,
} from 'lucide-react';

export default function InterventionPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const typeConfig = {
    communication: {
      label: '沟通能力',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      icon: MessageCircle,
    },
    empathy: {
      label: '同理心',
      color: 'bg-green-500/10 text-green-600 border-green-200',
      icon: Heart,
    },
    boundary: {
      label: '边界感',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
      icon: Shield,
    },
    systemic: {
      label: '系统性思维',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      icon: Network,
    },
  };

  const handlePointClick = (pointId: string) => {
    setSelectedPoint(pointId);
    setSelectedCharacter('');
    setIsDialogOpen(true);
  };

  const handleStartDialogue = () => {
    if (!selectedPoint || !selectedCharacter) return;
    router.push(
      `/script/${params.id}/dialogue?point=${selectedPoint}&character=${selectedCharacter}`
    );
  };

  const currentPoint = script.interventionPoints.find(
    (p) => p.id === selectedPoint
  );
  const currentAct = currentPoint
    ? script.acts.find((a) => a.id === currentPoint.actId)
    : null;

  // 所有角色都可以被扮演
  const availableCharacters = script.characters;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">选择你的介入点</h1>
            <p className="text-muted-foreground text-lg">
              在关键时刻介入，尝试改变故事的走向
            </p>
          </motion.div>

          <div className="space-y-4">
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
                    className="group hover:border-primary transition-all duration-300 cursor-pointer"
                    onClick={() => handlePointClick(point.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              第 {act?.actNumber} 幕
                            </Badge>
                            <Badge variant="outline">进度 {point.position}%</Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {point.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {point.scene}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground font-medium min-w-[60px]">
                            冲突：
                          </span>
                          <span>{point.conflict}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground font-medium min-w-[60px]">
                            挑战：
                          </span>
                          <span className="text-orange-600">{point.challenge}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 角色选择对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              选择你要扮演的角色
            </DialogTitle>
            {currentPoint && (
              <>
                <DialogDescription>
                  <span className="font-medium">{currentPoint.title}</span>
                  <span className="mx-2">·</span>
                  <span>第 {currentAct?.actNumber} 幕</span>
                </DialogDescription>
                <p className="text-xs text-muted-foreground">
                  你可以选择任何角色进行扮演，对话对象将限定在该幕中出现的其他角色
                </p>
              </>
            )}
          </DialogHeader>

          <div className="py-4">
            <RadioGroup
              value={selectedCharacter}
              onValueChange={setSelectedCharacter}
              className="space-y-3"
            >
              {availableCharacters.map((character) => (
                <div
                  key={character.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedCharacter(character.id)}
                >
                  <RadioGroupItem value={character.id} id={character.id} />
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={character.avatar} />
                    <AvatarFallback>{character.name[0]}</AvatarFallback>
                  </Avatar>
                  <Label
                    htmlFor={character.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{character.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {character.background}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleStartDialogue}
              disabled={!selectedCharacter}
            >
              开始对话
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
