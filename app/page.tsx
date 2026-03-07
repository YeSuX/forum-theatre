import Link from 'next/link';
import { scripts } from '@/data/scripts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { SlideIn } from '@/components/ui/slide-in';
import { LazyImage } from '@/components/ui/lazy-image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <FadeIn className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            论坛剧场
          </h1>
          <p className="text-xl text-purple-200">
            在虚拟舞台上，探索真实的人性
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {scripts.map((script, index) => (
            <SlideIn key={script.id} delay={index * 100} direction="up">
              <Link href={`/script/${script.id}`}>
                <Card className="hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/10 backdrop-blur-sm border-purple-300/20 h-full">
                  <LazyImage
                    src={script.coverImage}
                    alt={script.title}
                    className="h-48 rounded-t-lg"
                  />
                  <CardHeader>
                    <CardTitle className="text-white">{script.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 mb-4">{script.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {script.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-500/30 text-purple-100 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-purple-300 text-sm">
                      时长：{script.duration}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </SlideIn>
          ))}
        </div>
      </div>
    </div>
  );
}
