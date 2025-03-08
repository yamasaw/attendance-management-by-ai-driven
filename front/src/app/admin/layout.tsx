import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: '管理画面 | 勤怠管理システム',
  description: '従業員と勤怠の管理を行います',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* サイドナビゲーション */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">管理画面</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="block p-2 rounded hover:bg-gray-100">
                ダッシュボード
              </Link>
            </li>
            <li>
              <Link href="/admin/employees" className="block p-2 rounded hover:bg-gray-100">
                従業員管理
              </Link>
            </li>
            <li>
              <Link href="/admin/reports" className="block p-2 rounded hover:bg-gray-100">
                勤怠レポート
              </Link>
            </li>
            <li className="pt-4 mt-4 border-t border-gray-200">
              <Link href="/" className="block p-2 rounded hover:bg-gray-100 text-primary">
                勤怠記録画面へ戻る
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
} 