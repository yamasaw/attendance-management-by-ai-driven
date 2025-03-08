import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cache } from 'hono/cache';

import { Employee, D1Database } from '../db/types';
import { employeeSchema, employeeSearchParamsSchema } from '../schemas';
import { getEmployees, getEmployeeById, getEmployeeByCode } from '../model/fetch';
import { createEmployee, updateEmployee, deactivateEmployee, deleteEmployee } from '../model/update';
import { validateEmployee } from '../model/validate';
import { dbMiddleware } from '../model/middleware';

// 環境変数の型定義
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// DB接続ミドルウェアを適用
app.use('*', dbMiddleware());

// 従業員一覧取得
app.get('/', zValidator('query', employeeSearchParamsSchema), cache({ cacheName: 'employees-cache', cacheControl: 'max-age=60' }), async (c) => {
  try {
    const params = c.req.valid('query');
    
    const { employees, total } = await getEmployees(params);
    
    return c.json({
      status: 'success',
      data: {
        employees,
        pagination: {
          total,
          page: params.page,
          limit: params.limit,
          pages: Math.ceil(total / params.limit)
        }
      }
    });
  } catch (error) {
    console.error('従業員一覧取得エラー:', error);
    return c.json({
      status: 'error',
      message: '従業員一覧の取得に失敗しました'
    }, 500);
  }
});

// 従業員詳細取得
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({
        status: 'error',
        message: '無効なIDです'
      }, 400);
    }
    
    const employee = await getEmployeeById(id);
    
    if (!employee) {
      return c.json({
        status: 'error',
        message: '従業員が見つかりません'
      }, 404);
    }
    
    return c.json({
      status: 'success',
      data: {
        employee
      }
    });
  } catch (error) {
    console.error('従業員詳細取得エラー:', error);
    return c.json({
      status: 'error',
      message: '従業員詳細の取得に失敗しました'
    }, 500);
  }
});

// 従業員新規作成
app.post('/', zValidator('json', employeeSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    // バリデーション
    const validationResult = await validateEmployee(data);
    
    if (!validationResult.valid) {
      return c.json({
        status: 'error',
        message: 'データの検証に失敗しました',
        errors: validationResult.errors
      }, 400);
    }
    
    // 従業員を作成
    const newEmployee = await createEmployee(data);
    
    return c.json({
      status: 'success',
      message: '従業員を作成しました',
      data: {
        employee: newEmployee
      }
    }, 201);
  } catch (error) {
    console.error('従業員作成エラー:', error);
    return c.json({
      status: 'error',
      message: '従業員の作成に失敗しました'
    }, 500);
  }
});

// 従業員更新
app.put('/:id', zValidator('json', employeeSchema.partial()), async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({
        status: 'error',
        message: '無効なIDです'
      }, 400);
    }
    
    const data = c.req.valid('json');
    
    // バリデーション
    const validationResult = await validateEmployee(data, true);
    
    if (!validationResult.valid) {
      return c.json({
        status: 'error',
        message: 'データの検証に失敗しました',
        errors: validationResult.errors
      }, 400);
    }
    
    // 従業員を更新
    const updatedEmployee = await updateEmployee(id, data);
    
    if (!updatedEmployee) {
      return c.json({
        status: 'error',
        message: '従業員が見つかりません'
      }, 404);
    }
    
    return c.json({
      status: 'success',
      message: '従業員情報を更新しました',
      data: {
        employee: updatedEmployee
      }
    });
  } catch (error) {
    console.error('従業員更新エラー:', error);
    return c.json({
      status: 'error',
      message: '従業員情報の更新に失敗しました'
    }, 500);
  }
});

// 従業員削除
app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({
        status: 'error',
        message: '無効なIDです'
      }, 400);
    }
    
    // 従業員の勤怠記録があるかどうかで論理削除か物理削除かを判断
    // 勤怠記録があれば論理削除、なければ物理削除
    const employeeData = await getEmployeeById(id);
    
    if (!employeeData) {
      return c.json({
        status: 'error',
        message: '従業員が見つかりません'
      }, 404);
    }
    
    // TODO: 勤怠記録のチェックロジックはモデルに移動する
    const attendanceCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM attendances WHERE employee_id = ?').bind(id).first<{ count: number }>();
    
    let result: boolean;
    
    if (attendanceCount && attendanceCount.count > 0) {
      // 勤怠記録がある場合は論理削除
      result = await deactivateEmployee(id);
      
      if (result) {
        return c.json({
          status: 'success',
          message: '従業員を非アクティブ化しました（勤怠記録があるため）'
        });
      }
    } else {
      // 勤怠記録がない場合は物理削除
      result = await deleteEmployee(id);
      
      if (result) {
        return c.json({
          status: 'success',
          message: '従業員を完全に削除しました'
        });
      }
    }
    
    // 削除失敗
    return c.json({
      status: 'error',
      message: '従業員の削除に失敗しました'
    }, 500);
  } catch (error) {
    console.error('従業員削除エラー:', error);
    return c.json({
      status: 'error',
      message: '従業員の削除に失敗しました'
    }, 500);
  }
});

export default app; 