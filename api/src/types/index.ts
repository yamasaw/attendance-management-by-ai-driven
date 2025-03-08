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