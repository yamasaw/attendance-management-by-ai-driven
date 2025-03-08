import { describe, it, expect, vi, beforeEach } from 'vitest';
import getEmployeeListApp from '../get_employee_list';
import { createTestEnv } from '@tests/helpers';
import * as fetchModule from '@model/employee';

// getEmployeesをモック化
vi.mock('@model/employee', () => ({
  getEmployees: vi.fn()
}));

describe('GET /api/employees - 従業員一覧取得API', () => {
  beforeEach(() => {
    // テスト前に毎回モックをリセット
    vi.resetAllMocks();
  });

  it('正常系：従業員一覧を取得できること', async () => {
    // モックの戻り値を設定
    const mockEmployees = [
      {
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
      }
    ];
    
    // getEmployeesをモック化
    vi.spyOn(fetchModule, 'getEmployees').mockResolvedValue({
      employees: mockEmployees,
      total: 1
    });

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await getEmployeeListApp.request('/?page=1&limit=10', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'success',
      data: {
        employees: mockEmployees,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      }
    });
    
    // getEmployeesが正しく呼ばれたことを検証
    expect(fetchModule.getEmployees).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      is_active: false
    });
  });

  it('正常系：フィルタリングパラメータが正しく渡されること', async () => {
    // モックの戻り値を設定
    vi.spyOn(fetchModule, 'getEmployees').mockResolvedValue({
      employees: [],
      total: 0
    });

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    await getEmployeeListApp.request('/?page=1&limit=10&department=開発部&is_active=true&name=テスト', {
      method: 'GET'
    }, env);
    
    // getEmployeesに正しいパラメータが渡されたことを検証
    expect(fetchModule.getEmployees).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      department: '開発部',
      is_active: true,
      name: 'テスト'
    });
  });

  it('異常系：エラー発生時に500エラーが返されること', async () => {
    // getEmployeesがエラーを投げるようにモック化
    vi.spyOn(fetchModule, 'getEmployees').mockRejectedValue(new Error('テストエラー'));

    // テスト環境を作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await getEmployeeListApp.request('/?page=1&limit=10', {
      method: 'GET'
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(500);
    
    const data = await res.json();
    expect(data).toEqual({
      status: 'error',
      message: '従業員一覧の取得に失敗しました'
    });
  });
}); 