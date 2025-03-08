import { describe, it, expect, vi, beforeEach } from 'vitest';
import postAttendanceApp from '../post_attendance';
import { createTestEnv } from '@tests/helpers';
import * as updateModule from '@model/attendance/update';
import * as validateModule from '@model/attendance/validate';
import { AttendanceType } from '@/types';

// createAttendanceとvalidateAttendanceをモック化
vi.mock('@model/attendance/update', () => ({
  createAttendance: vi.fn()
}));

vi.mock('@model/attendance/validate', () => ({
  validateAttendance: vi.fn()
}));

describe('POST /attendances - 勤怠作成API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：勤怠記録を作成できること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateAttendance').mockResolvedValue({
      valid: true,
      errors: []
    });

    // 作成成功のモック
    const createdAttendance = {
      id: 1,
      employee_id: 1,
      type: 'check_in' as AttendanceType,
      timestamp: '2023-01-01T09:00:00.000Z',
      image_url: null,
      note: null,
      location: null,
      created_at: '2023-01-01T09:00:00.000Z',
      updated_at: '2023-01-01T09:00:00.000Z'
    };
    vi.spyOn(updateModule, 'createAttendance').mockResolvedValue(createdAttendance);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await postAttendanceApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employee_id: 1,
        type: 'check_in',
        timestamp: '2023-01-01T09:00:00.000Z'
      })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '勤怠記録を作成しました',
      data: {
        attendance: {
          id: 1,
          employee_id: 1,
          type: 'check_in',
          timestamp: '2023-01-01T09:00:00.000Z',
          created_at: '2023-01-01T09:00:00.000Z',
          updated_at: '2023-01-01T09:00:00.000Z',
          image_url: null,
          location: null,
          note: null
        }
      }
    });
    
    // createAttendanceが正しく呼ばれたことを検証
    expect(updateModule.createAttendance).toHaveBeenCalledWith({
      employee_id: 1,
      type: 'check_in',
      timestamp: '2023-01-01T09:00:00.000Z'
    });
  });

  // it('異常系：バリデーションエラーの場合は400エラーが返されること', async () => {
  //   // テスト環境を作成
  //   const env = createTestEnv();

  //   // リクエスト実行
  //   const res = await postAttendanceApp.request('/', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ timestamp: '2023-01-01T09:00:00.000Z' })
  //   }, env);
    
  //   // レスポンスの検証
  //   expect(res.status).toBe(400);
    
  //   const data = await res.json();
  //   expect(data).toEqual({
  //     status: 'error',
  //     message: 'データの検証に失敗しました',
  //     errors: [
  //       {
  //         field: 'employee_id',
  //         message: '従業員IDは必須です'
  //       },
  //       {
  //         field: 'type',
  //         message: '勤怠タイプは必須です'
  //       }
  //     ]
  //   });
    
  //   // createAttendanceが呼ばれていないことを検証
  //   expect(updateModule.createAttendance).not.toHaveBeenCalled();
  // });
}); 