# テスト方針

## 概要

本プロジェクトでは、APIの品質と安定性を確保するために、以下のテスト戦略を採用しています。

- **単体テスト**: 個々のAPIエンドポイントの機能をテスト
- **統合テスト**: 複数のコンポーネントが連携して動作することを確認
- **エンドツーエンドテスト**: 実際のユーザーフローに沿った機能テスト

## テストディレクトリ構造

テストは各APIエンドポイントと対応するように、以下の構造に従って配置します：

```
src/
├── routes/
│   ├── feature-name/           # 機能ごとのディレクトリ
│   │   ├── method_resource.ts  # APIエンドポイント実装
│   │   └── tests/              # テストディレクトリ
│   │       └── method_resource.test.ts  # 対応するテストファイル
├── tests/                      # 共通テストユーティリティ
│   └── helpers.ts              # 共通ヘルパー関数
```

## テストの実行方法

テストは以下のコマンドで実行できます：

```bash
# すべてのテストを実行
npm test

# カバレッジレポートの生成
npm run test:coverage

# 特定のテストファイルを実行
npm test -- src/routes/feature-name/tests/specific_test.test.ts
```

## テストの書き方

### テストファイル命名規則

テストファイルは、テスト対象のファイル名に `.test.ts` を付加したものにします：

- `get_employee_list.ts` → `get_employee_list.test.ts`
- `post_employee.ts` → `post_employee.test.ts`

### 基本的なテスト構造

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import targetApp from '../target_module';
import { createTestEnv } from '../../../tests/helpers';
import * as moduleToMock from '../../../model/module';

// モックの設定
vi.mock('../../../model/module', () => ({
  functionToMock: vi.fn()
}));

describe('APIの説明', () => {
  beforeEach(() => {
    // 各テスト前の初期化処理
    vi.resetAllMocks();
  });

  it('正常系：期待される動作の説明', async () => {
    // モックの戻り値設定
    vi.spyOn(moduleToMock, 'functionToMock').mockResolvedValue(expectedValue);

    // テスト環境作成
    const env = createTestEnv();
    
    // リクエスト実行
    const res = await targetApp.request('/path', {
      method: 'METHOD',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }, env);
    
    // レスポンスの検証
    expect(res.status).toBe(expectedStatus);
    const data = await res.json();
    expect(data).toEqual(expectedResponseBody);
    
    // 関数呼び出しの検証
    expect(moduleToMock.functionToMock).toHaveBeenCalledWith(expectedArgs);
  });

  it('異常系：エラーケースの説明', async () => {
    // エラーケースのテスト実装
  });
});
```

### モック化の方針

- **外部依存関係**: 外部APIや他のサービスとの依存関係はモック化します
- **データベース操作**: データベース操作はモック化し、実際のデータベースに対するテストは最小限にします
- **環境変数**: 環境変数はテスト用の値でモック化します

### テストヘルパー関数

`src/tests/helpers.ts` に定義されているヘルパー関数：

- `createMockDb()`: モックデータベース接続を作成
- `createTestEnv()`: テスト環境を作成
- `createTestClient()`: Honoテストクライアントを作成

## テストケース設計

各APIエンドポイントについて、以下のようなテストケースを作成することを推奨します：

### 正常系テスト
- 基本的な成功パターン
- バリデーション通過パターン
- フィルターや検索条件の適用
- ページネーション動作確認

### 異常系テスト
- バリデーションエラーの検出
- 不正なパラメータのハンドリング
- 存在しないリソースへのアクセス
- 内部エラーの適切なハンドリング
- 認証・認可エラーのケース

## テストカバレッジ目標

- **ステートメントカバレッジ**: 85%以上
- **ブランチカバレッジ**: 80%以上
- **関数カバレッジ**: 90%以上

## CI/CD統合

テストはGitHub Actionsを通じて自動実行されます。PRがマージされる前に、すべてのテストが成功している必要があります。 