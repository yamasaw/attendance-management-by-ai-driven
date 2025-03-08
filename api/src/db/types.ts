// D1データベースの型定義
export interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  exec: (query: string) => Promise<D1ExecResult>;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result<unknown>[]>;
  dump: () => Promise<ArrayBuffer>;
}

export interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  raw: <T = unknown>() => Promise<T[]>;
  run: () => Promise<D1ExecResult>;
}

export interface D1Result<T> {
  results: T[];
  success: boolean;
  error?: string;
  meta?: object;
}

export interface D1ExecResult {
  success: boolean;
  error?: string;
  meta?: {
    changes?: number;
    last_row_id?: number;
    size_after?: number;
    rows_read?: number;
    rows_written?: number;
  };
}

// モデルの型定義
export interface Employee {
  id: number;
  employee_code: string;
  name: string;
  department: string;
  position: string;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  type: 'check_in' | 'check_out' | 'break_start' | 'break_end';
  timestamp: string;
  image_url: string | null;
  note: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
} 