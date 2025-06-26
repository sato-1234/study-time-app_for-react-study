import { memo } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

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
  onClose: () => void;
  onSubmitForm: (data: FormData) => void;
};

const Modal = memo(({ onClose, onSubmitForm }: Props) => {
  console.log("Modal");
  const { register, handleSubmit, formState, reset } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    onSubmitForm(data);
    reset(); // フォームリセット（オプション）
  };

  return (
    <ToastDiv className="toast">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>新規登録</p>
        <label>
          <p>学習内容</p>
          <input
            {...register("title", {
              required: "内容の入力は必須です",
            })}
            placeholder="学習した内容を入力してください"
          />
          {formState.errors.title && (
            <p className="error" data-testid="title-error-message">
              {formState.errors.title.message}
            </p>
          )}
        </label>
        <label>
          <p>学習時間</p>
          <input
            type="number"
            {...register("time", {
              required: "時間の入力は必須です",
              min: {
                value: 1,
                message: "数値は1以上である必要があります",
              },
            })}
            placeholder="学習した時間を入力してください"
          />
          {formState.errors.time && (
            <p className="error" data-testid="time-error-message">
              {formState.errors.time.message}
            </p>
          )}
        </label>
        <div className="button">
          <button>登録</button>
          <span onClick={onClose}>閉じる</span>
        </div>
      </form>
    </ToastDiv>
  );
});

export default Modal;
