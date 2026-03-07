'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getScriptById } from '@/data/scripts';
import { useScriptStore } from '@/lib/stores/script-store';
import { ObservationView } from '@/components/observation-view';

export default function ObservationPage() {
  const params = useParams();
  const router = useRouter();
  const { loadScript, script } = useScriptStore();

  useEffect(() => {
    const scriptData = getScriptById(params.id as string);
    if (!scriptData) {
      router.push('/');
      return;
    }
    loadScript(scriptData);
  }, [params.id, loadScript, router]);

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return <ObservationView />;
}
