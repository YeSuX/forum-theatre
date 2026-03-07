export function Footer() {
  return (
    <footer className="bg-slate-900/50 border-t border-purple-300/20 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <span className="text-white font-semibold">论坛剧场</span>
          </div>
          <div className="text-purple-300 text-sm text-center">
            <p>在虚拟舞台上，探索真实的人性</p>
          </div>
          <div className="text-purple-300 text-sm">
            <p>© 2026 Forum Theatre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
