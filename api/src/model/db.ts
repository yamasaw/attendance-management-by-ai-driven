import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { Database, D1Kysely } from '../types';
import type { D1Database } from '@cloudflare/workers-types';

// シングルトンインスタンスを保持する変数
let dbInstance: D1Kysely | null = null;

// DB接続インスタンスの初期化関数
export const initDB = (database: D1Database): void => {
  dbInstance = new D1Kysely(
    new Kysely<Database>({
      dialect: new D1Dialect({
        database
      })
    })
  );
};

// DB接続インスタンスの取得関数
export const getDB = (): D1Kysely => {
  if (!dbInstance) {
    throw new Error('DBが初期化されていません。先にinitDBを呼び出してください。');
  }
  return dbInstance;
};

// 後方互換性のための関数
export const createDB = (database: D1Database): D1Kysely => {
  return new D1Kysely(
    new Kysely<Database>({
      dialect: new D1Dialect({
        database
      })
    })
  );
}; 