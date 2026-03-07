export interface Message {
  id: string;
  role: 'user' | 'ai' | 'system';
  characterId?: string;
  content: string;
  timestamp: number;
  emotion?: 'calm' | 'tense' | 'angry';
}

export interface AIDialogueRequest {
  scriptId: string;
  characterId: string;
  interventionPointId: string;
  dialogueHistory: Message[];
  userInput: string;
  context: {
    userThoughts: string[];
    userCharacter?: {
      id: string;
      name: string;
      age: number;
      role: string;
      background: string;
      coreMotivation: string;
      hiddenPressure: string;
      powerLevel: string;
      behaviorBoundary: string;
      languageStyle: string;
    };
  };
}

export interface AIDialogueResponse {
  content: string;
  emotion: 'calm' | 'tense' | 'angry';
  internalThought: string;
}

export interface DialogueAnalysis {
  sentiment: number;
  strategy: number;
  boundary: number;
  empathy: number;
  tensionLevel: 'low' | 'medium' | 'high';
}
