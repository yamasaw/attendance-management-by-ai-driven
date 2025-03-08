import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { cache } from 'hono/cache';
import { Bindings } from '@routes/bindings';
import { attendanceSearchParamsSchema } from '@/schemas';
import { getAttendances } from '@model/attendance/fetch';

// 勤怠一覧取得API
const app = new Hono<{ Bindings: Bindings }>();

app.get('/', 
  zValidator('query', attendanceSearchParamsSchema), 
  cache({ 
    cacheName: 'attendances-cache', 
    cacheControl: 'max-age=60' 
  }),
  async (c) => {
    try {
      const params = c.req.valid('query');
      
      const { attendances, total } = await getAttendances(params);
      
      return c.json({
        status: 'success',
        data: {
          attendances,
          pagination: {
            total,
            page: params.page,
            limit: params.limit,
            pages: Math.ceil(total / params.limit)
          }
        }
      });
    } catch (error) {
      console.error('勤怠一覧取得エラー:', error);
      return c.json({
        status: 'error',
        message: '勤怠一覧の取得に失敗しました'
      }, 500);
    }
  }
);

export default app; 