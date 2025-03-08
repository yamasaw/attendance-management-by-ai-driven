import { Context, MiddlewareHandler, Next } from 'hono';
import { initDB } from './model/db';

/**
 * DB接続用のミドルウェア
 * アプリケーション起動時にDB接続を初期化します
 */
export const dbMiddleware = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    // 環境変数からD1データベースインスタンスを取得してシングルトンを初期化
    initDB(c.env.DB);
    
    // 次のミドルウェアやハンドラーを実行
    await next();
  };
}; 