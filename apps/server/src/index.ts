import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { env } from './config/env.js';
import { API_BASE_PATH } from './config/externalApis.js';
import { v1Router } from './routes/v1.js';
import { getLivePriceItems } from './services/liveDataService.js';

const app = express();
const isProduction = env.nodeEnv === 'production';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    name: 'jachwi-server',
    version: '1.0.0',
    apiBasePath: API_BASE_PATH,
  });
});

app.use(API_BASE_PATH, v1Router);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: '요청한 경로가 없습니다.',
    },
    meta: {
      requestId: `req_${Date.now()}`,
      path: req.path,
    },
  });
});

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const httpError = error as Error & { status?: number; statusCode?: number; type?: string };
  const statusCandidate = httpError.status ?? httpError.statusCode;
  const statusCode = typeof statusCandidate === 'number' &&
    Number.isInteger(statusCandidate) &&
    statusCandidate >= 400
    ? statusCandidate
    : 500;
  const isJsonParseError = statusCode === 400 && httpError.type === 'entity.parse.failed';
  const message = statusCode >= 500
    ? '서버 처리 중 오류가 발생했습니다.'
    : isJsonParseError
      ? '요청 JSON 형식이 올바르지 않습니다.'
      : httpError.message || '요청을 처리할 수 없습니다.';

  if (statusCode >= 500) {
    console.error('[server:error]', error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: isJsonParseError ? 'INVALID_JSON' : statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
      message,
      ...(!isProduction && httpError.stack ? { stack: httpError.stack } : {}),
    },
    meta: {
      requestId: `req_${Date.now()}`,
      path: req.path,
    },
  });
};

app.use(errorHandler);

const server = app.listen(env.port, env.host, () => {
  console.log(`jachwi-server listening on http://${env.host}:${env.port}${API_BASE_PATH}`);
  void getLivePriceItems()
    .then((items) => {
      console.log(`live price cache warmed with ${items.length} items`);
    })
    .catch((error: unknown) => {
      console.warn('live price cache warm-up failed', error instanceof Error ? error.message : String(error));
    });
});

let isShuttingDown = false;

function shutdown(signal: string, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`received ${signal}, closing jachwi-server`);

  const forceExitTimer = setTimeout(() => {
    console.error('server shutdown timed out');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close((error) => {
    clearTimeout(forceExitTimer);
    if (error) {
      console.error('server shutdown failed', error);
      process.exit(1);
    }

    process.exit(exitCode);
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('[server:unhandledRejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[server:uncaughtException]', error);
  shutdown('uncaughtException', 1);
});

export { app };
