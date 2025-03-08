'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchEmployee, updateEmployee, type Employee } from '@/lib/api';

export default function EditEmployeePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const employeeId = parseInt(params.id, 10);
  
  const [formData, setFormData] = useState<Employee>({
    name: '',
    email: '',
    department: '',
    position: '',
    hire_date: '',
    is_active: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 従業員データの取得
  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        const data = await fetchEmployee(employeeId);
        // ISO形式のdate文字列をHTML input[type=date]で使える形式(YYYY-MM-DD)に変換
        const hireDate = data.hire_date ? new Date(data.hire_date).toISOString().split('T')[0] : '';
        
        setFormData({
          ...data,
          hire_date: hireDate,
        });
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
  
  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await updateEmployee(employeeId, formData);
      
      setSuccess(true);
      // 3秒後に詳細ページに戻る
      setTimeout(() => {
        router.push(`/admin/employees/${employeeId}`);
        router.refresh();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || '従業員情報の更新に失敗しました');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // フォーム入力の変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  if (loading) {
    return (
      <div className="w-full text-center py-8">
        <p>読み込み中...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">従業員情報の編集</h1>
        <Link
          href={`/admin/employees/${employeeId}`}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          キャンセル
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          従業員情報を更新しました！詳細ページに戻ります...
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                部署 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                役職 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700 mb-1">
                入社日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="hire_date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div className="flex items-center h-full pt-6">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
                アクティブな従業員
              </label>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 