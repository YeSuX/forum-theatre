import { Card, CardContent } from '@/components/ui/card';
import { Act } from '@/lib/types/script';
import { Clapperboard } from 'lucide-react';

interface ActDividerProps {
  act: Act;
}

export function ActDivider({ act }: ActDividerProps) {
  return (
    <div className="my-16 animate-in fade-in zoom-in-95 duration-700">
      <Card className="border-2 border-dashed bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Clapperboard className="w-6 h-6 text-primary" aria-hidden="true" />
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {act.actNumber}
              </div>
              <Clapperboard className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">第 {act.actNumber} 幕</h3>
              <p className="text-xl font-semibold text-primary">{act.title}</p>
              {act.description && (
                <p className="text-sm text-muted-foreground max-w-md mx-auto pt-2">
                  {act.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
