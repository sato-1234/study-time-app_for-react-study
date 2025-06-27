# 学習記録一覧アプリ（React アウトプット学習用）

**Qiita 記事**
https://qiita.com/Sicut_study/items/7d8c6f309dddda1a3961

の課題内容にそって、アウトプットしました。

## 2025/06/14：課題１ 完了

node インストール後、vite で環境構築（React、TypeScript を選択）

```
node -v
npm -v
npm create vite@latest
npm run dev
```

## 2025/06/20 ：課題２ 完了

Supabase 上でテーブル名「study_record」作成
(ポリシーは一旦全ユーザー許可：RLS を無効)

| column_name | data_type     | other        |
| ----------- | ------------- | ------------ |
| id          | UUID          | Primary Key, |
| title       | text          |              |
| time        | integer(4 桁) |              |

「study_record」にテストデータを INSERT

```
INSERT INTO study_record (id, title, time) VALUES
 (gen_random_uuid(),'test1', 1),
 (gen_random_uuid(),'test2', 2),
 (gen_random_uuid(),'test3', 3);
```

Supabase からテーブル型を取得して database.types.ts を作成

```
npm i @supabase/supabase-js
npx supabase login
npx supabase gen types --lang=typescript --project-id "project-idを入力" --schema public > database.types.ts
```

.env ファイル（環境変数）作成したら、一度再起動

```
VITE_SUPABASE_URL="XXXX"
VITE_SUPABASE_API_KEY="XXXX"
```

firebase に登録しプロジェクト作成後、デプロイ。GITHUB ACTION の設定。

```
npm install firebase
npm install -g firebase-tools
firebase projects:list
firebase login
firebase init hosting
npm run build
firebase deploy
firebase init hosting:github
```

テスト用パッケージインストール

```
npm i -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event jsdom
npm i -D @vitest/ui //任意
```

## 2025/06/27 ：課題 3 完了

実装に必要なパッケージインストール

```
npm i react-router-dom
npm i styled-components
npm i react-hook-form
npm i lucide-react
```

Supabase 上のテーブル名「study_record」にテストデータを Delete
（テストデータかつ削除してよい場合。削除許可がない場合は気軽に以下の SQL を使用しないように）

```
DELETE FROM study_record;
```

「study_record」に外部キーや RLS を有効にしてポリシーの設定をする
(すべて「not null」。Foreign key は「user_id → auth.users.id」)

| column_name | data_type                | other                   |
| ----------- | ------------------------ | ----------------------- |
| id          | UUID                     | Primary Key             |
| user_id     | UUID                     | Primary Key,Foreign key |
| title       | text                     |                         |
| time        | integer(4 桁)            |                         |
| create_id   | timestamp with time zone | Asia/Tokyo              |

テーブル型を再取得して database.types.ts を作成

```
npx supabase login
npx supabase gen types --lang=typescript --project-id "project-idを入力" --schema public > database.types.ts
```

## 使用技術

| カテゴリ       | 技術                            |
| -------------- | ------------------------------- |
| フロントエンド | React 19.1.0 / TypeScript 5.8.3 |
| データベース   | Supabase                        |
| 環境構築       | vite                            |
| CI/CD          | Github Actions                  |
| インフラ       | Fireabse                        |
