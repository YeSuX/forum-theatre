'use client';

import { useEffect, useState } from 'react';

export function JokerAvatar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-10 scale-50'
      }`}
    >
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
          <span className="text-6xl">🤡</span>
        </div>
      </div>
    </div>
  );
}
