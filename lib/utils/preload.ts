import { Script } from '@/lib/types';

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map((src) => preloadImage(src)));
}

export async function preloadScriptAssets(script: Script) {
  const imageUrls = [
    script.coverImage,
    ...script.acts.map((act) => act.sceneBackground),
    ...script.characters.map((char) => char.avatar),
  ];

  await preloadImages(imageUrls);
}
