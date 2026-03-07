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
      return NextResponse.json(
        { error: 'Intervention point not found' },
        { status: 404 },
      );
    }

    const character = script.characters.find(
      (c) => c.id === interventionPoint.dialogueWith,
    );
    if (!character) {
      console.error(`Character not found: ${interventionPoint.dialogueWith}`);
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 },
      );
    }

    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .slice(-1)[0];
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 },
      );
    }

    const aiEngine = new AIDialogueEngine(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

    const analyzer = new DialogueAnalyzer(
      process.env.MOONSHOT_API_KEY,
      'https://api.moonshot.cn/v1',
    );

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

    const analysis = await analyzer.analyzeDialogue(messages);
    const hasDeadlock = analyzer.detectDeadlock(messages);

    return NextResponse.json({
      response,
      analysis,
      hasDeadlock,
      character: {
        id: character.id,
        name: character.name,
        avatar: character.avatar,
      },
    });
  } catch (error) {
    console.error('Dialogue API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
