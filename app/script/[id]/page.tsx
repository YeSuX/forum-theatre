import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScriptById } from '@/data/scripts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const script = getScriptById(id);

  if (!script) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <Link
          href="/"
          className="text-purple-300 hover:text-purple-100 mb-8 inline-block"
        >
          ← 返回首页
        </Link>

        <div className="max-w-4xl mx-auto">
          <div
            className="h-96 bg-cover bg-center rounded-lg mb-8"
            style={{ backgroundImage: `url(${script.coverImage})` }}
          />

          <h1 className="text-5xl font-bold text-white mb-4">
            {script.title}
          </h1>
          <p className="text-xl text-purple-200 mb-8">{script.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {script.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-purple-500/30 text-purple-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {script.characters.map((character) => (
              <Card
                key={character.id}
                className="bg-white/10 backdrop-blur-sm border-purple-300/20"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-white">
                        {character.name}
                      </CardTitle>
                      <p className="text-purple-300 text-sm">
                        {character.role}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 text-sm">
                    {character.background}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link
              href={`/script/${script.id}/observation`}
              className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-lg transition-colors"
            >
              开始体验
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
