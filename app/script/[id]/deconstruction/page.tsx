'use client';

import { useParams, useRouter } from 'next/navigation';
import { useScriptStore } from '@/lib/stores/script-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { CharacterDetail } from '@/components/deconstruction/character-detail';

export default function DeconstructionPage() {
  const params = useParams();
  const router = useRouter();
  const { script } = useScriptStore();

  if (!script) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const handleContinue = () => {
    router.push(`/script/${params.id}/joker-questioning`);
  };

  const handleBack = () => {
    router.push(`/script/${params.id}/observation`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              重新认识这些角色
            </h1>
            <p className="text-lg text-muted-foreground">
              每个人都有自己的故事和压力
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue={script.characters[0]?.id} className="space-y-6">
            {/* Character Tabs */}
            <div className="w-full overflow-x-auto scrollbar-hide sm:overflow-x-visible">
              <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:grid sm:grid-cols-3 lg:flex lg:justify-center">
                {script.characters.map((character) => (
                  <TabsTrigger 
                    key={character.id} 
                    value={character.id} 
                    className="shrink-0 lg:flex-1"
                  >
                    {character.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Character Content */}
            {script.characters.map((character) => (
              <TabsContent key={character.id} value={character.id}>
                <CharacterDetail character={character} />
              </TabsContent>
            ))}
          </Tabs>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-12 pt-8 border-t">
            <Button variant="outline" onClick={handleBack} className="order-2 sm:order-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              返回观演
            </Button>
            <Button size="lg" onClick={handleContinue} className="order-1 sm:order-2">
              继续
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
