import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendances';
import { D1Database } from './db/types';

// 環境変数の型定義
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// ミドルウェアの設定
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
}));

// ヘルスチェックエンドポイント
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: '勤怠管理システムAPI',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
  });
});

// ルーティングの設定
app.route('/api/employees', employeeRoutes);
app.route('/api/attendances', attendanceRoutes);

// エラーハンドリング
app.onError((err, c) => {
  // Cloudflareワーカーでは標準的なロギングメカニズムを使用
  if (c.env.ENVIRONMENT === 'development') {
    // 開発環境ではエラー情報を出力
    // eslint-disable-next-line no-console
    console.error(`[Error] ${err.message}`, err.stack);
  }
  return c.json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  }, 500);
});

// 404ハンドリング
app.notFound((c) => {
  return c.json({
    status: 'error',
    message: 'Not Found',
  }, 404);
});

export default app; 