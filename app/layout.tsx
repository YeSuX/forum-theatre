import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { MoonshotApiConfigDialog } from "@/components/moonshot/moonshot-api-config-dialog";

export const metadata: Metadata = {
  title: "论坛剧场 - 在虚拟舞台上探索真实的人性",
  description:
    "一个数字化的论坛剧场体验平台，通过 AI 驱动的角色对话，让用户在虚拟舞台上探索真实的人性与沟通。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ErrorBoundary>
          <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            <main className="flex-1">{children}</main>
            {/* <Footer /> */}
            <MoonshotApiConfigDialog />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
