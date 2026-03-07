import { toast } from 'sonner';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 404:
        toast.error('资源未找到');
        break;
      case 500:
        toast.error('服务器错误，请稍后重试');
        break;
      default:
        toast.error(error.message || '请求失败');
    }
  } else {
    toast.error('发生未知错误，请重试');
  }
  console.error('API Error:', error);
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.message || 'Request failed',
        response.status,
        error.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error', 0);
  }
}
