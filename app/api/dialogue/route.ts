import { NextRequest, NextResponse } from 'next/server';
import { AIDialogueEngine } from '@/lib/engines/ai-dialogue-engine';
import { DialogueAnalyzer } from '@/lib/engines/dialogue-analyzer';
import { getScriptById } from '@/data/scripts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptId, interventionPointId, messages, userThoughts } = body;

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

    const interventionPoint = script.interventionPoints.find(
      (p) => p.id === interventionPointId,
    );
    if (!interventionPoint) {
      console.error('Intervention point not found:', interventionPointId);
      return NextResponse.json(
        { error: 'Intervention point not found' },
        { status: 404 },
      );
    }

    console.log('Intervention point:', interventionPoint);
    console.log('Looking for character with id:', interventionPoint.dialogueWith);
    console.log('Available characters:', script.characters.map(c => ({ id: c.id, name: c.name })));

    const character = script.characters.find(
      (c) => c.id === interventionPoint.dialogueWith,
    );
    if (!character) {
      console.error(`Character not found: ${interventionPoint.dialogueWith}`);
      console.error('Available character IDs:', script.characters.map(c => c.id));
      return NextResponse.json(
        { 
          error: 'Character not found',
          details: {
            requestedId: interventionPoint.dialogueWith,
            availableIds: script.characters.map(c => c.id)
          }
        },
        { status: 404 },
      );
    }

    console.log('Found character:', { id: character.id, name: character.name });

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .slice(-1)[0];
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 },
      );
    }

    if (!process.env.MOONSHOT_API_KEY) {
      console.error('MOONSHOT_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      );
    }

    console.log('Initializing AI engines...');
    const aiEngine = new AIDialogueEngine(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

    const analyzer = new DialogueAnalyzer(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

    console.log('Generating AI response...');

    const response = await aiEngine.generateResponse(
      {
        scriptId,
        characterId: character.id,
        interventionPointId,
        dialogueHistory: messages,
        userInput: lastUserMessage.content,
        context: {
          userThoughts: userThoughts || [],
        },
      },
      character,
    );

    console.log('AI response generated:', response);

    const analysis = await analyzer.analyzeDialogue(messages);
    const hasDeadlock = analyzer.detectDeadlock(messages);

    console.log('Analysis complete:', { analysis, hasDeadlock });

    const result = {
      response,
      analysis,
      hasDeadlock,
      character: {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
      },
    };

    console.log('Returning result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Dialogue API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
