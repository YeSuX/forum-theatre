import type { NextRequest } from "next/server";
import { MOONSHOT_API_KEY_HEADER } from "@/lib/constants/moonshot";

/**
 * 优先使用请求头中的密钥（前端配置），否则使用部署环境变量。
 */
export function resolveMoonshotApiKey(request: NextRequest): string | undefined {
  const fromHeader = request.headers.get(MOONSHOT_API_KEY_HEADER)?.trim();
  if (fromHeader) return fromHeader;
  return process.env.MOONSHOT_API_KEY?.trim() || undefined;
}
