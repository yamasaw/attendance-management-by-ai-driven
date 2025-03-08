import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cache } from 'hono/cache';

import { Attendance, D1Database } from '../db/types';
import { createAttendanceSchema, attendanceSearchParamsSchema } from '../schemas';

// 環境変数の型定義
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

// Honoアプリケーションの作成
const app = new Hono<{ Bindings: Bindings }>();

// 勤怠記録一覧取得
app.get('/', zValidator('query', attendanceSearchParamsSchema), cache({ cacheName: 'attendances-cache', cacheControl: 'max-age=60' }), async (c) => {
  try {
    const { employee_id, type, start_date, end_date, page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, e.name as employee_name, e.employee_code
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (employee_id) {
      query += ` AND a.employee_id = ?`;
      params.push(employee_id);
    }
    
    if (type) {
      query += ` AND a.type = ?`;
      params.push(type);
    }
    
    if (start_date) {
      query += ` AND a.timestamp >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND a.timestamp <= ?`;
      params.push(end_date);
    }
    
    // 総数を取得するクエリ
    const countQuery = query.replace('SELECT a.*, e.name as employee_name, e.employee_code', 'SELECT COUNT(*) as total');
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // ページング処理を追加
    query += ` ORDER BY a.timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
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
      message: error.message || '勤怠記録の取得に失敗しました',
    }, 500);
  }
});

// 勤怠記録詳細取得
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const query = `
      SELECT a.*, e.name as employee_name, e.employee_code
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `;
    
    const attendance = await c.env.DB.prepare(query).bind(id).first();
    
    if (!attendance) {
      return c.json({
        status: 'error',
        message: '勤怠記録が見つかりません',
      }, 404);
    }
    
    return c.json({
      status: 'success',
      data: attendance,
    });
  } catch (error: any) {
    return c.json({
      status: 'error',
      message: error.message || '勤怠記録の取得に失敗しました',
    }, 500);
  }
});

// 勤怠記録作成
app.post('/', zValidator('json', createAttendanceSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const timestamp = new Date().toISOString();
    
    // 従業員の存在確認
    const employee = await c.env.DB.prepare(`SELECT id FROM employees WHERE id = ?`).bind(data.employee_id).first();
    
    if (!employee) {
      return c.json({
        status: 'error',
        message: '指定された従業員が存在しません',
      }, 400);
    }
    
    const result = await c.env.DB.prepare(`
      INSERT INTO attendances (employee_id, type, timestamp, image_url, note, location, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.employee_id,
      data.type,
      data.timestamp || timestamp,
      data.image_url || null,
      data.note || null,
      data.location || null,
      timestamp,
      timestamp
    ).run();
    
    if (!result.success) {
      throw new Error(result.error || '勤怠記録の作成に失敗しました');
    }
    
    // 作成された勤怠記録を取得
    const newAttendanceId = result.meta?.last_row_id;
    const newAttendance = await c.env.DB.prepare(`
      SELECT a.*, e.name as employee_name, e.employee_code
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.id = ?
    `).bind(newAttendanceId).first();
    
    return c.json({
      status: 'success',
      message: '勤怠記録を作成しました',
      data: newAttendance,
    }, 201);
  } catch (error: any) {
    return c.json({
      status: 'error',
      message: error.message || '勤怠記録の作成に失敗しました',
    }, 500);
  }
});

// 勤怠記録削除 (管理者用)
app.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 勤怠記録の存在確認
    const existingAttendance = await c.env.DB.prepare(`SELECT * FROM attendances WHERE id = ?`).bind(id).first<Attendance>();
    
    if (!existingAttendance) {
      return c.json({
        status: 'error',
        message: '削除対象の勤怠記録が見つかりません',
      }, 404);
    }
    
    const result = await c.env.DB.prepare(`DELETE FROM attendances WHERE id = ?`).bind(id).run();
    
    if (!result.success) {
      throw new Error(result.error || '勤怠記録の削除に失敗しました');
    }
    
    return c.json({
      status: 'success',
      message: '勤怠記録を削除しました',
    });
  } catch (error: any) {
    return c.json({
      status: 'error',
      message: error.message || '勤怠記録の削除に失敗しました',
    }, 500);
  }
});

// 従業員ごとの勤怠記録一覧
app.get('/employee/:employeeId', zValidator('query', attendanceSearchParamsSchema), async (c) => {
  try {
    const employeeId = c.req.param('employeeId');
    const { type, start_date, end_date, page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;
    
    // 従業員の存在確認
    const employee = await c.env.DB.prepare(`SELECT * FROM employees WHERE id = ?`).bind(employeeId).first();
    
    if (!employee) {
      return c.json({
        status: 'error',
        message: '指定された従業員が存在しません',
      }, 404);
    }
    
    let query = `
      SELECT a.*, e.name as employee_name, e.employee_code
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = ?
    `;
    const params: any[] = [employeeId];
    
    if (type) {
      query += ` AND a.type = ?`;
      params.push(type);
    }
    
    if (start_date) {
      query += ` AND a.timestamp >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      query += ` AND a.timestamp <= ?`;
      params.push(end_date);
    }
    
    // 総数を取得するクエリ
    const countQuery = query.replace('SELECT a.*, e.name as employee_name, e.employee_code', 'SELECT COUNT(*) as total');
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;
    
    // ページング処理を追加
    query += ` ORDER BY a.timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
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
      message: error.message || '勤怠記録の取得に失敗しました',
    }, 500);
  }
});

export default app; 