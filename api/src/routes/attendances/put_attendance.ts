import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Bindings } from '@routes/bindings';
import { createAttendanceSchema } from '@/schemas';
import { updateAttendance } from '@model/attendance/update';
import { validateAttendance } from '@model/attendance/validate';
import { z } from 'zod';

// 勤怠更新API
const app = new Hono<{ Bindings: Bindings }>();

// 更新用のスキーマを定義
const updateAttendanceSchema = createAttendanceSchema.extend({
  employee_id: z.number().positive().optional(),
  type: z.enum(['check_in', 'check_out', 'break_start', 'break_end']).optional(),
  timestamp: z.string().datetime().optional(),
});

app.put('/:id', zValidator('json', updateAttendanceSchema), async (c) => {
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
    const validationResult = await validateAttendance(data, true);
    
    if (!validationResult.valid) {
      return c.json({
        status: 'error',
        message: 'データの検証に失敗しました',
        errors: validationResult.errors
      }, 400);
    }
    
    // 勤怠記録を更新
    const updatedAttendance = await updateAttendance(id, data);
    
    if (!updatedAttendance) {
      return c.json({
        status: 'error',
        message: '更新対象の勤怠記録が見つかりません'
      }, 404);
    }
    
    const now = new Date().toISOString();
    return c.json({
      status: 'success',
      message: '勤怠記録を更新しました',
      data: {
        attendance: {
          id: updatedAttendance.id,
          employee_id: updatedAttendance.employee_id,
          type: updatedAttendance.type,
          timestamp: updatedAttendance.timestamp,
          created_at: updatedAttendance.timestamp,
          updated_at: now,
          image_url: data.image_url ?? null,
          location: data.location ?? null,
          note: data.note ?? null
        }
      }
    }, 200);
  } catch (error) {
    console.error('勤怠更新エラー:', error);
    return c.json({
      status: 'error',
      message: '勤怠記録の更新に失敗しました'
    }, 500);
  }
});

export default app; 