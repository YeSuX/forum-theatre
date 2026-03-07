'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { scripts } from '@/data/scripts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">
              AI 驱动的沉浸式体验
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white">
            成为观演者
            <br />
            <span className="text-purple-400">探索社会困境</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            不是解决问题，而是理解问题。
            在虚拟舞台上，与 AI 角色对话，探索沟通与人性。
          </p>

          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 border-2 border-purple-500"
            asChild
          >
            <a href="#scripts">开始探索</a>
          </Button>
        </motion.div>
      </section>

      <section id="scripts" className="container mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            探索议题
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script, index) => (
              <motion.div
                key={script.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Link href={`/script/${script.id}`}>
                  <Card className="group hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 bg-slate-900 border-2 border-slate-700 overflow-hidden">
                    <div className="relative h-48 overflow-hidden border-b-2 border-slate-700">
                      <img
                        src={script.coverImage}
                        alt={script.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    <CardHeader>
                      <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                        {script.title}
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        {script.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
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
                    </CardContent>

                    <CardFooter className="flex justify-between text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {script.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        1.2k 人参演
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
