import Link from 'next/link';

export const runtime = "edge";

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-light mb-6">管理者ページ</h1>
      
      <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">本日の出勤状況</h2>
        <p className="text-gray-500">勤怠データを表示します</p>
      </div>
      
      <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">勤怠レポート</h2>
        <p className="text-gray-500">月次レポートを表示します</p>
      </div>
      
      <Link href="/" className="mt-4 text-primary-secondary hover:underline">
        勤怠記録画面へ戻る
      </Link>
    </div>
  );
} 