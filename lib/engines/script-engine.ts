import { Script, Act, Dialogue } from '@/lib/types';

export class ScriptEngine {
  private script: Script;
  private currentActIndex: number = 0;
  private currentDialogueIndex: number = 0;

  constructor(script: Script) {
    this.script = script;
  }

  getCurrentAct(): Act {
    return this.script.acts[this.currentActIndex];
  }

  getCurrentDialogue(): Dialogue | null {
    const act = this.getCurrentAct();
    if (!act) return null;
    return act.dialogues[this.currentDialogueIndex] || null;
  }

  nextDialogue(): Dialogue | null {
    const act = this.getCurrentAct();
    if (!act) return null;

    if (this.currentDialogueIndex < act.dialogues.length - 1) {
      this.currentDialogueIndex++;
      return this.getCurrentDialogue();
    }

    if (this.currentActIndex < this.script.acts.length - 1) {
      this.currentActIndex++;
      this.currentDialogueIndex = 0;
      return this.getCurrentDialogue();
    }

    return null;
  }

  previousDialogue(): Dialogue | null {
    if (this.currentDialogueIndex > 0) {
      this.currentDialogueIndex--;
      return this.getCurrentDialogue();
    }

    if (this.currentActIndex > 0) {
      this.currentActIndex--;
      const act = this.getCurrentAct();
      this.currentDialogueIndex = act.dialogues.length - 1;
      return this.getCurrentDialogue();
    }

    return null;
  }

  jumpToDialogue(actIndex: number, dialogueIndex: number): Dialogue | null {
    if (actIndex < 0 || actIndex >= this.script.acts.length) {
      return null;
    }

    const act = this.script.acts[actIndex];
    if (dialogueIndex < 0 || dialogueIndex >= act.dialogues.length) {
      return null;
    }

    this.currentActIndex = actIndex;
    this.currentDialogueIndex = dialogueIndex;
    return this.getCurrentDialogue();
  }

  getAllDialogues(): Dialogue[] {
    return this.script.acts.flatMap((act) => act.dialogues);
  }

  getProgress(): number {
    const totalDialogues = this.getAllDialogues().length;
    const currentPosition =
      this.script.acts
        .slice(0, this.currentActIndex)
        .reduce((sum, act) => sum + act.dialogues.length, 0) +
      this.currentDialogueIndex;

    return Math.round((currentPosition / totalDialogues) * 100);
  }

  getCurrentStressLevel(): number {
    const dialogue = this.getCurrentDialogue();
    return dialogue?.stressLevel || 0;
  }

  getCurrentTensionLevel(): 'low' | 'medium' | 'high' {
    const dialogue = this.getCurrentDialogue();
    return dialogue?.tensionLevel || 'low';
  }

  getCharacter(characterId: string) {
    return this.script.characters.find((c) => c.id === characterId);
  }

  getInterventionPoints() {
    return this.script.interventionPoints;
  }

  getDialogueByInterventionPoint(interventionPointId: string): Dialogue | null {
    const point = this.script.interventionPoints.find(
      (p) => p.id === interventionPointId,
    );
    if (!point) return null;

    const act = this.script.acts.find((a) => a.id === point.actId);
    if (!act) return null;

    return act.dialogues.find((d) => d.id === point.dialogueId) || null;
  }

  getCurrentDialogueIndex(): number {
    return (
      this.script.acts
        .slice(0, this.currentActIndex)
        .reduce((sum, act) => sum + act.dialogues.length, 0) +
      this.currentDialogueIndex
    );
  }

  getTotalDialogues(): number {
    return this.getAllDialogues().length;
  }
}
