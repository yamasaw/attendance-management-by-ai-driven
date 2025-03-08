import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">管理者ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 従業員管理カード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">従業員管理</h2>
            <p className="text-gray-600 mb-4">
              従業員の追加、編集、削除などの管理を行います。勤怠記録の確認もこちらから可能です。
            </p>
            <div className="flex gap-2">
              <Link 
                href="/admin/employees" 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              >
                従業員一覧
              </Link>
              <Link 
                href="/admin/employees/new" 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
        
        {/* 本日の出勤状況カード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">本日の出勤状況</h2>
            <p className="text-gray-600 mb-4">
              現在の出勤状況をリアルタイムで確認できます。出勤中、休憩中など状態別に表示されます。
            </p>
            <Link 
              href="/admin/attendance/today" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
            >
              出勤状況を確認
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 勤怠レポートカード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">勤怠レポート</h2>
            <p className="text-gray-600 mb-4">
              月次や週次の勤怠レポートを確認します。残業時間や休暇取得状況などが確認できます。
            </p>
            <Link 
              href="/admin/reports" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
            >
              レポートを見る
            </Link>
          </div>
        </div>
        
        {/* システム設定カード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">システム設定</h2>
            <p className="text-gray-600 mb-4">
              勤怠管理システムの各種設定を行います。勤務時間の設定や休日設定などが可能です。
            </p>
            <Link 
              href="/admin/settings" 
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block"
            >
              設定を変更
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-primary hover:underline">
          従業員用勤怠記録画面へ戻る
        </Link>
      </div>
    </div>
  );
} 