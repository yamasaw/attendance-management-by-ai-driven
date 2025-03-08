# 勤怠管理システム デプロイワークフロー

## 1. 開発環境セットアップ

### 1.1 依存関係のインストール
```bash
cd api
npm install
```

### 1.2 開発用D1データベースの作成
```bash
wrangler d1 create attendance_db_dev
```

出力された設定を`wrangler.toml`の開発環境設定に追加:
```toml
[[d1_databases]]
binding = "DB"
database_name = "attendance_db_dev"
database_id = "<DEV_DB_ID>"
migrations_dir = "src/db/migrations"
```

### 1.3 開発環境でのマイグレーション実行
```bash
wrangler d1 migrations apply attendance_db_dev --local
```

### 1.4 開発サーバーの起動
```bash
npm run dev
# または
wrangler dev src/index.ts --local
```

## 2. 本番環境デプロイ手順

### 2.1 本番用D1データベースの作成
```bash
wrangler d1 create attendance_db_prod
```

### 2.2 wrangler.tomlの本番環境設定
```toml
[env.production]
vars = { ENVIRONMENT = "production" }
[[env.production.d1_databases]]
binding = "DB"
database_name = "attendance_db_prod"
database_id = "<PROD_DB_ID>"
```

### 2.3 本番環境へのマイグレーション適用
```bash
wrangler d1 execute attendance_db_prod --file ./src/db/migrations/00001_initial_schema.sql --env production --remote
```

### 2.4 本番環境へのデプロイ
```bash
wrangler deploy src/index.ts --env production
```

## 3. トラブルシューティング

### 3.1 マイグレーションエラー
- エラー: "No migrations folder found"
  - 解決策: `migrations_dir`の設定を確認
  - 正しいパス: `src/db/migrations`

### 3.2 デプロイエラー
- エラー: "node_compat is deprecated"
  - 解決策: `wrangler.toml`の設定を更新
  ```toml
  compatibility_flags = ["nodejs_compat"]
  ```

### 3.3 TypeScriptエラー
- エラー: "Cannot find module"
  - 解決策: `tsconfig.json`の`paths`設定を確認
  - 必要なパッケージのインストール確認

## 4. 動作確認

### 4.1 ヘルスチェック
```bash
curl https://<WORKER_SUBDOMAIN>.workers.dev/
```

### 4.2 従業員API
```bash
# 一覧取得
curl https://<WORKER_SUBDOMAIN>.workers.dev/api/employees

# 詳細取得
curl https://<WORKER_SUBDOMAIN>.workers.dev/api/employees/1
```

### 4.3 勤怠記録API
```bash
# 一覧取得
curl https://<WORKER_SUBDOMAIN>.workers.dev/api/attendances

# 従業員ごとの記録
curl https://<WORKER_SUBDOMAIN>.workers.dev/api/attendances/employee/1
```

## 5. 注意事項

### 5.1 環境変数
- 機密情報は必ず`wrangler secret`で設定
- 開発環境と本番環境で異なる値を使用する場合は環境ごとに設定

### 5.2 データベース操作
- 本番環境のデータベース操作は必ず`--remote`フラグを使用
- マイグレーションは慎重に実行（ロールバック手段の確保）

### 5.3 パフォーマンス
- Workersの実行時間制限（CPU時間10ms）に注意
- D1クエリの最適化を確認
- 大きなレスポンスはページネーション必須 