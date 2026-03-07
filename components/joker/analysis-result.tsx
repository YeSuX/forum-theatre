import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles } from 'lucide-react';
import { JokerAnalysisResponse } from '@/lib/engines/joker-analysis-engine';

interface AnalysisResultProps {
  analysis: JokerAnalysisResponse;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">小丑的分析</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Analysis */}
        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {analysis.analysis}
          </p>
        </div>

        {/* Insights */}
        {analysis.insights.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">关键洞察</h4>
            </div>
            <div className="space-y-2">
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Badge variant="outline" className="shrink-0 mt-0.5">
                    {index + 1}
                  </Badge>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement */}
        {analysis.encouragement && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm italic text-muted-foreground">
              {analysis.encouragement}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
