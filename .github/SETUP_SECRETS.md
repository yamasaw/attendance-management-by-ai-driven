# GitHub Actions用のシークレット設定

GitHub Actionsでのデプロイを正常に動作させるには、以下のシークレットをリポジトリに設定する必要があります。

## 必要なシークレット

1. `CLOUDFLARE_API_TOKEN` - Cloudflareのデプロイ用APIトークン
2. `CLOUDFLARE_ACCOUNT_ID` - CloudflareのアカウントID

## シークレットの取得方法

### Cloudflare APIトークンの取得

1. Cloudflareダッシュボードにログイン
2. 右上のプロファイルアイコン > 「My Profile」をクリック
3. 左側のメニューから「API Tokens」を選択
4. 「Create Token」をクリック
5. 「Edit Cloudflare Workers」テンプレートを選択
   - または、カスタムトークンで以下の権限を設定:
     - Account > Cloudflare Pages: Edit
     - Account > Worker Scripts: Edit
     - Zone > Workers Routes: Edit
6. トークンを作成し、表示された値をコピー

### Cloudflare Account IDの取得

1. Cloudflareダッシュボードにログイン
2. 右側のサイドバーで「Workers & Pages」をクリック
3. URLの一部として表示されるアカウントIDをコピー
   - 例: `https://dash.cloudflare.com/<ACCOUNT_ID>/workers`

## GitHub Secretsへの設定方法

1. GitHubのリポジトリページに移動
2. 「Settings」タブをクリック
3. 左側のメニューから「Secrets and variables」>「Actions」を選択
4. 「New repository secret」をクリック
5. 名前と値を入力して保存:
   - `CLOUDFLARE_API_TOKEN`: コピーしたAPIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: コピーしたアカウントID

これらのシークレットを設定すると、GitHub Actionsのデプロイワークフローが正常に動作するようになります。 