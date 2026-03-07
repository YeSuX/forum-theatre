import Link from "next/link";
import Image from "next/image";
import { scripts } from "@/data/scripts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-sm text-primary">AI 驱动的沉浸式体验</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            成为观演者
            <br />
            <span className="text-primary">探索社会困境</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            不是解决问题,而是理解问题。 在虚拟舞台上,与 AI
            角色对话,探索沟通与人性。
          </p>

          <Button size="lg" asChild>
            <a href="#scripts">开始探索</a>
          </Button>
        </div>
      </header>

      {/* Scripts Section */}
      <section
        id="scripts"
        className="container mx-auto px-4 pb-16 sm:pb-20 lg:pb-24"
        aria-labelledby="scripts-heading"
      >
        <h2
          id="scripts-heading"
          className="text-2xl sm:text-3xl font-bold mb-8 text-center"
        >
          探索议题
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {scripts.map((script) => (
            <Link
              key={script.id}
              href={`/script/${script.id}`}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
              <Card className="h-full transition-colors hover:border-primary overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src="/placeholder.svg"
                    alt={`${script.title}封面图`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                    priority={false}
                  />
                </div>

                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {script.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {script.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {script.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{script.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    <span>1.2k 人参演</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
