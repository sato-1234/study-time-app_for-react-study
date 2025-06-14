import { useLayoutEffect, useState } from "react";
import { tasks } from "./task";

type RecordType = {
  title: string;
  time: number;
};

const records: RecordType[] = [
  { title: "勉強の記録1", time: 1 },
  { title: "勉強の記録2", time: 3 },
  { title: "勉強の記録3", time: 5 },
];

const testStyle = {
  borderTop: "1px solid #2b2a2a",
  marginTop: "40px",
};

function App() {
  // console.log("App");

  const [list, setList] = useState(records);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useLayoutEffect(() => {
    setTotal(
      list.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.time;
      }, 0)
    );
  }, [list]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // フォームのデフォルト送信を防止
    if (title == "" || title == null || title == undefined) {
      setError("学習内容は必須項目になります");
      return;
    }
    if (time == 0 || time == null || time == undefined) {
      setError("学習時間は1以上の値で入力してください");
      return;
    }
    const newList = [...list, { title, time }];
    setList(newList);
    setTitle("");
    setTime(0);
    setError("");
  };

  return (
    <>
      <h1>学習時間入力アプリ（React勉強用）</h1>
      <h2>学習記録一覧</h2>
      <ul>
        {list.map((v, k) => (
          <li key={v.title + k}>
            {v.title}：{v.time}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <label>
          学習内容：
          <input
            type="text"
            placeholder="学習した内容を入力してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <br />
        <label>
          学習時間：
          <input
            type="number"
            placeholder="学習した時間を入力してください"
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value))}
          />
          時間
        </label>
        <br />
        <p>入力されている学習内容：{title}</p>
        <p>入力されている学習時間：{time}時間</p>
        <button>登録</button>
        {error !== "" ? <div style={{ color: "red" }}>{error}</div> : ""}
      </form>

      <p>合計勉強時間：{total}/1000（h）</p>

      <footer style={testStyle}>
        <p>このアプリで実装したこと（チェック項目）</p>
        <ul>
          {tasks.map((task) => (
            <li key={task.content}>
              <label>
                <input type="checkbox" checked={task.check} disabled />
                {task.content}
              </label>
            </li>
          ))}
        </ul>
      </footer>
    </>
  );
}

export default App;
