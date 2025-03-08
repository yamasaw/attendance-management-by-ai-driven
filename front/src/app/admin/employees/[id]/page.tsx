'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchEmployee, deleteEmployee, getAttendanceHistory, type Employee } from '@/lib/api';

type AttendanceRecord = {
  id: number;
  employee_id: number;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: string;
  photo_url?: string;
  created_at: string;
};

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const employeeId = parseInt(params.id, 10);
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'attendance'>('info');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  
  // 従業員データの取得
  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        const data = await fetchEmployee(employeeId);
        setEmployee(data);
        setError(null);
      } catch (err) {
        setError('従業員データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (!isNaN(employeeId)) {
      loadEmployee();
    } else {
      setError('無効な従業員IDです');
      setLoading(false);
    }
  }, [employeeId]);
  
  // 勤怠履歴の取得
  useEffect(() => {
    async function loadAttendanceHistory() {
      if (activeTab !== 'attendance' || !employeeId) return;
      
      try {
        setAttendanceLoading(true);
        const history = await getAttendanceHistory(employeeId);
        setAttendanceRecords(history);
        setAttendanceError(null);
      } catch (err) {
        setAttendanceError('勤怠履歴の取得に失敗しました');
        console.error(err);
      } finally {
        setAttendanceLoading(false);
      }
    }
    
    loadAttendanceHistory();
  }, [employeeId, activeTab]);
  
  // 従業員の削除処理
  const handleDelete = async () => {
    if (!employee) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteEmployee(employeeId);
      
      if (success) {
        router.push('/admin/employees');
        router.refresh();
      } else {
        setError('従業員の削除に失敗しました');
      }
    } catch (err) {
      setError('従業員の削除に失敗しました');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // タブの切り替え
  const handleTabChange = (tab: 'info' | 'attendance') => {
    setActiveTab(tab);
  };
  
  // 勤怠タイプに応じた表示文字列を返す
  const getAttendanceTypeText = (type: string) => {
    switch (type) {
      case 'clock_in': return '出勤';
      case 'clock_out': return '退勤';
      case 'break_start': return '休憩開始';
      case 'break_end': return '休憩終了';
      default: return type;
    }
  };
  
  // 勤怠タイプに応じたバッジの色を返す
  const getAttendanceTypeColor = (type: string) => {
    switch (type) {
      case 'clock_in': return 'bg-green-100 text-green-800';
      case 'clock_out': return 'bg-red-100 text-red-800';
      case 'break_start': return 'bg-yellow-100 text-yellow-800';
      case 'break_end': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="w-full text-center py-8">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link href="/admin/employees" className="text-blue-600 hover:underline">
          従業員一覧に戻る
        </Link>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="w-full">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          従業員が見つかりませんでした
        </div>
        <Link href="/admin/employees" className="text-blue-600 hover:underline">
          従業員一覧に戻る
        </Link>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">従業員詳細</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/employees"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            一覧へ戻る
          </Link>
          <Link
            href={`/admin/employees/${employeeId}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            編集
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* タブナビゲーション */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => handleTabChange('info')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              基本情報
            </button>
            <button
              onClick={() => handleTabChange('attendance')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              勤怠履歴
            </button>
          </nav>
        </div>
        
        {/* 基本情報タブ */}
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="mt-1">{employee.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">名前</p>
                  <p className="mt-1">{employee.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">メールアドレス</p>
                  <p className="mt-1">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">部署</p>
                  <p className="mt-1">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">役職</p>
                  <p className="mt-1">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">入社日</p>
                  <p className="mt-1">{new Date(employee.hire_date).toLocaleDateString('ja-JP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ステータス</p>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        employee.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.is_active ? '有効' : '無効'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">システム情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">作成日時</p>
                  <p className="mt-1">
                    {employee.created_at ? new Date(employee.created_at).toLocaleString('ja-JP') : '不明'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">最終更新</p>
                  <p className="mt-1">
                    {employee.updated_at ? new Date(employee.updated_at).toLocaleString('ja-JP') : '不明'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 勤怠履歴タブ */}
        {activeTab === 'attendance' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">勤怠履歴</h2>
            
            {attendanceError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {attendanceError}
              </div>
            )}
            
            {attendanceLoading ? (
              <div className="text-center py-8">
                <p>勤怠履歴を読み込み中...</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-500">勤怠記録がありません</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        種別
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        写真
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.timestamp).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getAttendanceTypeColor(record.type)}`}>
                            {getAttendanceTypeText(record.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.photo_url ? (
                            <a 
                              href={record.photo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              写真を表示
                            </a>
                          ) : (
                            <span className="text-gray-400">なし</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">従業員を削除しますか？</h3>
            <p className="mb-6 text-gray-600">
              この操作は取り消せません。{employee.name}さんを本当に削除しますか？
              <br />
              勤怠記録がある場合は物理削除ではなく論理削除（非アクティブ化）されます。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                disabled={isDeleting}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 