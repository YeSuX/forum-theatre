'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeadlockDialogProps {
  open: boolean;
  onContinue: () => void;
  onEnd: () => void;
}

export function DeadlockDialog({
  open,
  onContinue,
  onEnd,
}: DeadlockDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md bg-slate-900 border-2 border-purple-500">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-purple-600 border-4 border-purple-400 flex items-center justify-center text-5xl">
              🎭
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl text-white">
            哎呀，陷入僵局了！
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base text-slate-300">
            看起来你们在原地打转呢。要不要换个思路试试？
            或者，我们可以先停下来，看看刚才的对话有什么收获。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onContinue}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-600"
          >
            继续尝试
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onEnd}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 border-2 border-purple-500"
          >
            结束对话
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
