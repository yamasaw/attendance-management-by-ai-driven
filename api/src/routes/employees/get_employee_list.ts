import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cache } from 'hono/cache';
import { Bindings } from '@routes/bindings';
import { getEmployees } from '@model/employee';
import { employeeSearchParamsSchema } from '@/schemas';

// 従業員一覧取得API
const app = new Hono<{ Bindings: Bindings }>();

app.get('/', 
  zValidator('query', employeeSearchParamsSchema), 
  cache({ 
    cacheName: 'employees-cache', 
    cacheControl: 'max-age=60' 
  }),
  async (c) => {
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
  }
);

export default app; 