# 勤怠管理システム - 技術スタック

## 1. フロントエンド
### フレームワーク
- Next.js 14.x
- React 18.x
- TypeScript 5.x

### UIライブラリ
- Tailwind CSS
- Headless UI
- React Hook Form

### カメラ機能
- MediaStream API (getUserMedia)
- canvas API (写真キャプチャ)
- WebRTC

### 状態管理
- React Query
- Zustand

## 2. バックエンド
### API
- Next.js API Routes
- REST API

### データベース
- PostgreSQL
- Prisma (ORM)

### ファイルストレージ
- ローカルファイルシステム（開発用）
- AWS S3 / Cloudinary（本番用、写真保存用）

### 認証
- 固定ターミナル認証（IPアドレスベース）
- 管理者画面用の基本認証

## 3. インフラストラクチャ
### ホスティング
- Vercel

### データベースホスティング
- Vercel Postgres

### モニタリング
- Vercel Analytics
- Sentry

## 4. 開発ツール
### バージョン管理
- Git
- GitHub

### テスト
- Jest
- React Testing Library
- Playwright (E2E)
- MSW（モックサーバー）

### コード品質
- ESLint
- Prettier
- husky
- lint-staged

### CI/CD
- GitHub Actions

## 5. セキュリティ
- HTTPS
- CSRF対策
- XSS対策
- Rate Limiting
- 画像データの安全な取り扱い
- 個人情報保護対策 