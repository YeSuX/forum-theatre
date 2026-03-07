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
import { Separator } from '@/components/ui/separator';
import { Share2, Download, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Report } from '@/lib/types';

interface ShareDialogProps {
  report: Report;
}

export function ShareDialog({ report }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
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
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !imageUrl && !isGenerating) {
      generateImage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Share2 className="w-4 h-4" />
          分享报告
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享你的参演报告</DialogTitle>
          <DialogDescription>
            生成精美的报告图片，分享到社交媒体
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 报告预览卡片 */}
          <div
            ref={reportRef}
            className="bg-linear-to-br from-primary/10 via-background to-primary/5 border-2 border-primary/20 p-6 rounded-xl"
          >
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-xl md:text-2xl font-bold">
                {report.heroType.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.heroType.description}
              </p>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-card border rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">边界感</div>
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {report.dimensions.boundary}
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">策略性</div>
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {report.dimensions.strategy}
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-1">同理心</div>
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {report.dimensions.empathy}
                  </div>
                </div>
              </div>
              
              <div className="text-muted-foreground text-xs mt-6 font-medium">
                Forum Theatre · 论坛剧场
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {isGenerating && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在生成图片...
            </div>
          )}

          {imageUrl && !isGenerating && (
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
                disabled={copied}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
