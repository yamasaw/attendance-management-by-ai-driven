import { Hono } from 'hono';
import { Bindings } from '@routes/bindings';
import { getAttendanceById } from '@model/attendance/fetch';
import { deleteAttendance } from '@model/attendance/update';

// 勤怠削除API
const app = new Hono<{ Bindings: Bindings }>();

app.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    
    if (isNaN(id)) {
      return c.json({
        status: 'error',
        message: '無効なIDです'
      }, 400);
    }
    
    // 勤怠記録の存在確認
    const attendance = await getAttendanceById(id);
    
    if (!attendance) {
      return c.json({
        status: 'error',
        message: '削除対象の勤怠記録が見つかりません'
      }, 404);
    }
    
    // 勤怠記録の削除
    const result = await deleteAttendance(id);
    
    if (!result) {
      return c.json({
        status: 'error',
        message: '勤怠記録の削除に失敗しました'
      }, 500);
    }
    
    return c.json({
      status: 'success',
      message: '勤怠記録を削除しました'
    });
  } catch (error) {
    console.error('勤怠削除エラー:', error);
    return c.json({
      status: 'error',
      message: '勤怠記録の削除に失敗しました'
    }, 500);
  }
});

export default app; 