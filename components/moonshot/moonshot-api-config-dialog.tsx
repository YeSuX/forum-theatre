"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MOONSHOT_API_KEY_CHANGED_EVENT,
} from "@/lib/constants/moonshot";
import {
  clearStoredMoonshotApiKey,
  getStoredMoonshotApiKey,
  notifyMoonshotApiKeyChanged,
  setStoredMoonshotApiKey,
} from "@/lib/moonshot-auth-headers";
import { cn } from "@/lib/utils";

export function MoonshotApiConfigDialog({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const syncFromStorage = useCallback(() => {
    setValue(getStoredMoonshotApiKey() ?? "");
  }, []);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage, open]);

  useEffect(() => {
    const onChange = () => syncFromStorage();
    window.addEventListener(MOONSHOT_API_KEY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(MOONSHOT_API_KEY_CHANGED_EVENT, onChange);
  }, [syncFromStorage]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      setStoredMoonshotApiKey(trimmed);
    } else {
      clearStoredMoonshotApiKey();
    }
    notifyMoonshotApiKeyChanged();
    setOpen(false);
  };

  const handleClear = () => {
    setValue("");
    clearStoredMoonshotApiKey();
    notifyMoonshotApiKeyChanged();
  };

  const hasStored = Boolean(getStoredMoonshotApiKey());

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 z-50 h-11 w-11 rounded-full border bg-background/95 shadow-md backdrop-blur supports-backdrop-filter:bg-background/80",
          className,
        )}
        onClick={() => setOpen(true)}
        aria-label="API 配置"
      >
        <Settings2 className="h-5 w-5" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Moonshot API 配置</DialogTitle>
            <DialogDescription>
              填写 Kimi（Moonshot）API Key。将保存在本机浏览器中，请求 AI
              时会通过安全请求头传给服务端；若已在部署环境设置{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                MOONSHOT_API_KEY
              </code>
              ，则无需在此填写。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-2">
            <Label htmlFor="moonshot-api-key">MOONSHOT_API_KEY</Label>
            <Input
              id="moonshot-api-key"
              type="password"
              autoComplete="off"
              placeholder="sk-..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {hasStored ? (
              <p className="text-xs text-muted-foreground">
                当前已保存本地密钥，保存空内容可清除。
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClear}>
              清除本地
            </Button>
            <Button type="button" onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
