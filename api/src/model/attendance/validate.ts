import { getDB } from '@/utils/db';
import { 
  NewAttendance, 
  AttendanceUpdate, 
  ValidationError, 
  ValidationResult 
} from '@/types';

/**
 * 勤怠データの検証
 */
export async function validateAttendance(
  data: NewAttendance | AttendanceUpdate,
  isUpdate: boolean = false
): Promise<ValidationResult> {
  try {
    const errors: ValidationError[] = [];
    const db = getDB();
    
    // 必須項目の検証（新規作成時）
    if (!isUpdate) {
      if (!data.employee_id) {
        errors.push({
          field: 'employee_id',
          message: '従業員IDは必須です'
        });
      }
      
      if (!data.type) {
        errors.push({
          field: 'type',
          message: '勤怠タイプは必須です'
        });
      }
    }
    
    // employee_idの存在検証
    if (data.employee_id) {
      const employee = await db
        .selectFrom('employees')
        .select('id')
        .where('id', '=', data.employee_id)
        .executeTakeFirst();
      
      if (!employee) {
        errors.push({
          field: 'employee_id',
          message: '指定された従業員IDが存在しません'
        });
      }
    }
    
    // typeの値チェック
    if (data.type && !['check_in', 'check_out', 'break_start', 'break_end'].includes(data.type)) {
      errors.push({
        field: 'type',
        message: '勤怠タイプは check_in, check_out, break_start, break_end のいずれかである必要があります'
      });
    }
    
    // timestamp形式チェック
    if (data.timestamp && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(data.timestamp)) {
      errors.push({
        field: 'timestamp',
        message: 'タイムスタンプの形式が正しくありません（ISO 8601形式が必要です）'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('勤怠データ検証エラー:', error);
    throw error;
  }
} 