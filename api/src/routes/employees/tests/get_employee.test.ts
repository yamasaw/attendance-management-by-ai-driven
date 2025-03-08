import { describe, it, expect, vi, beforeEach } from 'vitest';
import getEmployeeApp from '../get_employee';
import { createTestEnv } from '../../../tests/helpers';
import * as fetchModule from '../../../model/fetch';

// getEmployeeByIdをモック化
vi.mock('../../../model/fetch', () => ({
  getEmployeeById: vi.fn()
}));

describe('GET /api/employees/:id - 従業員詳細取得API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：従業員詳細を取得できること', async () => {
    // モックの戻り値を設定
    const mockEmployee = {
      id: 1,
      employee_code: 'EMP001',
      name: 'テスト太郎',
      department: '開発部',
      position: '主任',
      email: 'test@example.com',
      phone: '03-1234-5678',
      profile_image_url: null,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    vi.spyOn(fetchModule, 'getEmployeeById').mockResolvedValue(mockEmployee);

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await getEmployeeApp.request('/1', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      data: {
        employee: mockEmployee
      }
    });
    
    // getEmployeeByIdが正しく呼ばれたことを検証
    expect(fetchModule.getEmployeeById).toHaveBeenCalledWith(1);
  });

  it('異常系：存在しない従業員IDの場合は404エラーが返されること', async () => {
    // 存在しない従業員の場合はnullを返す
    vi.spyOn(fetchModule, 'getEmployeeById').mockResolvedValue(null);

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await getEmployeeApp.request('/999', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員が見つかりません'
    });
  });

  it('異常系：不正なIDの場合は400エラーが返されること', async () => {
    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行（不正なID）
    const res = await getEmployeeApp.request('/invalid-id', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '無効なIDです'
    });
    
    // getEmployeeByIdが呼ばれていないことを検証
    expect(fetchModule.getEmployeeById).not.toHaveBeenCalled();
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // getEmployeeByIdがエラーを投げるようにモック化
    vi.spyOn(fetchModule, 'getEmployeeById').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await getEmployeeApp.request('/1', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員詳細の取得に失敗しました'
    });
  });
}); 