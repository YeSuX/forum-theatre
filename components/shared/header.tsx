import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-purple-300/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <span className="text-xl font-bold text-white">论坛剧场</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-purple-200 hover:text-white transition-colors"
            >
              首页
            </Link>
            <Link
              href="/#about"
              className="text-purple-200 hover:text-white transition-colors"
            >
              关于
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
