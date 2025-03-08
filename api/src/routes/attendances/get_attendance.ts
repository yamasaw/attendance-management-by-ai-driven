import { Hono } from 'hono';
import { Bindings } from '@routes/bindings';
import { getAttendanceById } from '@model/attendance/fetch';

// 勤怠詳細取得API
const app = new Hono<{ Bindings: Bindings }>();

app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({
        status: 'error',
        message: '無効なIDです'
      }, 400);
    }
    
    const attendance = await getAttendanceById(id);
    
    if (!attendance) {
      return c.json({
        status: 'error',
        message: '勤怠記録が見つかりません'
      }, 404);
    }
    
    return c.json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (error) {
    console.error('勤怠詳細取得エラー:', error);
    return c.json({
      status: 'error',
      message: '勤怠詳細の取得に失敗しました'
    }, 500);
  }
});

export default app; 