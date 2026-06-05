import type { Request, Response } from 'express';

export function sendOk<T>(
  req: Request,
  res: Response,
  data: T,
  meta: Record<string, unknown> = {},
) {
  res.json({
    success: true,
    data,
    meta: {
      requestId: `req_${Date.now()}`,
      sourceUpdatedAt: '2024-12-20T00:00:00Z',
      cacheTtlSeconds: 600,
      path: req.path,
      ...meta,
    },
  });
}

export function sendNotFound(res: Response, message = '리소스를 찾을 수 없습니다.') {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message,
    },
    meta: {
      requestId: `req_${Date.now()}`,
    },
  });
}
