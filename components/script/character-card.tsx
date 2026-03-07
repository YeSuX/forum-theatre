'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Character } from '@/lib/types/script';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transition-colors hover:border-primary/50">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback>{character.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{character.name}</CardTitle>
                  <CardDescription>
                    {character.age} 岁 · {character.role}
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-muted-foreground transition-transform shrink-0',
                  isOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">背景</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {character.background}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">核心动机</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {character.coreMotivation}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">隐藏压力</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {character.hiddenPressure}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground">
                  权力等级
                </h4>
                <p className="text-sm">{character.powerLevel}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground">
                  语言风格
                </h4>
                <p className="text-sm">{character.languageStyle}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">行为边界</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {character.behaviorBoundary}
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
