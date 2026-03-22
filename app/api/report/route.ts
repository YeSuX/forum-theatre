import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator } from '@/lib/engines/report-generator';
import { getScriptById } from '@/data/scripts';
import { resolveMoonshotApiKey } from '@/lib/moonshot-resolve-api-key';

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveMoonshotApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'API key not configured: set MOONSHOT_API_KEY on server or configure in app settings',
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { scriptId, interventionPointId, messages, analysisResults, userThoughts } = body;

    console.log('[Report API] Request received:', {
      scriptId,
      interventionPointId,
      messagesCount: messages?.length,
      analysisCount: analysisResults?.length,
      thoughtsCount: userThoughts?.length,
    });

    const script = getScriptById(scriptId);
    if (!script) {
      console.error('[Report API] Script not found:', scriptId);
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    const interventionPoint = script.interventionPoints.find(
      (p) => p.id === interventionPointId
    );
    if (!interventionPoint) {
      console.error('[Report API] Intervention point not found:', interventionPointId);
      return NextResponse.json(
        { error: 'Intervention point not found' },
        { status: 404 }
      );
    }

    console.log('[Report API] Initializing ReportGenerator...');
    const generator = new ReportGenerator(apiKey, 'https://api.moonshot.cn/v1');

    console.log('[Report API] Generating report...');
    const report = await generator.generateReport(
      scriptId,
      interventionPointId,
      messages,
      analysisResults,
      script.characters,
      interventionPoint,
      userThoughts || [],
    );

    console.log('[Report API] Report generated successfully:', {
      heroType: report.heroType.name,
      dimensions: report.dimensions,
      hasKeyMoment: !!report.keyMoment,
      hasKnowledge: !!report.knowledge,
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('[Report API] Error:', error);
    console.error('[Report API] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
