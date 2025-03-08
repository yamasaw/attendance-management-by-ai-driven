import { Hono } from 'hono';
import { Bindings } from '../../routes/bindings';
import { getEmployeeById } from '../../model/fetch';

// 従業員詳細取得API
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

export default app; 