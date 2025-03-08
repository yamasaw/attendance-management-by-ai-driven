import Link from "next/link";
import { Clock } from "lucide-react";

export const runtime = "edge";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* 現在時刻表示 */}
      <div className="bg-acrylic rounded-xl p-6 mb-8 w-full max-w-3xl text-center">
        <div className="flex items-center justify-center gap-2 text-4xl mb-2">
          <Clock className="w-8 h-8 text-primary" />
          <CurrentTime />
        </div>
        <p className="text-xl text-gray-600">
          {new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 説明メッセージ */}
      <h2 className="text-2xl font-light text-center mb-8">
        氏名を選択して勤怠を記録してください
      </h2>

      {/* 従業員選択エリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {mockEmployees.map((employee) => (
          <Link
            href={`/attendance/${employee.id}`}
            key={employee.id}
            className="card flex items-center p-6 hover:border-primary hover:border"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4 flex-shrink-0">
              {employee.photoUrl ? (
                <img
                  src={employee.photoUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xl">
                  {employee.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.department}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 管理者ログインリンク */}
      <div className="mt-12">
        <Link
          href="/admin"
          className="text-primary-secondary hover:underline text-sm"
        >
          管理者ログイン
        </Link>
      </div>
    </div>
  );
}

// 現在時刻を表示するコンポーネント（クライアントサイドでレンダリング）
function CurrentTime() {
  // Edge Runtimeの環境ではクライアントコンポーネントを使用できないため
  // 初期値のみサーバーサイドで設定
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  
  return (
    <span>
      {hours}:{minutes}
    </span>
  );
}

// モックの従業員データ（APIから取得するように後で修正）
const mockEmployees = [
  {
    id: 1,
    name: "山田 太郎",
    department: "営業部",
    photoUrl: null,
  },
  {
    id: 2,
    name: "佐藤 花子",
    department: "経理部",
    photoUrl: null,
  },
  {
    id: 3,
    name: "鈴木 一郎",
    department: "開発部",
    photoUrl: null,
  },
  {
    id: 4,
    name: "田中 洋子",
    department: "人事部",
    photoUrl: null,
  },
  {
    id: 5,
    name: "伊藤 健太",
    department: "マーケティング部",
    photoUrl: null,
  },
  {
    id: 6,
    name: "高橋 真理子",
    department: "総務部",
    photoUrl: null,
  },
];