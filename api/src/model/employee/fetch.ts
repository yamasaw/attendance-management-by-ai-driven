import { sql } from 'kysely';
import { getDB } from '@/utils/db';
import { 
  EmployeeSearchParams, 
  toEmployeeType 
} from '@/types';
import { Employee as EmployeeType } from '@db/types';

// 単一の従業員をIDで取得
export async function getEmployeeById(id: number): Promise<EmployeeType | null> {
  const db = getDB();
  const employee = await db
    .selectFrom('employees')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
  
  return employee ? toEmployeeType(employee) : null;
}

// 従業員コードで検索
export async function getEmployeeByCode(code: string): Promise<EmployeeType | null> {
  const db = getDB();
  const employee = await db
    .selectFrom('employees')
    .selectAll()
    .where('employee_code', '=', code)
    .executeTakeFirst();
  
  return employee ? toEmployeeType(employee) : null;
}

// 従業員一覧を検索条件で取得
export async function getEmployees(
  params: EmployeeSearchParams
): Promise<{ employees: EmployeeType[], total: number }> {
  const db = getDB();
  const { department, is_active, name, page, limit } = params;
  const offset = (page - 1) * limit;
  
  let query = db
    .selectFrom('employees')
    .selectAll();
  
  // 検索条件の適用
  if (department) {
    query = query.where('department', '=', department);
  }
  
  if (is_active !== undefined) {
    query = query.where('is_active', '=', is_active);
  }
  
  if (name) {
    query = query.where('name', 'like', `%${name}%`);
  }
  
  // 総数カウントクエリ実行
  const countQuery = db
    .selectFrom('employees')
    .select(sql<number>`count(*) as count`.as('count'));
  
  // 検索条件の適用（カウントクエリにも同じ条件を適用）
  let countBuilder = countQuery;
  if (department) {
    countBuilder = countBuilder.where('department', '=', department);
  }
  
  if (is_active !== undefined) {
    countBuilder = countBuilder.where('is_active', '=', is_active);
  }
  
  if (name) {
    countBuilder = countBuilder.where('name', 'like', `%${name}%`);
  }
  
  // 結果取得とマッピング
  const [employeesResult, countResult] = await Promise.all([
    query
      .orderBy('id')
      .limit(limit)
      .offset(offset)
      .execute(),
    countBuilder.executeTakeFirstOrThrow()
  ]);
  
  return {
    employees: employeesResult.map(toEmployeeType),
    total: countResult.count
  };
} 