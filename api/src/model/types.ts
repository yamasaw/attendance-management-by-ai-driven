import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { Employee as EmployeeType } from '../db/types';

// Kyselyのデータベースインターフェース
export interface Database {
  employees: EmployeeTable;
  attendances: AttendanceTable;
}

// 従業員テーブルの定義
export interface EmployeeTable {
  id: Generated<number>;
  employee_code: string;
  name: string;
  department: string;
  position: string;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  is_active: boolean;
  created_at: ColumnType<string, string | undefined, never>;
  updated_at: ColumnType<string, string, string>;
}

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
export type Employee = Selectable<EmployeeTable>;
export type NewEmployee = Insertable<EmployeeTable>;
export type EmployeeUpdate = Updateable<EmployeeTable>;

export type Attendance = Selectable<AttendanceTable>;
export type NewAttendance = Insertable<AttendanceTable>;
export type AttendanceUpdate = Updateable<AttendanceTable>;

// 既存の型定義との互換性を確保
export const toEmployeeType = (employee: Employee): EmployeeType => {
  return {
    ...employee,
    created_at: employee.created_at,
    updated_at: employee.updated_at
  };
}; 