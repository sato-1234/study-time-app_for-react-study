type TaskType = {
  check: boolean;
  content: string;
};

export const taskOne: TaskType[] = [
  { check: true, content: "Viteを利用してReact環境を用意する" },
  { check: true, content: "タイトル「学習記録一覧」を表示させる" },
  { check: true, content: "テストデータ（records）を一覧で表示する" },
  { check: true, content: "学習内容の入力フォームを設置する" },
  {
    check: true,
    content: "学習時間の入力フォームを設置する(入力を数字にする)",
  },
  { check: true, content: "学習内容の入力した値を確認用で表示する" },
  { check: true, content: "学習時間の入力した値を確認用で表示する" },
  { check: true, content: "登録ボタンを設定する" },
  {
    check: true,
    content: "登録ボタンをクリックするとrecordsに記録を追加できる",
  },
  { check: true, content: "登録をしたらフォームが初期化される" },
  {
    check: true,
    content:
      "登録ボタンをクリックしたときに項目の入力内容が不適切ならエラー表示させる",
  },
  {
    check: true,
    content: "正しく入力されている場合登録ボタンを押すとエラー表示が消える",
  },
  { check: true, content: "記録した勉強の時間を合計した値を表示する" },
];

export const taskTwo: TaskType[] = [
  { check: true, content: "Supabaseのプロジェクトを作成する" },
  {
    check: true,
    content: "Table Editorテーブルを作成する(Qiita記載のカラムで)",
  },
  {
    check: true,
    content: "Supabase上で作成テーブルにテストデータを3つINSERTする",
  },
  {
    check: true,
    content: "INSERTしたデータを学習記録一覧（画面）でみることができる",
  },
  {
    check: true,
    content: "データ読み込みのタイミングはLoading...が表示される",
  },
  {
    check: true,
    content: "登録ボタンを押したらsupabaseのテーブルに入力データが追加される",
  },
  {
    check: true,
    content: "削除ボタンを押したらSupabaseのテーブルからTODOが削除される",
  },
  {
    check: true,
    content: "Firebaseに登録しプロジェクトを作成する",
  },
  {
    check: true,
    content: "Firebaseにデプロイする",
  },
  {
    check: true,
    content: "FirebaseにGitHub Actionsを設定する",
  },
  {
    check: true,
    content: "vitestとreact-testing-libraryを導入する",
  },
  {
    check: true,
    content:
      "「タイトル「学習記録一覧」が表示されていること」「フォームに内容と時間を入力して登録すると、リストに項目が追加される」「削除ボタンを押すと学習記録が削除される」「入力しないで登録を押すとエラーが表示される」の自動テストを作成する",
  },
  {
    check: true,
    content: "パイプラインにCIを追加する",
  },
  {
    check: true,
    content:
      "React+TypeScriptの開発環境をViteで用意し、Fireabseにデプロイし、vitestとreact-testing-libraryを導入しテストファイル作成、Github Actions(Push)でCI/CDする。※.envファイルはGITHUBにpushせずに、Secrets機能を使用すること",
  },
];

export const taskThree: TaskType[] = [
  {
    check: false,
    content: "ChakuraUIを導入する",
  },
  {
    check: true,
    content:
      "Supabaseの初期設定をする（認証機能を使用するための設定と、userテーブルとstudy_recordテーブルを外部キー（id）で紐づける）",
  },
  {
    check: true,
    content:
      "ユーザー登録処理→ログイン機能→ログアウト機能を実装し、ユーザーはログイン後のマイページをみることができる。useContect(ステート)でログイン情報",
  },
  {
    check: true,
    content:
      "学習記録はクラスを利用して実装し、ログイン後に登録、削除処理が可能なこと",
  },
  {
    check: true,
    content:
      "学習記録データ取得のときにローディング画面（Loading...が表示されていること）をみることができる",
  },
  {
    check: true,
    content: "react-hook-formを導入し、Form関連に使用すること",
  },
  {
    check: true,
    content:
      "各バリエーションエラーメッセージ「内容の入力は必須です」「時間の入力は必須です」「時間は1以上である必要があります」を表示すること",
  },
  {
    check: true,
    content: "モーダルをコンポーネント化すること",
  },
  {
    check: true,
    content:
      "編集ボタンがそれぞれの記録ごとに表示され、編集ボタンを押すとモーダルが表示される",
  },
  {
    check: true,
    content:
      "編集モーダルにはフォームがあり、編集ボタンを押した記録の学習内容と学習時間が表示されている。またタイトルは記録編集であること(新規登録ではない)",
  },
  {
    check: true,
    content:
      "内容と時間を編集して更新をデータが更新され、モーダルが閉じて、一覧の該当する記録が更新される。",
  },
  {
    check: true,
    content:
      "保存を押すとフォームがクリアされる（更新後、新規登録ボタン押下した際にフォームがクリアされていること）",
  },
  {
    check: true,
    content: "閉じるを押すとモーダルが閉じる",
  },
  {
    check: true,
    content:
      "自動テストを実装する「新規登録ボタンがあること」「新規登録の場合はモーダルが新規登録のタイトルであること」「ローディング画面をみることができる」「リスト一覧（テーブル）をみることができる」「学習記録が登録できること」「学習記録が削除できること」「学習内容を空で登録するとエラーがでる」「学習時間を1以上でないときにエラーがでる」「編集の場合はモーダルのタイトルが記録編集であること」「編集して登録すると更新される」※supabaseと通信があるところはモックをいれてテスト",
  },
];
