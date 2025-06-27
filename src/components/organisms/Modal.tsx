import { memo } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import { Study } from "../../domain/study";

const ToastDiv = styled.div`
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  > form {
    width: 400px;
    padding: 20px;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;
    background-color: #fff;
    font-weight: bold;
    > p:first-of-type {
      font-weight: bold;
      font-size: 20px;
      padding-bottom: 20px;
    }
    > label {
      display: block;
      width: 100%;
      padding-bottom: 20px;
      > input {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 5px;
      }
      > .error {
        font-weight: normal;
        color: red;
      }
    }
    > div.button {
      display: flex;
      > button,
      > span {
        width: 60px;
        padding: 5px;
        text-align: center;
        font-size: 16px;
        border-radius: 5px;
        border: none;
        background-color: #006eff;
        color: #fff;
      }
      > button {
        margin-right: auto;
        background-color: #006eff;
      }
      > span {
        margin-left: auto;
        cursor: pointer;
        background-color: #aaa;
      }
    }
  }
  @media screen and (max-width: 500px) {
    > form {
      width: 300px;
    }
  }
`;

type FormData = {
  title: string;
  time: number;
};

type Props = {
  type: string;
  editTarget: Study | null;
  onClose: () => void;
  onSubmitForm: (data: FormData) => void;
};

/* 新規登録ボタン押下後のレンダリング詳細
  Home　→　新規登録でuse値が変化。親レンダリング
  Modal.tsx:86 Modal　→　読み出しで初回子レンダリング
  Modal.tsx:86 Modal　→　親が再レンダリングされると子も再レンダリングされる
*/
const Modal = memo(({ type, editTarget, onClose, onSubmitForm }: Props) => {
  console.log("Modal");

  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    defaultValues: {
      title: type === "edit" && editTarget ? editTarget.title : "",
      time: type === "edit" && editTarget ? editTarget.time : 0,
    },
  });

  const onSubmit = (data: FormData) => {
    onSubmitForm(data);
    reset(); // フォームリセット（オプション）
  };

  return (
    <ToastDiv className="toast">
      <form onSubmit={handleSubmit(onSubmit)} data-testid="registration-form">
        <p data-testid="model-title">
          {type === "add" ? "新規登録" : "記録編集"}
        </p>
        <label>
          <p>学習内容</p>
          <input
            defaultValue={type === "edit" && editTarget ? editTarget.title : ""}
            {...register("title", {
              required: "学習内容の入力は必須です",
            })}
            placeholder="学習した内容を入力してください"
          />
          {formState.errors.title && (
            <p className="error" data-testid="error-title-message">
              {formState.errors.title.message}
            </p>
          )}
        </label>
        <label>
          <p>学習時間</p>
          <input
            type="number"
            {...register("time", {
              required: "学習時間の入力は必須です",
              min: {
                value: 1,
                message: "学習時間は1以上である必要があります",
              },
            })}
            placeholder="学習した時間を入力してください"
          />
          {formState.errors.time && (
            <p className="error" data-testid="error-time-message">
              {formState.errors.time.message}
            </p>
          )}
        </label>
        <div className="button">
          <button data-testid="send-button">
            {type === "add" ? "登録" : "更新"}
          </button>
          <span onClick={onClose} data-testid="back-button">
            閉じる
          </span>
        </div>
      </form>
    </ToastDiv>
  );
});

export default Modal;
