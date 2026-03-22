export interface Script {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: string;
  coverImage: string;
  /** H.264 + AAC 的 MP4，Chrome / Edge / Firefox 可播，建议优先提供 */
  promoVideoWeb?: string;
  theme: {
    primary: string;
    secondary: string;
  };
  acts: Act[];
  characters: Character[];
  interventionPoints: InterventionPoint[];
}

export interface Act {
  id: string;
  actNumber: number;
  title: string;
  description: string;
  sceneBackground: string;
  dialogues: Dialogue[];
}

export interface Dialogue {
  id: string;
  actId: string;
  speaker: string;
  content: string;
  emotion: 'calm' | 'tense' | 'angry';
  stressLevel: number;
  tensionLevel: 'low' | 'medium' | 'high';
  timestamp?: number;
}

export interface Character {
  id: string;
  name: string;
  age: number;
  role: string;
  avatar: string;
  background: string;
  coreMotivation: string;
  hiddenPressure: string;
  powerLevel: string;
  behaviorBoundary: string;
  languageStyle: string;
  voiceId?: string;
}

export interface InterventionPoint {
  id: string;
  actId: string;
  dialogueId: string;
  title: string;
  scene: string;
  conflict: string;
  challenge: string;
  type: 'communication' | 'empathy' | 'boundary' | 'systemic';
  position: number;
  userPlaysAs: string;
  dialogueWith: string;
}
