import { describe, it, expect, vi, beforeEach } from 'vitest';
import getAttendanceApp from '../get_attendance';
import { createTestEnv } from '@tests/helpers';
import * as fetchModule from '@model/attendance/fetch';
import { AttendanceType } from '@/types';

// getAttendanceByIdをモック化
vi.mock('@model/attendance/fetch', () => ({
  getAttendanceById: vi.fn()
}));

describe('GET /api/attendances/:id - 勤怠詳細取得API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：勤怠詳細を取得できること', async () => {
    // モックの戻り値を設定
    const mockAttendance = {
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

    vi.spyOn(fetchModule, 'getAttendanceById').mockResolvedValue(mockAttendance);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await getAttendanceApp.fetch(new Request('https://example.com/api/attendances/1'), env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      data: {
        attendance: mockAttendance
      }
    });
    
    // getAttendanceByIdが正しく呼ばれたことを検証
    expect(fetchModule.getAttendanceById).toHaveBeenCalledWith(1);
  });

  it('異常系：無効なIDの場合は400エラーが返されること', async () => {
    // テスト環境を作成
    const env = createTestEnv();

    // 無効なIDでリクエスト実行
    const res = await getAttendanceApp.fetch(new Request('https://example.com/api/attendances/invalid'), env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '無効なIDです'
    });
    
    // getAttendanceByIdが呼ばれていないことを検証
    expect(fetchModule.getAttendanceById).not.toHaveBeenCalled();
  });

  it('異常系：存在しない勤怠IDの場合は404エラーが返されること', async () => {
    // 存在しない勤怠IDのモック
    vi.spyOn(fetchModule, 'getAttendanceById').mockResolvedValue(null);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await getAttendanceApp.fetch(new Request('https://example.com/api/attendances/999'), env);
    
    // レスポンスの検証
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '勤怠記録が見つかりません'
    });
    
    // getAttendanceByIdが正しく呼ばれたことを検証
    expect(fetchModule.getAttendanceById).toHaveBeenCalledWith(999);
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // エラーをスローするモック
    vi.spyOn(fetchModule, 'getAttendanceById').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await getAttendanceApp.fetch(new Request('https://example.com/api/attendances/1'), env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '勤怠詳細の取得に失敗しました'
    });
  });
}); 