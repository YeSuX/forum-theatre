import { create } from 'zustand';
import { Script, Act, Dialogue } from '@/lib/types';
import { ScriptEngine } from '@/lib/engines/script-engine';

interface ScriptState {
  script: Script | null;
  engine: ScriptEngine | null;
  currentAct: Act | null;
  currentDialogue: Dialogue | null;
  progress: number;
  stressLevel: number;
  tensionLevel: 'low' | 'medium' | 'high';
  isPlaying: boolean;
  isPaused: boolean;

  loadScript: (script: Script) => void;
  nextDialogue: () => void;
  previousDialogue: () => void;
  jumpToDialogue: (actIndex: number, dialogueIndex: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export const useScriptStore = create<ScriptState>((set, get) => ({
  script: null,
  engine: null,
  currentAct: null,
  currentDialogue: null,
  progress: 0,
  stressLevel: 0,
  tensionLevel: 'low',
  isPlaying: false,
  isPaused: false,

  loadScript: (script) => {
    const engine = new ScriptEngine(script);
    const currentAct = engine.getCurrentAct();
    const currentDialogue = engine.getCurrentDialogue();
    const progress = engine.getProgress();
    const stressLevel = engine.getCurrentStressLevel();
    const tensionLevel = engine.getCurrentTensionLevel();

    set({
      script,
      engine,
      currentAct,
      currentDialogue,
      progress,
      stressLevel,
      tensionLevel,
    });
  },

  nextDialogue: () => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.nextDialogue();
    if (!dialogue) {
      set({ isPlaying: false });
      return;
    }

    set({
      currentAct: engine.getCurrentAct(),
      currentDialogue: dialogue,
      progress: engine.getProgress(),
      stressLevel: engine.getCurrentStressLevel(),
      tensionLevel: engine.getCurrentTensionLevel(),
    });
  },

  previousDialogue: () => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.previousDialogue();
    if (!dialogue) return;

    set({
      currentAct: engine.getCurrentAct(),
      currentDialogue: dialogue,
      progress: engine.getProgress(),
      stressLevel: engine.getCurrentStressLevel(),
      tensionLevel: engine.getCurrentTensionLevel(),
    });
  },

  jumpToDialogue: (actIndex, dialogueIndex) => {
    const { engine } = get();
    if (!engine) return;

    const dialogue = engine.jumpToDialogue(actIndex, dialogueIndex);
    if (!dialogue) return;

    set({
      currentAct: engine.getCurrentAct(),
      currentDialogue: dialogue,
      progress: engine.getProgress(),
      stressLevel: engine.getCurrentStressLevel(),
      tensionLevel: engine.getCurrentTensionLevel(),
    });
  },

  play: () => set({ isPlaying: true, isPaused: false }),

  pause: () => set({ isPaused: true }),

  reset: () => {
    const { script } = get();
    if (!script) return;

    const engine = new ScriptEngine(script);
    set({
      engine,
      currentAct: engine.getCurrentAct(),
      currentDialogue: engine.getCurrentDialogue(),
      progress: 0,
      stressLevel: 0,
      tensionLevel: 'low',
      isPlaying: false,
      isPaused: false,
    });
  },
}));
