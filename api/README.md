# 従業員勤怠管理システム API

このプロジェクトは、従業員勤怠管理システムのバックエンドAPIを提供します。HonoフレームワークとCloudflare Workersを使用しています。

## 技術スタック

- **フレームワーク**: [Hono](https://hono.dev/)
- **実行環境**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **データベース**: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **ORM/クエリビルダー**: [Kysely](https://github.com/koskimas/kysely)
- **テスト**: [Vitest](https://vitest.dev/)
- **バリデーション**: [Zod](https://github.com/colinhacks/zod)

## プロジェクト構造

```
api/
├── src/                  # ソースコード
│   ├── db/               # データベース関連
│   ├── model/            # ビジネスロジック
│   ├── routes/           # APIルート
│   │   ├── employees/    # 従業員関連API
│   │   │   ├── tests/    # 従業員API用テスト
│   │   │   ├── index.ts  # 従業員APIエントリーポイント
│   │   │   ├── get_employee.ts        # 従業員詳細取得API
│   │   │   ├── get_employee_list.ts   # 従業員一覧取得API
│   │   │   ├── post_employee.ts       # 従業員作成API
│   │   │   ├── put_employee.ts        # 従業員更新API
│   │   │   └── delete_employee.ts     # 従業員削除API
│   ├── schemas/          # スキーマ定義
│   ├── tests/            # テストコード
│   └── types/            # 型定義
├── wrangler.toml         # Cloudflare Workersの設定
└── tsconfig.json         # TypeScript設定
```

## API設計原則

- **RESTful設計**: リソース指向のURL設計とHTTPメソッドの適切な使用
- **1ファイル1API**: 各エンドポイントは個別のファイルで実装
- **明確なエラーハンドリング**: すべてのAPIは適切なステータスコードとエラーメッセージを返す
- **型安全**: TypeScriptと Zodを使用した型安全な実装

## 開発手順

### 環境準備

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### テスト実行

```bash
# すべてのテストを実行
npm test

# 特定のテストを実行
npm test -- src/routes/employees/tests/get_employee.test.ts

# カバレッジレポートの生成
npm run test:coverage
```

### デプロイ

```bash
# Cloudflare Workersにデプロイ
npm run deploy
```

## 新しいAPIの追加方法

1. `src/routes/` 配下に適切なディレクトリを作成（存在しない場合）
2. APIファイルを作成（例: `get_resource.ts`, `post_resource.ts`）
3. スキーマを `src/schemas/` に定義
4. モデル層のロジックを `src/model/` に実装
5. テストを作成

## トラブルシューティング

- **ローカル開発時のD1エミュレーション**: `wrangler.toml` に `local_persist = true` を設定
- **テスト失敗時**: モックの設定とテストケースの期待値を確認
- **型エラー**: スキーマ定義とモデル層の型が一致しているか確認

## コーディング規約

- **ファイル命名**: `[HTTPメソッド]_[リソース].ts` 形式 (例: `get_employee.ts`)
- **関数命名**: キャメルケース (例: `getEmployee`)
- **型命名**: パスカルケース (例: `EmployeeSchema`)
- **テストファイル**: 実装ファイルと同じ名前に `.test.ts` を付加

## エラーハンドリング

- 400: バリデーションエラー (クライアントリクエストの内容が不正)
- 404: リソースが存在しない
- 500: サーバー内部エラー

各APIは try-catch ブロックでエラーを捕捉し、適切なステータスコードとメッセージを返します。 