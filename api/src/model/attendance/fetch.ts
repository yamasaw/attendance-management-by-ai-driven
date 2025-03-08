import { SelectQueryBuilder, sql } from 'kysely';
import { getDB } from '@/utils/db';
import { 
  Attendance,
  AttendanceSearchParams 
} from '@/types';
import { Attendance as AttendanceType } from '@db/types';

// 単一の勤怠記録をIDで取得
export async function getAttendanceById(id: number): Promise<AttendanceType | null> {
  try {
    const db = getDB();
    
    const result = await db
      .selectFrom('attendances')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    return result || null;
  } catch (error) {
    console.error('勤怠記録取得エラー:', error);
    throw error;
  }
}

// 従業員IDによる勤怠記録の取得
export async function getAttendancesByEmployeeId(
  employeeId: number,
  params: Partial<AttendanceSearchParams> = {}
): Promise<{ attendances: AttendanceType[], total: number }> {
  try {
    const db = getDB();
    const { page = 1, limit = 10, type, start_date, end_date } = params;
    const offset = (page - 1) * limit;
    
    // 条件を構築
    let whereConditions = (qb: any) => {
      qb = qb.where('employee_id', '=', employeeId);
      
      if (type) {
        qb = qb.where('type', '=', type);
      }
      
      if (start_date) {
        qb = qb.where('timestamp', '>=', start_date);
      }
      
      if (end_date) {
        qb = qb.where('timestamp', '<=', end_date);
      }
      
      return qb;
    };
    
    // 総数カウント
    const totalResult = await db
      .selectFrom('attendances')
      .select(sql<number>`count(*)`.as('total'))
      .where(whereConditions)
      .executeTakeFirst();
    
    const total = totalResult?.total || 0;
    
    // 結果取得
    const attendances = await db
      .selectFrom('attendances')
      .selectAll()
      .where(whereConditions)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
    
    return {
      attendances,
      total
    };
  } catch (error) {
    console.error('従業員別勤怠記録取得エラー:', error);
    throw error;
  }
}

// 勤怠記録一覧取得
export async function getAttendances(
  params: AttendanceSearchParams
): Promise<{ attendances: AttendanceType[], total: number }> {
  try {
    const db = getDB();
    const { page = 1, limit = 10, employee_id, type, start_date, end_date } = params;
    const offset = (page - 1) * limit;
    
    // 条件を構築
    let whereConditions = (qb: any) => {
      if (employee_id) {
        qb = qb.where('employee_id', '=', employee_id);
      }
      
      if (type) {
        qb = qb.where('type', '=', type);
      }
      
      if (start_date) {
        qb = qb.where('timestamp', '>=', start_date);
      }
      
      if (end_date) {
        qb = qb.where('timestamp', '<=', end_date);
      }
      
      return qb;
    };
    
    // 総数カウント
    const totalResult = await db
      .selectFrom('attendances')
      .select(sql<number>`count(*)`.as('total'))
      .where(whereConditions)
      .executeTakeFirst();
    
    const total = totalResult?.total || 0;
    
    // 結果取得
    const attendances = await db
      .selectFrom('attendances')
      .selectAll()
      .where(whereConditions)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
    
    return {
      attendances,
      total
    };
  } catch (error) {
    console.error('勤怠記録一覧取得エラー:', error);
    throw error;
  }
} 