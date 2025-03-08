import { getDB } from '@/utils/db';
import { 
  NewAttendance, 
  AttendanceUpdate 
} from '@/types';
import { Attendance as AttendanceType } from '@db/types';
import { getAttendanceById } from './fetch';

/**
 * 新しい勤怠記録を作成する
 */
export async function createAttendance(
  attendanceData: Omit<NewAttendance, 'created_at' | 'updated_at'> & { updated_at?: string }
): Promise<AttendanceType> {
  try {
    const db = getDB();
    const timestamp = new Date().toISOString();
    
    // タイムスタンプがない場合は現在時刻を設定
    const timestamp_value = attendanceData.timestamp || timestamp;
    
    // 作成データの準備（必須フィールドを確実に含める）
    const data = {
      employee_id: attendanceData.employee_id,
      type: attendanceData.type,
      timestamp: timestamp_value,
      image_url: attendanceData.image_url ?? null,
      note: attendanceData.note ?? null,
      location: attendanceData.location ?? null,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // 勤怠記録の作成
    const result = await db
      .insertInto('attendances')
      .values(data)
      .returning('id')
      .executeTakeFirstOrThrow();
    
    // 作成された勤怠記録を取得
    const createdAttendance = await getAttendanceById(result.id);
    
    if (!createdAttendance) {
      throw new Error('勤怠記録の作成後に取得できませんでした');
    }
    
    return createdAttendance;
  } catch (error) {
    console.error('勤怠記録作成エラー:', error);
    throw error;
  }
}

/**
 * 勤怠記録を更新する
 */
export async function updateAttendance(
  id: number, 
  update: AttendanceUpdate
): Promise<AttendanceType | null> {
  try {
    const db = getDB();
    const timestamp = new Date().toISOString();
    
    // 更新対象が存在するか確認
    const existingAttendance = await getAttendanceById(id);
    
    if (!existingAttendance) {
      return null;
    }
    
    // 更新データの準備
    const updateData: Record<string, unknown> = {
      updated_at: timestamp
    };
    
    // 更新するフィールドを追加
    if (update.employee_id !== undefined) {
      updateData.employee_id = update.employee_id;
    }
    
    if (update.type !== undefined) {
      updateData.type = update.type;
    }
    
    if (update.timestamp !== undefined) {
      updateData.timestamp = update.timestamp;
    }
    
    if (update.image_url !== undefined) {
      updateData.image_url = update.image_url;
    }
    
    if (update.note !== undefined) {
      updateData.note = update.note;
    }
    
    if (update.location !== undefined) {
      updateData.location = update.location;
    }
    
    // 勤怠記録の更新
    await db
      .updateTable('attendances')
      .set(updateData)
      .where('id', '=', id)
      .execute();
    
    // 更新された勤怠記録を取得
    const updatedAttendance = await getAttendanceById(id);
    
    return updatedAttendance;
  } catch (error) {
    console.error('勤怠記録更新エラー:', error);
    throw error;
  }
}

/**
 * 勤怠記録を削除する
 */
export async function deleteAttendance(id: number): Promise<boolean> {
  try {
    const db = getDB();
    
    // 削除対象が存在するか確認
    const existingAttendance = await getAttendanceById(id);
    
    if (!existingAttendance) {
      return false;
    }
    
    // 勤怠記録の削除
    await db
      .deleteFrom('attendances')
      .where('id', '=', id)
      .execute();
    
    return true;
  } catch (error) {
    console.error('勤怠記録削除エラー:', error);
    throw error;
  }
} 