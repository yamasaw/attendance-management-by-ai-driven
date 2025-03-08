import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { D1Database } from '@cloudflare/workers-types';
import { Database } from './types';
import { D1Database as CustomD1Database } from '../db/types';

// D1用のDialectを実装
export class D1Kysely extends Kysely<Database> {
  constructor(database: D1Database) {
    super({
      dialect: new D1Dialect({
        database
      })
    });
  }
}

// シングルトンインスタンスを保持する変数
let dbInstance: D1Kysely | null = null;

// DB接続インスタンスの初期化関数
export const initDB = (database: D1Database): void => {
  dbInstance = new D1Kysely(database);
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
  return new D1Kysely(database);
}; 