import { describe, it, expect, vi, beforeEach } from 'vitest';
import getAttendanceListApp from '../get_attendance_list';
import { createTestEnv } from '@tests/helpers';
import * as fetchModule from '@model/attendance/fetch';
import { AttendanceType } from '@/types';

// getAttendancesをモック化
vi.mock('@model/attendance/fetch', () => ({
  getAttendances: vi.fn()
}));

describe('GET /attendances - 勤怠一覧取得API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：勤怠一覧を取得できること', async () => {
    // モックの戻り値を設定
    const mockAttendances = [
      {
        id: 1,
        employee_id: 1,
        type: 'check_in' as AttendanceType,
        timestamp: '2023-01-01T09:00:00.000Z',
        image_url: null,
        note: null,
        location: null,
        created_at: '2023-01-01T09:00:00.000Z',
        updated_at: '2023-01-01T09:00:00.000Z'
      },
      {
        id: 2,
        employee_id: 1,
        type: 'check_out' as AttendanceType,
        timestamp: '2023-01-01T18:00:00.000Z',
        image_url: null,
        note: null,
        location: null,
        created_at: '2023-01-01T18:00:00.000Z',
        updated_at: '2023-01-01T18:00:00.000Z'
      }
    ];

    vi.spyOn(fetchModule, 'getAttendances').mockResolvedValue({
      attendances: mockAttendances,
      total: 2
    });

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await getAttendanceListApp.request('/?page=1&limit=10', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      data: {
        attendances: mockAttendances,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1
        }
      }
    });
    
    // getAttendancesが正しく呼ばれたことを検証
    expect(fetchModule.getAttendances).toHaveBeenCalledWith({
      page: 1,
      limit: 10
    });
  });

  it('正常系：フィルタリングパラメータが正しく渡されること', async () => {
    // モックの戻り値を設定
    vi.spyOn(fetchModule, 'getAttendances').mockResolvedValue({
      attendances: [],
      total: 0
    });

    // テスト環境を作成
    const env = createTestEnv();

    // フィルタ付きリクエスト実行
    await getAttendanceListApp.request('/?page=1&limit=10&employee_id=1&type=check_in&start_date=2023-01-01T00:00:00.000Z&end_date=2023-01-31T23:59:59.999Z', {
      method: 'GET'
    }, env);
    
    // getAttendancesに正しいパラメータが渡されたことを検証
    expect(fetchModule.getAttendances).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      employee_id: 1,
      type: 'check_in',
      start_date: '2023-01-01T00:00:00.000Z',
      end_date: '2023-01-31T23:59:59.999Z'
    });
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // エラーをスローするモック
    vi.spyOn(fetchModule, 'getAttendances').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await getAttendanceListApp.request('/?page=1&limit=10', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '勤怠一覧の取得に失敗しました'
    });
  });
}); 