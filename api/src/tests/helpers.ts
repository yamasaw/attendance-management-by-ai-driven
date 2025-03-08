import { vi } from 'vitest';
import { testClient } from 'hono/testing';
import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * テスト用のモックD1データベースを作成
 */
export function createMockDb() {
  const preparedStatement = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn(),
    raw: vi.fn(),
    run: vi.fn(),
  };

  const mockDb = {
    prepare: vi.fn().mockReturnValue(preparedStatement),
    exec: vi.fn(),
    batch: vi.fn(),
    dump: vi.fn(),
  };

  return mockDb as unknown as D1Database;
}

/**
 * テスト用のモックバインディングを作成
 */
export interface MockBindings {
  DB: D1Database;
  ENVIRONMENT: string;
}

/**
 * テスト用のモック環境を作成
 */
export function createTestEnv(customEnv?: Partial<MockBindings>): MockBindings {
  const mockDb = createMockDb();
  
  // 注意: 実際のテストではDB初期化は個別に行う
  // initDB(mockDb);
  
  return {
    DB: customEnv?.DB ?? mockDb,
    ENVIRONMENT: customEnv?.ENVIRONMENT ?? 'test',
  };
}

/**
 * テスト用のクライアント作成ヘルパー
 * Honoの公式テスティングヘルパーを使用
 */
export function createTestClient<T extends Hono>(app: T, env?: Partial<MockBindings>) {
  const testEnv = createTestEnv(env);
  return testClient(app, testEnv);
} 