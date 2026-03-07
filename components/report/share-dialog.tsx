'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Report } from '@/lib/types';

interface ShareDialogProps {
  report: Report;
}

export function ShareDialog({ report }: ShareDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateImage = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
      });

      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
      toast.success('报告图片生成成功！');
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('生成图片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `forum-theatre-report-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    toast.success('图片已下载！');
  };

  const copyToClipboard = async () => {
    if (!imageUrl) return;

    try {
      const blob = await (await fetch(imageUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      toast.success('图片已复制到剪贴板！');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('复制失败，请重试');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          onClick={generateImage}
        >
          <Share2 className="w-4 h-4" />
          分享报告
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-slate-900 border-2 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">分享你的参演报告</DialogTitle>
          <DialogDescription className="text-slate-300">
            生成精美的报告图片，分享到社交媒体
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            ref={reportRef}
            className="bg-slate-950 border-4 border-purple-500 p-6 rounded-lg"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {report.heroType.name}
              </h3>
              <p className="text-purple-200 text-sm">
                {report.heroType.description}
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-purple-950 border-2 border-purple-500 rounded-lg p-3">
                  <div className="text-purple-300 text-xs">边界感</div>
                  <div className="text-white text-xl font-bold">
                    {report.dimensions.boundary}
                  </div>
                </div>
                <div className="bg-blue-950 border-2 border-blue-500 rounded-lg p-3">
                  <div className="text-blue-300 text-xs">策略性</div>
                  <div className="text-white text-xl font-bold">
                    {report.dimensions.strategy}
                  </div>
                </div>
                <div className="bg-green-950 border-2 border-green-500 rounded-lg p-3">
                  <div className="text-green-300 text-xs">同理心</div>
                  <div className="text-white text-xl font-bold">
                    {report.dimensions.empathy}
                  </div>
                </div>
              </div>
              <div className="text-purple-300 text-xs mt-6">
                Forum Theatre · 论坛剧场
              </div>
            </div>
          </div>

          {imageUrl && (
            <div className="flex gap-2">
              <Button
                onClick={downloadImage}
                className="flex-1 gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                下载图片
              </Button>
              <Button
                onClick={copyToClipboard}
                className="flex-1 gap-2"
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制图片
                  </>
                )}
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center text-sm text-muted-foreground">
              正在生成图片...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
