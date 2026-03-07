import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScriptById } from '@/data/scripts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Play, Clock, Users, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950">
      <div
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `url(${script.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px)',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:text-purple-400"
            asChild
          >
            <Link href="/">← 返回首页</Link>
          </Button>

          <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <h1 className="text-4xl font-bold text-white">
                    {script.title}
                  </h1>
                  <p className="text-xl text-slate-300">{script.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {script.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  角色介绍
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {script.characters.map((character) => (
                    <Card
                      key={character.id}
                      className="bg-slate-700/50 border-slate-600"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={character.avatar} />
                            <AvatarFallback>
                              {character.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="text-white font-semibold">
                              {character.name}
                            </h4>
                            <p className="text-slate-400 text-sm">
                              {character.age} 岁 · {character.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-600" />

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  体验说明
                </h3>
                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-sm">1</span>
                    </div>
                    <p>
                      你将观看 {script.acts.length} 幕短剧，了解冲突如何发生
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-sm">2</span>
                    </div>
                    <p>你将选择一个时刻，取代主角，尝试改变剧情</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-sm">3</span>
                    </div>
                    <p>没有标准答案，重要的是探索和思考</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-600" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{script.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">1.2k 人参演</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 gap-2"
                  asChild
                >
                  <Link href={`/script/${script.id}/observation`}>
                    <Play className="w-5 h-5" />
                    开始观演
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

