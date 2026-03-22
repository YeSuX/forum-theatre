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
          {/* 使用 padding 撑开高度，避免 flex 子项内仅 absolute 图片时高度塌陷 */}
          <div className="relative h-0 w-full overflow-hidden bg-zinc-950 pb-[133.33%]">
            <Image
              src={character.avatar}
              alt={`${character.name}立绘`}
              fill
              className="object-contain object-bottom"
              sizes="(max-width: 1024px) 100vw, 400px"
              priority
            />
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
