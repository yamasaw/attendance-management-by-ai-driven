import { Hono } from 'hono';
import { Bindings } from '@routes/bindings';
import { dbMiddleware } from '@/middleware';

import getEmployeeListApp from './get_employee_list';
import getEmployeeApp from './get_employee';
import postEmployeeApp from './post_employee';
import putEmployeeApp from './put_employee';
import deleteEmployeeApp from './delete_employee';

// 従業員API全体のエントリーポイント
const app = new Hono<{ Bindings: Bindings }>();

// DB接続ミドルウェアを適用
app.use('*', dbMiddleware());

// 各APIをマウント
app.route('/', getEmployeeListApp);      // 一覧取得
app.route('/:id', getEmployeeApp);       // 詳細取得
app.route('/', postEmployeeApp);         // 新規作成
app.route('/:id', putEmployeeApp);       // 更新
app.route('/:id', deleteEmployeeApp);    // 削除

export default app; 