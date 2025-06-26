import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import styled from "styled-components";
import { Pencil, Trash2 } from "lucide-react";

import {
  getStudy,
  createStudy,
  deleteStudy,
} from "../modules/study/study.repository";
import { Study } from "../domain/study";
import { useAuth } from "../providers/AuthProvider";
import Modal from "../components/organisms/Modal";

const HomeMain = styled.main`
  width: 600px;
  padding: 0 10px;
  margin: 0 auto;
  box-sizing: border-box;
  > h2 {
    text-align: center;
    padding: 20px 0;
  }
  > div.button {
    text-align: right;
    > button {
      padding: 10px;
      border-radius: 5px;
      border: none;
      background-color: #006eff;
      color: #fff;
    }
  }
  > .loaderDiv {
    width: 166px;
    margin: 0 auto;
    position: relative;
    > .loaderText {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #25b09b;
      font-weight: bold;
    }
  }
  > .noList {
    text-align: center;
  }
  > table {
    width: 100%;
    padding: 40px 0;
    tr > th,
    tr > td {
      box-sizing: border-box;
      padding: 5px;
      line-height: 1.5;
      border-bottom: 1px solid var(--border-color2);
    }
    > thead > tr > th:nth-of-type(1),
    > tbody > tr > td:nth-of-type(1),
    > tfoot > tr > th {
      width: 400px;
    }
    > thead > tr > th:nth-of-type(2),
    > tbody > tr > td:nth-of-type(2) {
      min-width: 80px;
    }
    > thead > tr > th:nth-of-type(3) {
      min-width: 100px;
    }
    > tfoot > tr > td {
      min-width: 180px;
    }
    > tbody > tr > td:nth-of-type(3),
    > tbody > tr > td:nth-of-type(4) {
      min-width: 50px;
    }
    > tbody > tr > td:nth-of-type(2),
    > tbody > tr > td:nth-of-type(3),
    > tbody > tr > td:nth-of-type(4),
    > tfoot > tr > td {
      text-align: center;
    }
    > tfoot > tr > th,
    > tfoot > tr > td {
      border-bottom: none;
    }
    > thead > tr > th[scope="col"],
    > tfoot > tr > th[scope="row"] {
      color: var(--text-color2);
    }
    .lucide {
      width: 16px;
      cursor: pointer;
    }
  }
  @media screen and (max-width: 600px) {
    width: 100%;
    > table {
      padding: 40px 10px;
      > thead > tr > th:nth-of-type(1),
      > tbody > tr > td:nth-of-type(1),
      > tfoot > tr > th {
        max-width: calc(100% - 160px);
      }
      > thead > tr > th:nth-of-type(3) {
        min-width: 80px;
      }
      > tfoot > tr > td {
        min-width: 160px;
      }
      > tbody > tr > td:nth-of-type(3),
      > tbody > tr > td:nth-of-type(4) {
        min-width: 40px;
      }
    }
  }
`;

type FormData = {
  title: string;
  time: number;
};

function Home() {
  console.log("Home");

  const [list, setList] = useState<Study[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getStudy();
        if (res != null) {
          setList(res); // 配列
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

  const handleClose = useCallback(() => setToastOpen(false), []);

  const handleSubmitForm = useCallback(
    async (data: FormData) => {
      const res = await createStudy(data.title, data.time);
      const newList = [...list, res];
      setList(newList);
      setTotal((prev) => prev + res.time);
      setToastOpen(false);
    },
    [list]
  );

  // ログインしていない場合、ログインページにリダイレクト
  if (!user) return <Navigate replace to="/signin" />;

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault(); // フォームのデフォルト送信を防止
  //   if (!title.trim()) {
  //     setError("学習内容は必須項目になります");
  //     return;
  //   }
  //   if (!studyTime) {
  //     setError("学習時間は1以上の値で入力してください");
  //     return;
  //   }

  //   const createData = async () => {
  //     try {
  //       const res = await createStudy(title, studyTime);
  //       const newList = [...list, res];
  //       setList(newList);
  //       setTotal(total + res.time);
  //       setTitle("");
  //       setStudyTime(0);
  //       setError("");
  //       setToastOpen(false);
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   createData();
  // };

  const deleteList = async (id: string) => {
    const result = confirm("本当に削除しますか？");
    if (result) {
      try {
        const res = await deleteStudy(id);
        const newList = list.filter((v) => v.id !== res.id); //一致しないIDすべて
        setList(newList);
        setTotal(total + res.time);
      } catch (err) {
        console.error(err);
        alert("削除に失敗しました。");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <HomeMain>
        <h2>学習記録一覧</h2>
        {toastOpen && (
          <Modal onClose={handleClose} onSubmitForm={handleSubmitForm} />
        )}
        <div className="button">
          <button onClick={() => setToastOpen(true)}>新規登録</button>
        </div>
        {loading ? (
          <div className="loaderDiv">
            <div className="loaderText">Loading...</div>
            <div className="loader"></div>
          </div>
        ) : list.length >= 1 ? (
          <table data-testid="study-list">
            <thead>
              <tr>
                <th scope="col">学習内容</th>
                <th scope="col">学習時間</th>
                <th colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((study) => (
                <tr key={study.id} data-id={study.id}>
                  <td>{study.title}</td>
                  <td>{study.time}h</td>
                  <td>
                    <Pencil className="pencil" />
                  </td>
                  <td>
                    <Trash2
                      className="trash"
                      onClick={() => deleteList(study.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">合計勉強時間</th>
                <td colSpan={3}>{total}/1000（h）</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="noList">まだ学習記録を登録していません。</div>
        )}
      </HomeMain>
    </>
  );
}

export default Home;
