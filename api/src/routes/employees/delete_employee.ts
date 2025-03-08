import { Hono } from 'hono';
import { Bindings } from '@routes/bindings';
import { getEmployeeById } from '@model/employee';
import { deactivateEmployee, deleteEmployee } from '@model/employee';

// 従業員削除API
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
    
    // 従業員の勤怠記録があるかどうかで論理削除か物理削除かを判断
    // 勤怠記録があれば論理削除、なければ物理削除
    const employeeData = await getEmployeeById(id);
    
    if (!employeeData) {
      return c.json({
        status: 'error',
        message: '従業員が見つかりません'
      }, 404);
    }
    
    // TODO: 勤怠記録のチェックロジックはモデルに移動する
    const attendanceCount = await c.env.DB.prepare('SELECT COUNT(*) as count FROM attendances WHERE employee_id = ?').bind(id).first<{ count: number }>();
    
    let result: boolean;
    
    if (attendanceCount && attendanceCount.count > 0) {
      // 勤怠記録がある場合は論理削除
      result = await deactivateEmployee(id);
      
      if (result) {
        return c.json({
          status: 'success',
          message: '従業員を非アクティブ化しました（勤怠記録があるため）'
        });
      }
    } else {
      // 勤怠記録がない場合は物理削除
      result = await deleteEmployee(id);
      
      if (result) {
        return c.json({
          status: 'success',
          message: '従業員を完全に削除しました'
        });
      }
    }
    
    // 削除失敗
    return c.json({
      status: 'error',
      message: '従業員の削除に失敗しました'
    }, 500);
  } catch (error) {
    console.error('従業員削除エラー:', error);
    return c.json({
      status: 'error',
      message: '従業員の削除に失敗しました'
    }, 500);
  }
});

export default app; 