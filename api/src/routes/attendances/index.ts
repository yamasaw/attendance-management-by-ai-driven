import { Hono } from 'hono';
import { Bindings } from '@routes/bindings';
import { dbMiddleware } from '@/middleware';

import getAttendanceListApp from './get_attendance_list';
import getAttendanceApp from './get_attendance';
import postAttendanceApp from './post_attendance';
import putAttendanceApp from './put_attendance';
import deleteAttendanceApp from './delete_attendance';

// 勤怠API全体のエントリーポイント
const app = new Hono<{ Bindings: Bindings }>();

// DB接続ミドルウェアを適用
app.use('*', dbMiddleware());

// 各APIをマウント
app.route('/', getAttendanceListApp);      // 一覧取得
app.route('/:id', getAttendanceApp);       // 詳細取得
app.route('/', postAttendanceApp);         // 新規作成
app.route('/:id', putAttendanceApp);       // 更新
app.route('/:id', deleteAttendanceApp);    // 削除

export default app; 