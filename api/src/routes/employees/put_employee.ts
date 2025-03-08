import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Bindings } from '@routes/bindings';
import { employeeSchema } from '@/schemas';
import { updateEmployee } from '@model/employee';
import { validateEmployee } from '@model/employee';

// 従業員更新API
const app = new Hono<{ Bindings: Bindings }>();

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

export default app; 