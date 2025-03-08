import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { Employee as EmployeeType } from '../db/types';
import { BaseSearchParams } from './common';

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

// 型定義のラッパー
export type Employee = Selectable<EmployeeTable>;
export type NewEmployee = Insertable<EmployeeTable>;
export type EmployeeUpdate = Updateable<EmployeeTable>;

// 検索条件の型定義
export interface EmployeeSearchParams extends BaseSearchParams {
  department?: string;
  is_active?: boolean;
  name?: string;
}

// 既存の型定義との互換性を確保
export const toEmployeeType = (employee: Employee): EmployeeType => {
  return {
    ...employee,
    created_at: employee.created_at,
    updated_at: employee.updated_at
  };
}; 