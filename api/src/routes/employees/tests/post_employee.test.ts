import { describe, it, expect, vi, beforeEach } from 'vitest';
import postEmployeeApp from '../post_employee';
import { createTestEnv } from '../../../tests/helpers';
import * as updateModule from '../../../model/update';
import * as validateModule from '../../../model/validate';

// createEmployeeとvalidateEmployeeをモック化
vi.mock('../../../model/update', () => ({
  createEmployee: vi.fn()
}));

vi.mock('../../../model/validate', () => ({
  validateEmployee: vi.fn()
}));

describe('POST /api/employees - 従業員作成API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：従業員を作成できること', async () => {
    // バリデーション結果のモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // 新規作成した従業員データのモック
    const newEmployeeData = {
      employee_code: 'EMP001',
      name: 'テスト太郎',
      department: '開発部',
      position: '主任',
      email: 'test@example.com',
      phone: '03-1234-5678',
      is_active: true
    };
    
    const createdEmployee = {
      id: 1,
      ...newEmployeeData,
      profile_image_url: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };
    
    // createEmployeeの結果をモック
    vi.spyOn(updateModule, 'createEmployee').mockResolvedValue(createdEmployee);

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await postEmployeeApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newEmployeeData)
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      message: '従業員を作成しました',
      data: {
        employee: createdEmployee
      }
    });
    
    // validateEmployeeが正しく呼ばれたことを検証
    expect(validateModule.validateEmployee).toHaveBeenCalledWith(newEmployeeData);
    
    // createEmployeeが正しく呼ばれたことを検証
    expect(updateModule.createEmployee).toHaveBeenCalledWith(newEmployeeData);
  });

  it('異常系：バリデーションエラーの場合は400エラーが返されること', async () => {
    const validationErrors = [
      { field: 'employee_code', message: '従業員コードは必須です' },
      { field: 'name', message: '名前は必須です' }
    ];
    
    // バリデーションエラーのモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: false,
      errors: validationErrors
    });

    // テスト環境を作成
    const env = createTestEnv();
    
    // 不完全なデータでリクエスト実行
    const res = await postEmployeeApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ department: '開発部' })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: 'データの検証に失敗しました',
      errors: validationErrors
    });
    
    // createEmployeeが呼ばれていないことを検証
    expect(updateModule.createEmployee).not.toHaveBeenCalled();
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // バリデーション通過のモック
    vi.spyOn(validateModule, 'validateEmployee').mockResolvedValue({
      valid: true,
      errors: []
    });
    
    // createEmployeeでエラー発生のモック
    vi.spyOn(updateModule, 'createEmployee').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await postEmployeeApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        employee_code: 'EMP001',
        name: 'テスト太郎',
        department: '開発部',
        position: '主任'
      })
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員の作成に失敗しました'
    });
  });
}); 