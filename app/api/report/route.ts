import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator } from '@/lib/engines/report-generator';
import { getScriptById } from '@/data/scripts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, analysisResults } = body;

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      );
    }

    const script = getScriptById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    const generator = new ReportGenerator(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

    const report = await generator.generateReport(
      scriptId,
      interventionPointId,
      messages,
      analysisResults,
      script.characters,
    );

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
