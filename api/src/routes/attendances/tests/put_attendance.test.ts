import { describe, it, expect, vi, beforeEach } from 'vitest';
import putAttendanceApp from '../put_attendance';
import { createTestEnv } from '@tests/helpers';
import * as updateModule from '@model/attendance/update';
import * as validateModule from '@model/attendance/validate';
import { AttendanceType } from '@/types';

// updateAttendanceとvalidateAttendanceをモック化
vi.mock('@model/attendance/update', () => ({
  updateAttendance: vi.fn()
}));

vi.mock('@model/attendance/validate', () => ({
  validateAttendance: vi.fn()
}));

describe('PUT /api/attendances/:id - 勤怠更新API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：勤怠記録を更新できること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateAttendance').mockResolvedValue({
      valid: true,
      errors: []
    });

    // 更新成功のモック
    const updatedAttendance = {
      id: 1,
      employee_id: 1,
      type: 'check_in' as AttendanceType,
      timestamp: '2023-01-01T09:30:00.000Z', // 更新後の時刻
      image_url: 'https://example.com/image.jpg',
      note: '遅刻しました',
      location: '東京オフィス',
      created_at: '2023-01-01T09:00:00.000Z',
      updated_at: '2023-01-01T09:30:00.000Z'
    };
    vi.spyOn(updateModule, 'updateAttendance').mockResolvedValue(updatedAttendance);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await putAttendanceApp.fetch(new Request('https://example.com/api/attendances/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: '2023-01-01T09:30:00.000Z',
        note: '遅刻しました',
        location: '東京オフィス',
        image_url: 'https://example.com/image.jpg'
      })
    }), env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '勤怠記録を更新しました',
      data: {
        attendance: updatedAttendance
      }
    });
    
    // updateAttendanceが正しく呼ばれたことを検証
    expect(updateModule.updateAttendance).toHaveBeenCalledWith(1, {
      timestamp: '2023-01-01T09:30:00.000Z',
      note: '遅刻しました',
      location: '東京オフィス',
      image_url: 'https://example.com/image.jpg'
    });
  });

  it('異常系：無効なIDの場合は400エラーが返されること', async () => {
    // テスト環境を作成
    const env = createTestEnv();

    // 無効なIDでリクエスト実行
    const res = await putAttendanceApp.fetch(new Request('https://example.com/api/attendances/invalid', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note: 'テスト' })
    }), env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '無効なIDです'
    });
    
    // updateAttendanceが呼ばれていないことを検証
    expect(updateModule.updateAttendance).not.toHaveBeenCalled();
  });

  it('異常系：バリデーションエラーの場合は400エラーが返されること', async () => {
    // バリデーションエラーのモック
    const validationErrors = [
      {
        field: 'type',
        message: '勤怠タイプは check_in, check_out, break_start, break_end のいずれかである必要があります'
      }
    ];
    
    vi.spyOn(validateModule, 'validateAttendance').mockResolvedValue({
      valid: false,
      errors: validationErrors
    });

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await putAttendanceApp.fetch(new Request('https://example.com/api/attendances/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'invalid_type' })
    }), env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: 'データの検証に失敗しました',
      errors: validationErrors
    });
    
    // updateAttendanceが呼ばれていないことを検証
    expect(updateModule.updateAttendance).not.toHaveBeenCalled();
  });

  it('異常系：存在しない勤怠IDの場合は404エラーが返されること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateAttendance').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // 存在しない勤怠IDのモック
    vi.spyOn(updateModule, 'updateAttendance').mockResolvedValue(null);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await putAttendanceApp.fetch(new Request('https://example.com/api/attendances/999', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note: 'テスト' })
    }), env);
    
    // レスポンスの検証
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '更新対象の勤怠記録が見つかりません'
    });
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateAttendance').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // エラーをスローするモック
    vi.spyOn(updateModule, 'updateAttendance').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await putAttendanceApp.fetch(new Request('https://example.com/api/attendances/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note: 'テスト' })
    }), env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '勤怠記録の更新に失敗しました'
    });
  });
}); 