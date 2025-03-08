import { getDB } from './db';
import { 
  NewEmployee, 
  EmployeeUpdate, 
  toEmployeeType 
} from '../types';
import { Employee as EmployeeType } from '../db/types';

/**
 * 新しい従業員を作成する
 */
export async function createEmployee(
  employeeData: Omit<NewEmployee, 'created_at' | 'updated_at'> & { updated_at?: string }
): Promise<EmployeeType> {
  const db = getDB();
  
  // タイムスタンプを設定
  const now = new Date().toISOString();
  const newEmployee: NewEmployee = {
    ...employeeData,
    created_at: now,
    updated_at: now
  };
  
  // 新規従業員をDBに挿入
  const result = await db
    .insertInto('employees')
    .values(newEmployee)
    .returning('id')
    .executeTakeFirstOrThrow();
  
  // 作成された従業員をIDで取得して返す
  const createdEmployee = await db
    .selectFrom('employees')
    .selectAll()
    .where('id', '=', result.id)
    .executeTakeFirstOrThrow();
  
  return toEmployeeType(createdEmployee);
}

/**
 * 従業員情報を更新する
 */
export async function updateEmployee(
  id: number, 
  update: EmployeeUpdate
): Promise<EmployeeType | null> {
  const db = getDB();
  
  // 対象の従業員が存在するか確認
  const exists = await db
    .selectFrom('employees')
    .select('id')
    .where('id', '=', id)
    .executeTakeFirst();
  
  if (!exists) {
    return null;
  }
  
  // 更新日時を設定
  const updateData = {
    ...update,
    updated_at: new Date().toISOString()
  };
  
  // 従業員情報を更新
  await db
    .updateTable('employees')
    .set(updateData)
    .where('id', '=', id)
    .execute();
  
  // 更新された従業員を取得して返す
  const updatedEmployee = await db
    .selectFrom('employees')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow();
  
  return toEmployeeType(updatedEmployee);
}

/**
 * 従業員を削除する（論理削除）
 */
export async function deactivateEmployee(id: number): Promise<boolean> {
  const db = getDB();
  
  // 対象の従業員が存在するか確認
  const exists = await db
    .selectFrom('employees')
    .select('id')
    .where('id', '=', id)
    .executeTakeFirst();
  
  if (!exists) {
    return false;
  }
  
  // 従業員を非アクティブに設定（論理削除）
  await db
    .updateTable('employees')
    .set({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .where('id', '=', id)
    .execute();
  
  return true;
}

/**
 * 従業員を完全に削除する（物理削除）
 * 注意: 関連する勤怠データ等も削除される可能性があります
 */
export async function deleteEmployee(id: number): Promise<boolean> {
  const db = getDB();
  
  // 対象の従業員が存在するか確認
  const exists = await db
    .selectFrom('employees')
    .select('id')
    .where('id', '=', id)
    .executeTakeFirst();
  
  if (!exists) {
    return false;
  }
  
  // 従業員を物理削除
  await db
    .deleteFrom('employees')
    .where('id', '=', id)
    .execute();
  
  return true;
} 