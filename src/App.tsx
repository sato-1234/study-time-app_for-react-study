import { useEffect, useLayoutEffect, useState } from "react";
import { taskOne } from "./task";
import {
  createStudy,
  deleteStudy,
  getStudy,
} from "../modules/study/study.repository";

type RecordType = {
  id: string;
  title: string;
  time: number;
};

// const records: RecordType[] = [
//   { id: "1", title: "勉強の記録1", time: 1 },
//   { id: "2", title: "勉強の記録2", time: 3 },
//   { id: "3", title: "勉強の記録3", time: 5 },
// ];

const testStyle = {
  borderTop: "1px solid #2b2a2a",
  marginTop: "40px",
};

function App() {
  console.log("App");

  const [list, setList] = useState<RecordType[]>([]);
  const [title, setTitle] = useState("");
  const [studyTime, setStudyTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  //console.log(list);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const datas = await getStudy();
        if (datas != null) {
          setList(datas);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (list.length >= 1) {
      const totalTime = list.reduce((acc, cur) => acc + cur.time, 0);
      setTotal(totalTime);
    }
  }, [list]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // フォームのデフォルト送信を防止
    if (!title.trim()) {
      setError("学習内容は必須項目になります");
      return;
    }
    if (!studyTime) {
      setError("学習時間は1以上の値で入力してください");
      return;
    }

    const createData = async () => {
      try {
        const data = await createStudy(title, studyTime);
        const newList = [
          ...list,
          { id: data.id, title: data.title, time: data.time },
        ];
        setList(newList);
        setTotal(total + data.time);
        setTitle("");
        setStudyTime(0);
        setError("");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    createData();
  };

  const deleteList = async (id: string) => {
    try {
      const data = await deleteStudy(id);
      const newList = list.filter((v) => v.id !== data.id); //一致しないIDすべて
      setList(newList);
      setTotal(total + data.time);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header>
        <h1>学習時間入力アプリ（React勉強用）</h1>
      </header>

      <main>
        <h2>学習記録一覧</h2>
        {loading ? (
          <div>Loading...</div>
        ) : list.length >= 1 ? (
          <ul>
            {list.map((v) => (
              <li key={v.id}>
                {v.title}：{v.time}
                <button onClick={() => deleteList(v.id)}>削除</button>
              </li>
            ))}
          </ul>
        ) : (
          ""
        )}

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
              value={studyTime}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setStudyTime(isNaN(value) ? 0 : value);
              }}
            />
            時間
          </label>
          <br />
          <p>入力されている学習内容：{title}</p>
          <p>入力されている学習時間：{studyTime}時間</p>
          <button>登録</button>
          {error !== "" ? <div style={{ color: "red" }}>{error}</div> : ""}
        </form>

        <p>合計勉強時間：{total}/1000（h）</p>
      </main>

      <footer style={testStyle}>
        <p>このアプリで実装したこと（チェック項目）</p>
        <ul>
          {taskOne.map((task) => (
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
