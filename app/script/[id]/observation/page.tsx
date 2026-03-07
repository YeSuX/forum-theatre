'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getScriptById } from '@/data/scripts';
import { useScriptStore } from '@/lib/stores/script-store';
import { ObservationView } from '@/components/observation-view';

export default function ObservationPage() {
  const params = useParams();
  const router = useRouter();
  const { loadScript, script, isScriptEnded } = useScriptStore();

  useEffect(() => {
    const scriptData = getScriptById(params.id as string);
    if (!scriptData) {
      router.push('/');
      return;
    }
    loadScript(scriptData);
  }, [params.id, loadScript, router]);

  useEffect(() => {
    if (isScriptEnded) {
      router.push(`/script/${params.id}/deconstruction`);
    }
  }, [isScriptEnded, params.id, router]);

  if (!script) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return <ObservationView />;
}
