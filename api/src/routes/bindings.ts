import { D1Database } from '../db/types';

// 環境変数の型定義
export type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
}; 