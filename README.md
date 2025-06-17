# 学習記録一覧アプリ（React アウトプット学習用）

**Qiita 記事**
https://qiita.com/Sicut_study/items/7d8c6f309dddda1a3961

の課題内容にそって、アウトプットしました。

2025/06/14：課題１ 完了

```nodeインストール後、viteで環境構築（React、TypeScriptを選択）
node -v
npm -v
npm create vite@latest
npm run dev
```

2025/06/15 以降：課題２ 実装中

```Supabase上で作成したテーブル「study_record」にテストデータをINSERT
INSERT INTO study_record (id, title, time) VALUES
 (gen_random_uuid(),'test1', 1),
 (gen_random_uuid(),'test2', 2),
 (gen_random_uuid(),'test3', 3);
```

```Supabaseで必要なパッケージをインストール
npm i @supabase/supabase-js
```

```Supabaseからテーブル型を取得してdatabase.types.tsを作成
npx supabase login
npx supabase init
npx supabase gen types --lang=typescript --project-id "project-idを入力" --schema public > database.types.ts
```

```.envファイル（環境変数）作成したら、一度再起動
VITE_SUPABASE_URL="XXXX"
VITE_SUPABASE_API_KEY="XXXX"
```

```firebase登録し、プロジェクト作成後、firebase SDKインストール、デプロイ
npm install firebase
npm install -g firebase-tools
firebase projects:list
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting:<プロジェクトID>
```

## 使用技術

| カテゴリ       | 技術                            |
| -------------- | ------------------------------- |
| フロントエンド | React 19.1.0 / TypeScript 5.8.3 |
| データベース   | Supabase                        |
| 環境構築       | vite                            |
| CI/CD          | Github Actions                  |
| インフラ       | Fireabse                        |
