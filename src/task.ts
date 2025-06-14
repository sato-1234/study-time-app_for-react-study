type TasksType = {
  check: boolean;
  content: string;
};

export const tasks: TasksType[] = [
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
