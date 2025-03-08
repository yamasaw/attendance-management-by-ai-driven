/**
 * API基本URL
 * 開発環境と本番環境で切り替え
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';

/**
 * 従業員情報を取得する
 */
export async function getEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    if (!response.ok) {
      throw new Error('従業員データの取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * 特定の従業員情報を取得する
 */
export async function getEmployee(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`);
    if (!response.ok) {
      throw new Error('従業員データの取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * 勤怠記録を作成する
 */
export async function createAttendance(data: {
  employee_id: number;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  photo_data: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/attendances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('勤怠データの記録に失敗しました');
    }
    
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
}

/**
 * 勤怠履歴を取得する
 */
export async function getAttendanceHistory(employeeId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/attendances/employee/${employeeId}`);
    if (!response.ok) {
      throw new Error('勤怠履歴の取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('APIエラー:', error);
    throw error;
  }
} 