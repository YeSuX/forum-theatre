import { Script } from '@/lib/types';
import cityMoonlight from './city-moonlight.json';

export const scripts: Script[] = [cityMoonlight as Script];

export function getScriptById(id: string): Script | undefined {
  return scripts.find((script) => script.id === id);
}
