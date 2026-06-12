import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { API_BASE_PATH } from './config/externalApis.js';
import { v1Router } from './routes/v1.js';
import { getLivePriceItems } from './services/liveDataService.js';

const app = express();

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
      path: req.path,
    },
  });
});

app.listen(env.port, env.host, () => {
  console.log(`jachwi-server listening on http://${env.host}:${env.port}${API_BASE_PATH}`);
  void getLivePriceItems()
    .then((items) => {
      console.log(`live price cache warmed with ${items.length} items`);
    })
    .catch((error: unknown) => {
      console.warn('live price cache warm-up failed', error instanceof Error ? error.message : String(error));
    });
});
