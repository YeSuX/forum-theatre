import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getScriptById } from "@/data/scripts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Clock, Users, Sparkles, ChevronLeft } from "lucide-react";
import { CharacterCard } from "@/components/script/character-card";

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-muted/50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Breadcrumb */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/">
              <ChevronLeft className="w-4 h-4 mr-1" />
              返回首页
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Cover Image */}
            <div className="relative aspect-video lg:aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={script.coverImage}
                alt={`${script.title}封面图`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Script Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  {script.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {script.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {script.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{script.duration}</span>
                </div>
              </div>

              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href={`/script/${script.id}/observation`}>
                  <Play className="w-5 h-5 mr-2" />
                  开始观演
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Characters */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users
                className="w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold">角色介绍</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {script.characters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          </div>

          <Separator />

          {/* Experience Guide */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles
                className="w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold">体验说明</h2>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <p className="text-muted-foreground pt-1">
                  你将观看 {script.acts.length} 幕短剧,了解冲突如何发生
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <p className="text-muted-foreground pt-1">
                  你将选择一个时刻,取代主角,尝试改变剧情
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <p className="text-muted-foreground pt-1">
                  没有标准答案,重要的是探索和思考
                </p>
              </li>
            </ol>
          </div>

          {/* CTA Footer */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold mb-1">准备好开始了吗?</h3>
                  <p className="text-sm text-muted-foreground">
                    探索这个故事,发现不同的可能性
                  </p>
                </div>
                <Button size="lg" asChild>
                  <Link href={`/script/${script.id}/observation`}>
                    <Play className="w-5 h-5 mr-2" />
                    开始观演
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
