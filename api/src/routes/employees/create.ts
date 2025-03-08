import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { Bindings } from '../../routes/bindings';
import { employeeSchema } from '../../schemas';
import { createEmployee } from '../../model/update';
import { validateEmployee } from '../../model/validate';

// 従業員作成API
const app = new Hono<{ Bindings: Bindings }>();

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

export default app; 