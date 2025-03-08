'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchEmployees, type Employee, type EmployeeSearchParams } from '@/lib/api';

type SortField = 'id' | 'name' | 'email' | 'department' | 'position' | 'hire_date' | 'is_active';
type SortOrder = 'asc' | 'desc';

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  
  // ソート状態
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // 検索フィルター
  const [filters, setFilters] = useState<EmployeeSearchParams>({
    name: searchParams.get('name') || '',
    department: searchParams.get('department') || '',
    is_active: searchParams.has('is_active') 
      ? searchParams.get('is_active') === 'true'
      : undefined,
    page: searchParams.has('page') ? parseInt(searchParams.get('page') || '1', 10) : 1,
  });

  // 従業員データの取得
  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const data = await fetchEmployees(filters);
        setEmployees(data.employees);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        setError('従業員データの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadEmployees();
  }, [filters]);

  // 検索処理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 }); // 検索時はページを1に戻す
  };

  // ページ変更処理
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  // フィルターの変更
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters({ ...filters, [name]: checked });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  // ソート処理
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 同じフィールドの場合は昇順/降順を切り替え
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 違うフィールドの場合は昇順でソート
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // クライアントサイドでソートを行う
  const sortedEmployees = [...employees].sort((a, b) => {
    // nullやundefinedを考慮
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    
    // 文字列比較の場合
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // 数値や真偽値の場合
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // ソートのアイコンを表示
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">従業員管理</h1>
        <Link 
          href="/admin/employees/new" 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          新規従業員登録
        </Link>
      </div>
      
      {/* 検索フィルター */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={filters.name || ''}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="名前で検索..."
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              部署
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={filters.department || ''}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="部署で検索..."
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <div className="flex items-center h-[38px]">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={filters.is_active === true}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <span>有効なユーザーのみ</span>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              検索
            </button>
          </div>
        </form>
      </div>
      
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* 従業員一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p>読み込み中...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center">
            <p>従業員が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    ID {renderSortIcon('id')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    名前 {renderSortIcon('name')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    メールアドレス {renderSortIcon('email')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('department')}
                  >
                    部署 {renderSortIcon('department')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('position')}
                  >
                    役職 {renderSortIcon('position')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('hire_date')}
                  >
                    入社日 {renderSortIcon('hire_date')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('is_active')}
                  >
                    ステータス {renderSortIcon('is_active')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.hire_date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.is_active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/employees/${employee.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          詳細
                        </Link>
                        <Link 
                          href={`/admin/employees/${employee.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* ページネーション */}
        {!loading && employees.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              全 <span className="font-medium">{pagination.total}</span> 件中 
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span> から 
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> 件を表示
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={`px-3 py-1 rounded border ${
                  pagination.page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                前へ
              </button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4));
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded border ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className={`px-3 py-1 rounded border ${
                  pagination.page >= pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 