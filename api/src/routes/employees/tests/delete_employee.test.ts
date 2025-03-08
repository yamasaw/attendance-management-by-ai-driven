import { describe, it, expect, vi, beforeEach } from 'vitest';
import deleteEmployeeApp from '../delete_employee';
import { createTestEnv } from '@tests/helpers';
import * as fetchModule from '@model/fetch';
import * as updateModule from '@model/update';

// getEmployeeById, deactivateEmployee, deleteEmployee をモック化
vi.mock('@model/fetch', () => ({
  getEmployeeById: vi.fn()
}));

vi.mock('@model/update', () => ({
  deactivateEmployee: vi.fn(),
  deleteEmployee: vi.fn()
}));

describe('DELETE /api/employees/:id - 従業員削除API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：勤怠データがない場合は物理削除できること', async () => {
    // 従業員データのモック
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
    
    // getEmployeeByIdの結果をモック
    vi.spyOn(fetchModule, 'getEmployeeById').mockResolvedValue(mockEmployee);
    
    // 勤怠記録がないこと（0件）をモック
    const prepareStatement = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ count: 0 })
    };
    
    // D1 prepare関数のモック
    const mockPrepare = vi.fn().mockReturnValue(prepareStatement);
    
    // deleteEmployeeの結果をモック（成功）
    vi.spyOn(updateModule, 'deleteEmployee').mockResolvedValue(true);

    // テスト環境を作成
    const env = createTestEnv({
      DB: {
        prepare: mockPrepare
      } as any
    });
    
    // リクエスト実行
    const res = await deleteEmployeeApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '従業員を完全に削除しました'
    });
    
    // getEmployeeByIdが正しく呼ばれたことを検証
    expect(fetchModule.getEmployeeById).toHaveBeenCalledWith(1);
    
    // deleteEmployeeが正しく呼ばれ、deactivateEmployeeは呼ばれていないことを検証
    expect(updateModule.deleteEmployee).toHaveBeenCalledWith(1);
    expect(updateModule.deactivateEmployee).not.toHaveBeenCalled();
  });

  it('正常系：勤怠データがある場合は論理削除（非アクティブ化）できること', async () => {
    // 従業員データのモック
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
    
    // getEmployeeByIdの結果をモック
    vi.spyOn(fetchModule, 'getEmployeeById').mockResolvedValue(mockEmployee);
    
    // 勤怠記録がある（1件以上）ことをモック
    const prepareStatement = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ count: 3 })
    };
    
    // D1 prepare関数のモック
    const mockPrepare = vi.fn().mockReturnValue(prepareStatement);
    
    // deactivateEmployeeの結果をモック（成功）
    vi.spyOn(updateModule, 'deactivateEmployee').mockResolvedValue(true);

    // テスト環境を作成
    const env = createTestEnv({
      DB: {
        prepare: mockPrepare
      } as any
    });
    
    // リクエスト実行
    const res = await deleteEmployeeApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '従業員を非アクティブ化しました（勤怠記録があるため）'
    });
    
    // getEmployeeByIdが正しく呼ばれたことを検証
    expect(fetchModule.getEmployeeById).toHaveBeenCalledWith(1);
    
    // deactivateEmployeeが正しく呼ばれ、deleteEmployeeは呼ばれていないことを検証
    expect(updateModule.deactivateEmployee).toHaveBeenCalledWith(1);
    expect(updateModule.deleteEmployee).not.toHaveBeenCalled();
  });

  it('異常系：不正なIDの場合は400エラーが返されること', async () => {
    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行（不正なID）
    const res = await deleteEmployeeApp.request('/invalid-id', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '無効なIDです'
    });
    
    // 各関数が呼ばれていないことを検証
    expect(fetchModule.getEmployeeById).not.toHaveBeenCalled();
    expect(updateModule.deactivateEmployee).not.toHaveBeenCalled();
    expect(updateModule.deleteEmployee).not.toHaveBeenCalled();
  });

  it('異常系：存在しない従業員IDの場合は404エラーが返されること', async () => {
    // 存在しない従業員（null）をモック
    vi.spyOn(fetchModule, 'getEmployeeById').mockResolvedValue(null);

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await deleteEmployeeApp.request('/999', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員が見つかりません'
    });
    
    // getEmployeeByIdだけが呼ばれていることを検証
    expect(fetchModule.getEmployeeById).toHaveBeenCalledWith(999);
    expect(updateModule.deactivateEmployee).not.toHaveBeenCalled();
    expect(updateModule.deleteEmployee).not.toHaveBeenCalled();
  });

  it('異常系：削除に失敗した場合は500エラーが返されること', async () => {
    // 従業員データのモック（必須項目のみ）
    const mockEmployee = {
      id: 1,
      employee_code: 'EMP001',
      name: 'テスト太郎',
      department: '開発部',
      position: '主任',
      is_active: true,
      email: null,
      phone: null,
      profile_image_url: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    vi.spyOn(fetchModule, 'getEmployeeById').mockResolvedValue(mockEmployee);
    
    // 勤怠記録がないことをモック
    const prepareStatement = {
      bind: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue({ count: 0 })
    };
    const mockPrepare = vi.fn().mockReturnValue(prepareStatement);
    
    // deleteEmployeeの結果をモック（失敗）
    vi.spyOn(updateModule, 'deleteEmployee').mockResolvedValue(false);

    // テスト環境を作成
    const env = createTestEnv({
      DB: {
        prepare: mockPrepare
      } as any
    });
    
    // リクエスト実行
    const res = await deleteEmployeeApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員の削除に失敗しました'
    });
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // getEmployeeByIdでエラー発生のモック
    vi.spyOn(fetchModule, 'getEmployeeById').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await deleteEmployeeApp.request('/1', {
      method: 'DELETE'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員の削除に失敗しました'
    });
  });
}); 