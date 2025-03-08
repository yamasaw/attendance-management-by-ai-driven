import type { D1Database as CloudflareD1Database } from '@cloudflare/workers-types';

// D1データベースの型定義
export interface D1Database extends CloudflareD1Database {}

// 各モデルの検索パラメータの基本インターフェース
export interface BaseSearchParams {
  page: number;
  limit: number;
}

// バリデーションエラーの型定義
export interface ValidationError {
  field: string;
  message: string;
}

// バリデーション結果の型定義
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
} 