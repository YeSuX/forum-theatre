import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/lib/types/script';
import {
  Lightbulb,
  Heart,
  Scale,
  Shield,
  MessageSquare,
} from 'lucide-react';

interface CharacterDetailProps {
  character: Character;
}

const infoSections = [
  {
    key: 'coreMotivation' as const,
    label: '核心动机',
    icon: Lightbulb,
    description: '驱动角色行为的主要原因',
  },
  {
    key: 'hiddenPressure' as const,
    label: '隐秘压力',
    icon: Heart,
    description: '角色面临的内在压力',
  },
  {
    key: 'powerLevel' as const,
    label: '权力等级',
    icon: Scale,
    description: '在关系中的权力位置',
  },
  {
    key: 'behaviorBoundary' as const,
    label: '行为底线',
    icon: Shield,
    description: '不会跨越的界限',
  },
  {
    key: 'languageStyle' as const,
    label: '语言风格',
    icon: MessageSquare,
    description: '说话方式和特点',
  },
] as const;

export function CharacterDetail({ character }: CharacterDetailProps) {
  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6 lg:gap-8">
      {/* Left: Character Photo */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="relative aspect-3/4 bg-muted">
            {/* 占位图:可以替换为实际角色照片 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {character.name[0]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">角色照片占位</p>
              </div>
            </div>
            {/* 如果有实际照片,使用下面的代码 */}
            {/* <Image
              src={character.avatar}
              alt={`${character.name}的照片`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 400px"
            /> */}
          </div>
        </Card>

        {/* Character Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{character.name}</CardTitle>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary">{character.age} 岁</Badge>
              <Badge variant="outline">{character.role}</Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Right: Character Details */}
      <div className="space-y-6">
        {/* Background */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">角色背景</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {character.background}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          {infoSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    <CardTitle className="text-base">{section.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {character[section.key]}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
