import { getDB } from './db';
import { 
  NewEmployee, 
  EmployeeUpdate, 
  ValidationError, 
  ValidationResult 
} from '../types';

/**
 * 従業員データの検証
 * @param data 検証対象の従業員データ
 * @param isUpdate 更新時の検証かどうか
 */
export async function validateEmployee(
  data: NewEmployee | EmployeeUpdate,
  isUpdate: boolean = false
): Promise<ValidationResult> {
  const db = getDB();
  const errors: ValidationError[] = [];
  
  // 従業員コードが必要（新規作成時のみ）
  if (!isUpdate && 'employee_code' in data) {
    if (!data.employee_code || data.employee_code.trim() === '') {
      errors.push({
        field: 'employee_code',
        message: '従業員コードは必須です'
      });
    } else {
      // 従業員コードの重複チェック
      const exists = await db
        .selectFrom('employees')
        .select('id')
        .where('employee_code', '=', data.employee_code)
        .executeTakeFirst();
      
      if (exists) {
        errors.push({
          field: 'employee_code',
          message: 'この従業員コードは既に使用されています'
        });
      }
    }
  }
  
  // 名前は必須
  if ('name' in data && (!data.name || data.name.trim() === '')) {
    errors.push({
      field: 'name',
      message: '名前は必須です'
    });
  }
  
  // 部署は必須
  if ('department' in data && (!data.department || data.department.trim() === '')) {
    errors.push({
      field: 'department',
      message: '部署は必須です'
    });
  }
  
  // 役職は必須
  if ('position' in data && (!data.position || data.position.trim() === '')) {
    errors.push({
      field: 'position',
      message: '役職は必須です'
    });
  }
  
  // メールアドレスの形式チェック
  if ('email' in data && data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'メールアドレスの形式が正しくありません'
      });
    }
  }
  
  // 電話番号の形式チェック
  if ('phone' in data && data.phone) {
    const phoneRegex = /^[0-9\-+\s()]*$/;
    if (!phoneRegex.test(data.phone)) {
      errors.push({
        field: 'phone',
        message: '電話番号の形式が正しくありません'
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
} 