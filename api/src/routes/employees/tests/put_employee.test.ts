import { describe, it, expect, vi, beforeEach } from 'vitest';
import putEmployeeApp from '../put_employee';
import { createTestEnv } from '../../../tests/helpers';
import * as updateModule from '../../../model/update';
import * as validateModule from '../../../model/validate';

// updateEmployeeとvalidateEmployeeをモック化
vi.mock('../../../model/update', () => ({
  updateEmployee: vi.fn()
}));

vi.mock('../../../model/validate', () => ({
  validateEmployee: vi.fn()
}));

describe('PUT /api/employees/:id - 従業員更新API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：従業員を更新できること', async () => {
    // バリデーション結果のモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // 更新データと更新後の従業員データ
    const updateData = {
      name: '更新太郎',
      department: '営業部',
      position: '課長'
    };
    
    const updatedEmployee = {
      id: 1,
      employee_code: 'EMP001',
      name: '更新太郎',
      department: '営業部',
      position: '課長',
      email: 'update@example.com',
      phone: '03-9876-5432',
      profile_image_url: null,
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    };
    
    // updateEmployeeの結果をモック
    vi.spyOn(updateModule, 'updateEmployee').mockResolvedValue(updatedEmployee);

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await putEmployeeApp.request('/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '従業員情報を更新しました',
      data: {
        employee: updatedEmployee
      }
    });
    
    // validateEmployeeが正しく呼ばれたことを検証
    expect(validateModule.validateEmployee).toHaveBeenCalledWith(updateData, true);
    
    // updateEmployeeが正しく呼ばれたことを検証
    expect(updateModule.updateEmployee).toHaveBeenCalledWith(1, updateData);
  });

  it('異常系：不正なIDの場合は400エラーが返されること', async () => {
    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行（不正なID）
    const res = await putEmployeeApp.request('/invalid-id', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: '更新太郎' })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '無効なIDです'
    });
    
    // validateEmployeeとupdateEmployeeが呼ばれていないことを検証
    expect(validateModule.validateEmployee).not.toHaveBeenCalled();
    expect(updateModule.updateEmployee).not.toHaveBeenCalled();
  });

  it('異常系：バリデーションエラーの場合は400エラーが返されること', async () => {
    const validationErrors = [
      { field: 'email', message: 'メールアドレスの形式が正しくありません' }
    ];
    
    // バリデーションエラーのモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: false,
      errors: validationErrors
    });

    // テスト環境を作成
    const env = createTestEnv();
    
    // 不正なデータでリクエスト実行
    const res = await putEmployeeApp.request('/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'invalid-email' })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('name', 'ZodError');
    expect(data.error).toHaveProperty('issues');
    expect(Array.isArray(data.error.issues)).toBe(true);
    
    // updateEmployeeが呼ばれていないことを検証
    expect(updateModule.updateEmployee).not.toHaveBeenCalled();
  });

  it('異常系：存在しない従業員IDの場合は404エラーが返されること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // 存在しない従業員IDの場合はnullを返す
    vi.spyOn(updateModule, 'updateEmployee').mockResolvedValue(null);

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await putEmployeeApp.request('/999', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: '更新太郎' })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(404);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員が見つかりません'
    });
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // updateEmployeeでエラー発生のモック
    vi.spyOn(updateModule, 'updateEmployee').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await putEmployeeApp.request('/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: '更新太郎' })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員情報の更新に失敗しました'
    });
  });
}); 