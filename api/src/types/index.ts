import { Kysely } from 'kysely';
import { EmployeeTable } from './employees';
import { AttendanceTable } from './attendances';

// Kyselyのデータベースインターフェース
export interface Database {
  employees: EmployeeTable;
  attendances: AttendanceTable;
}

// Kyselyインスタンスの型定義
export type D1Kysely = Kysely<Database>;

// 共通の型定義をエクスポート
export * from './common';

// 従業員関連の型定義をエクスポート
export * from './employees';

// 勤怠関連の型定義をエクスポート
export * from './attendances';

// 勤怠タイプ
export type AttendanceType = 'check_in' | 'check_out' | 'break_start' | 'break_end';

// 勤怠検索パラメータ
export interface AttendanceSearchParams {
  employee_id?: number;
  type?: AttendanceType;
  start_date?: string;
  end_date?: string;
  page: number;
  limit: number;
}

// 新規勤怠作成用
export interface NewAttendance {
  employee_id: number;
  type: AttendanceType;
  timestamp?: string;
  image_url?: string | null;
  note?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

// 勤怠更新用
export interface AttendanceUpdate {
  employee_id?: number;
  type?: AttendanceType;
  timestamp?: string;
  image_url?: string | null;
  note?: string | null;
  location?: string | null;
}

// Kysely用勤怠オブジェクト
export interface Attendance {
  id: number;
  employee_id: number;
  type: AttendanceType;
  timestamp: string;
  image_url: string | null;
  note: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
} 