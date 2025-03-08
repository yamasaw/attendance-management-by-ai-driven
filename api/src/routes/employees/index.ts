import { Hono } from 'hono';
import { Bindings } from '../../routes/bindings';
import { dbMiddleware } from '../../middleware';

import getListApp from './get_list';
import getDetailApp from './get_detail';
import createApp from './create';
import updateApp from './update';
import deleteApp from './delete';

// 従業員API全体のエントリーポイント
const app = new Hono<{ Bindings: Bindings }>();

// DB接続ミドルウェアを適用
app.use('*', dbMiddleware());

// 各APIをマウント
app.route('/', getListApp);             // 一覧取得
app.route('/:id', getDetailApp);        // 詳細取得
app.route('/', createApp);              // 新規作成
app.route('/:id', updateApp);           // 更新
app.route('/:id', deleteApp);           // 削除

export default app; 