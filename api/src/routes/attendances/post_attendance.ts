import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Bindings } from '@routes/bindings';
import { createAttendanceSchema } from '@/schemas';
import { createAttendance } from '@model/attendance/update';
import { validateAttendance } from '@model/attendance/validate';

// 勤怠作成API
const app = new Hono<{ Bindings: Bindings }>();

app.post('/', zValidator('json', createAttendanceSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    
    // バリデーション
    const validationResult = await validateAttendance(data);
    
    if (!validationResult.valid) {
      return c.json({
        status: 'error',
        message: 'データの検証に失敗しました',
        errors: validationResult.errors
      }, 400);
    }
    
    // 勤怠記録を作成
    const newAttendance = await createAttendance(data);
    
    return c.json({
      status: 'success',
      message: '勤怠記録を作成しました',
      data: {
        attendance: newAttendance
      }
    }, 201);
  } catch (error) {
    console.error('勤怠作成エラー:', error);
    return c.json({
      status: 'error',
      message: '勤怠記録の作成に失敗しました'
    }, 500);
  }
});

export default app; 