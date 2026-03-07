import { create } from 'zustand';
import { Message, DialogueAnalysis } from '@/lib/types';

interface DialogueState {
  messages: Message[];
  analysisResults: DialogueAnalysis[];
  currentRound: number;
  maxRounds: number;
  isAITyping: boolean;
  hasDeadlock: boolean;
  userThoughts: string[];

  addMessage: (message: Message) => void;
  addAnalysis: (analysis: DialogueAnalysis) => void;
  setAITyping: (isTyping: boolean) => void;
  setDeadlock: (hasDeadlock: boolean) => void;
  setUserThoughts: (thoughts: string[]) => void;
  reset: () => void;
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  messages: [],
  analysisResults: [],
  currentRound: 0,
  maxRounds: 30,
  isAITyping: false,
  hasDeadlock: false,
  userThoughts: [],

  addMessage: (message) => {
    const { messages, currentRound } = get();
    set({
      messages: [...messages, message],
      currentRound: message.role === 'user' ? currentRound + 1 : currentRound,
    });
  },

  addAnalysis: (analysis) => {
    const { analysisResults } = get();
    set({
      analysisResults: [...analysisResults, analysis],
    });
  },

  setAITyping: (isTyping) => set({ isAITyping: isTyping }),

  setDeadlock: (hasDeadlock) => set({ hasDeadlock }),

  setUserThoughts: (thoughts) => set({ userThoughts: thoughts }),

  reset: () =>
    set({
      messages: [],
      analysisResults: [],
      currentRound: 0,
      isAITyping: false,
      hasDeadlock: false,
      userThoughts: [],
    }),
}));
