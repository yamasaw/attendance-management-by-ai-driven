import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cache } from 'hono/cache';

import { Employee, D1Database } from '../db/types';
import { employeeSchema, employeeSearchParamsSchema } from '../schemas';

// 環境変数の型定義
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// 従業員一覧取得
app.get('/', zValidator('query', employeeSearchParamsSchema), cache({ cacheName: 'employees-cache', cacheControl: 'max-age=60' }), async (c) => {
  try {
    const { department, is_active, name, page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM employees WHERE 1=1`;
    const params: any[] = [];
    
    if (department) {
      query += ` AND department = ?`;
      params.push(department);
    }
    
    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active ? 1 : 0);
    }
    
    if (name) {
      query += ` AND name LIKE ?`;
      params.push(`%${name}%`);
    }
    
    // 総数を取得するクエリ
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // ページング処理を追加
    query += ` ORDER BY id LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const result = await c.env.DB.prepare(query).bind(...params).all<Employee>();
    
    return c.json({
      status: 'success',
      data: result.results,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return c.json({
      status: 'error',
      message: error.message || '従業員一覧の取得に失敗しました',
    }, 500);
  }
});

// 従業員詳細取得
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const employee = await c.env.DB.prepare(`SELECT * FROM employees WHERE id = ?`).bind(id).first<Employee>();
    
    if (!employee) {
      return c.json({
        status: 'error',
        message: '従業員が見つかりません',
      }, 404);
    }
    
    return c.json({
      status: 'success',
      data: employee,
    });
  } catch (error: any) {
    return c.json({
      status: 'error',
      message: error.message || '従業員情報の取得に失敗しました',
    }, 500);
  }
});

// 従業員追加
app.post('/', zValidator('json', employeeSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const timestamp = new Date().toISOString();
    
    const result = await c.env.DB.prepare(`
      INSERT INTO employees (employee_code, name, department, position, email, phone, profile_image_url, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.employee_code,
      data.name,
      data.department,
      data.position,
      data.email || null,
      data.phone || null,
      data.profile_image_url || null,
      data.is_active ? 1 : 0,
      timestamp,
      timestamp
    ).run();
    
    if (!result.success) {
      throw new Error(result.error || '従業員の追加に失敗しました');
    }
    
    const newEmployee = await c.env.DB.prepare(`SELECT * FROM employees WHERE employee_code = ?`).bind(data.employee_code).first<Employee>();
    
    return c.json({
      status: 'success',
      message: '従業員を追加しました',
      data: newEmployee,
    }, 201);
  } catch (error: any) {
    // 重複エラーの処理
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({
        status: 'error',
        message: '従業員コードが既に使用されています',
      }, 400);
    }
    
    return c.json({
      status: 'error',
      message: error.message || '従業員の追加に失敗しました',
    }, 500);
  }
});

// 従業員更新
app.put('/:id', zValidator('json', employeeSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const data = c.req.valid('json');
    const timestamp = new Date().toISOString();
    
    // 従業員の存在確認
    const existingEmployee = await c.env.DB.prepare(`SELECT * FROM employees WHERE id = ?`).bind(id).first<Employee>();
    
    if (!existingEmployee) {
      return c.json({
        status: 'error',
        message: '更新対象の従業員が見つかりません',
      }, 404);
    }
    
    const result = await c.env.DB.prepare(`
      UPDATE employees SET
        employee_code = ?,
        name = ?,
        department = ?,
        position = ?,
        email = ?,
        phone = ?,
        profile_image_url = ?,
        is_active = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      data.employee_code,
      data.name,
      data.department,
      data.position,
      data.email || null,
      data.phone || null,
      data.profile_image_url || null,
      data.is_active ? 1 : 0,
      timestamp,
      id
    ).run();
    
    if (!result.success) {
      throw new Error(result.error || '従業員の更新に失敗しました');
    }
    
    const updatedEmployee = await c.env.DB.prepare(`SELECT * FROM employees WHERE id = ?`).bind(id).first<Employee>();
    
    return c.json({
      status: 'success',
      message: '従業員情報を更新しました',
      data: updatedEmployee,
    });
  } catch (error: any) {
    // 重複エラーの処理
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({
        status: 'error',
        message: '従業員コードが既に使用されています',
      }, 400);
    }
    
    return c.json({
      status: 'error',
      message: error.message || '従業員の更新に失敗しました',
    }, 500);
  }
});

// 従業員削除
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 従業員の存在確認
    const existingEmployee = await c.env.DB.prepare(`SELECT * FROM employees WHERE id = ?`).bind(id).first<Employee>();
    
    if (!existingEmployee) {
      return c.json({
        status: 'error',
        message: '削除対象の従業員が見つかりません',
      }, 404);
    }
    
    // 関連する勤怠記録の確認
    const attendanceCount = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM attendances WHERE employee_id = ?`).bind(id).first<{ count: number }>();
    
    if (attendanceCount && attendanceCount.count > 0) {
      return c.json({
        status: 'error',
        message: 'この従業員には勤怠記録が関連付けられているため削除できません',
      }, 400);
    }
    
    const result = await c.env.DB.prepare(`DELETE FROM employees WHERE id = ?`).bind(id).run();
    
    if (!result.success) {
      throw new Error(result.error || '従業員の削除に失敗しました');
    }
    
    return c.json({
      status: 'success',
      message: '従業員を削除しました',
    });
  } catch (error: any) {
    return c.json({
      status: 'error',
      message: error.message || '従業員の削除に失敗しました',
    }, 500);
  }
});

export default app; 