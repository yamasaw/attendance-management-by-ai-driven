import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { Attendance as AttendanceType } from '../db/types';
import { BaseSearchParams } from './common';

// 勤怠テーブルの定義
export interface AttendanceTable {
  id: Generated<number>;
  employee_id: number;
  type: 'check_in' | 'check_out' | 'break_start' | 'break_end';
  timestamp: string;
  image_url: string | null;
  note: string | null;
  location: string | null;
  created_at: ColumnType<string, string | undefined, never>;
  updated_at: ColumnType<string, string, string>;
}

// 型定義のラッパー
export type Attendance = Selectable<AttendanceTable>;
export type NewAttendance = Insertable<AttendanceTable>;
export type AttendanceUpdate = Updateable<AttendanceTable>;

// 検索条件の型定義
export interface AttendanceSearchParams extends BaseSearchParams {
  employee_id?: number;
  type?: 'check_in' | 'check_out' | 'break_start' | 'break_end';
  start_date?: string;
  end_date?: string;
}

// 既存の型定義との互換性を確保
export const toAttendanceType = (attendance: Attendance): AttendanceType => {
  return {
    ...attendance,
    created_at: attendance.created_at,
    updated_at: attendance.updated_at
  };
}; 