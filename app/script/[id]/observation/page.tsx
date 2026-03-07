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
      console.log('Script ended, navigating to deconstruction page');
      router.push(`/script/${params.id}/deconstruction`);
    }
  }, [isScriptEnded, params.id, router]);

  if (!script) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return <ObservationView />;
}
