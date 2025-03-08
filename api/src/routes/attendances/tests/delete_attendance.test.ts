import { describe, it, expect, vi, beforeEach } from 'vitest';
import deleteAttendanceApp from '../delete_attendance';
import { createTestEnv } from '@tests/helpers';
import * as fetchModule from '@model/attendance/fetch';
import * as updateModule from '@model/attendance/update';
import { AttendanceType } from '@/types';

// getAttendanceById, deleteAttendance をモック化
vi.mock('@model/attendance/fetch', () => ({
  getAttendanceById: vi.fn()
}));

vi.mock('@model/attendance/update', () => ({
  deleteAttendance: vi.fn()
}));

describe('DELETE /attendances/:id - 勤怠削除API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：勤怠記録を削除できること', async () => {
    // 存在する勤怠記録のモック
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
    vi.spyOn(updateModule, 'deleteAttendance').mockResolvedValue(true);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await deleteAttendanceApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '勤怠記録を削除しました'
    });
    
    // getAttendanceByIdとdeleteAttendanceが正しく呼ばれたことを検証
    expect(fetchModule.getAttendanceById).toHaveBeenCalledWith(1);
    expect(updateModule.deleteAttendance).toHaveBeenCalledWith(1);
  });

  it('異常系：無効なIDの場合は400エラーが返されること', async () => {
    // テスト環境を作成
    const env = createTestEnv();

    // 無効なIDでリクエスト実行
    const res = await deleteAttendanceApp.request('/invalid', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '無効なIDです'
    });
    
    // getAttendanceByIdとdeleteAttendanceが呼ばれていないことを検証
    expect(fetchModule.getAttendanceById).not.toHaveBeenCalled();
    expect(updateModule.deleteAttendance).not.toHaveBeenCalled();
  });

  it('異常系：存在しない勤怠IDの場合は404エラーが返されること', async () => {
    // 存在しない勤怠IDのモック
    vi.spyOn(fetchModule, 'getAttendanceById').mockResolvedValue(null);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await deleteAttendanceApp.request('/999', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '削除対象の勤怠記録が見つかりません'
    });
    
    // getAttendanceByIdが呼ばれ、deleteAttendanceが呼ばれていないことを検証
    expect(fetchModule.getAttendanceById).toHaveBeenCalledWith(999);
    expect(updateModule.deleteAttendance).not.toHaveBeenCalled();
  });

  it('異常系：削除失敗時に500エラーが返されること', async () => {
    // 存在する勤怠記録のモック
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
    vi.spyOn(updateModule, 'deleteAttendance').mockResolvedValue(false);

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await deleteAttendanceApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '勤怠記録の削除に失敗しました'
    });
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // 存在する勤怠記録のモック
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
    vi.spyOn(updateModule, 'deleteAttendance').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();

    // リクエスト実行
    const res = await deleteAttendanceApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '勤怠記録の削除に失敗しました'
    });
  });
}); 