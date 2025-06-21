// import { expect, test } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
import { user } from "../vitest.setup";
import { getStudy, deleteStudy } from "./modules/study/study.repository";
import App from "./App";

// ------------------------------
// テストで使用する値
const inputStudyValue1: string = "test1"; //学習内容を入力
const inputStudyTime1: string = "1"; //学習時間を入力（型は文字列だが数値で入力）
const inputStudyValue2: string = "test2"; //学習内容を入力
const inputStudyTime2: string = "2"; //学習時間を入力（型は文字列だが数値で入力）
const addValue1 = `${inputStudyValue1}：${inputStudyTime1}`;
const addValue2 = `${inputStudyValue2}：${inputStudyTime2}`;
const waitTimeout: number = 1000;

// ------------------------------
// Supabaseのリストを初期化する共通関数（初期化用）
const resetList = async () => {
  const data = await getStudy();
  if (data.length >= 1) {
    // 1件ずつ await で削除
    for (const record of data) {
      // await Promise.all(data.map( async (record) => deleteStudy(record.id)));
      // Promise.allは並列実行なので順序が保証されないが高速（1つ失敗したらreject）
      await deleteStudy(record.id);
    }
  }
};

// リストを取得する共通関数
type TypeGetList = {
  lis: HTMLElement[];
  num: number;
};
const getList = (): TypeGetList => {
  const ul = screen.queryByTestId("study-list");
  if (!ul) {
    const zero = screen.getByText("まだ学習記録を登録していません。");
    expect(zero).toBeVisible();
    expect(zero).toHaveTextContent(/^まだ学習記録を登録していません。$/);
    return { lis: [], num: 0 };
  }

  const lis = within(ul).queryAllByRole("listitem");
  const num = lis.length;
  return { lis, num };
};

// リストの最終liと属性と値を取得する共通関数
type TypeGetLastList = {
  lastItem: HTMLElement | null;
  lastId: string | null;
  target: HTMLElement | null;
};
const getLastList = (lis: HTMLElement[], addValue: string): TypeGetLastList => {
  if (lis.length >= 1) {
    const lastItem = lis[lis.length - 1];
    const lastId = lastItem.getAttribute("data-id");
    // ユーザー目線で念のため.querySelector("span");ではなく.findByTextを使用
    const target = within(lastItem).getByText(addValue);
    return { lastItem, lastId, target };
  }
  return { lastItem: null, lastId: null, target: null };
};

// リストが追加または削除を待つ共通関数
// リスト数の変換有無も確認
const waitForListLengthChange = async (
  previousLength: number,
  type: string = "add"
) => {
  await waitFor(
    () => {
      const ul = screen.queryByTestId("study-list");
      // 削除のとき、1個→0個になる場合があるため、previousLength >= 2を追加
      if (
        (!ul && type === "add") ||
        (!ul && type === "minus" && previousLength >= 2)
      ) {
        throw new Error(
          "ulが存在しません。時間「timeout: XXXX」を増やしして再実行してください"
        );
      }

      const currentLength = ul
        ? within(ul).queryAllByRole("listitem").length
        : 0;

      if (currentLength == previousLength && type !== "same") {
        throw new Error(
          "リスト件数前後に変化がありません。時間「timeout: XXXX」を増やしして再実行してください"
        );
      } else if (currentLength != previousLength && type === "same") {
        throw new Error(
          "リスト件数前後に変化があります。エラー処理の際リストに影響がでております。コードを修正してください"
        );
      }
    },
    { timeout: waitTimeout }
  );
};

// Fromの子要素取得
const getFormChildren = () => {
  const inputElText =
    screen.getByPlaceholderText("学習した内容を入力してください");
  const inputElNumber =
    screen.getByPlaceholderText("学習した時間を入力してください");
  const buttonSignup = screen.getByRole("button", { name: "登録" });
  return { inputElText, inputElNumber, buttonSignup };
};

// リストを追加する共通関数
type TypeAddList = {
  inputElText: HTMLElement;
  inputElNumber: HTMLElement;
  buttonSignup: HTMLElement;
  inputStudyValue: string;
  inputStudyTime: string;
};
const addList = async ({
  inputElText,
  inputElNumber,
  buttonSignup,
  inputStudyValue,
  inputStudyTime,
}: TypeAddList) => {
  await user.type(inputElText, inputStudyValue);
  await user.type(inputElNumber, inputStudyTime);
  await user.click(buttonSignup);
};

describe("Appコンポーネントの動作確認", async () => {
  // DB初期化（テスト実行時の1回(最初)のみ。各テストごとではない）
  await resetList();

  // 各テストの共通の初期化（クリーン処理は「vitest.setup.ts」に記載済み）
  let debug: () => void; // デバック用
  beforeEach(async () => {
    const renderResult = render(<App />);
    debug = renderResult.debug;
  });

  describe("初期表示と初期値の確認", () => {
    test("h2のタイトル「学習記録一覧」が表示される", () => {
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeVisible(); //DOM上ではなく見える状態か
      //.toHaveTextContentはdisplay: noneのチェックはしないため上で.toBeVisible()で確認
      expect(heading).toHaveTextContent(/^学習記録一覧$/); //見た目＋テキスト確認
    });

    test("一覧が1件以上または0件が確認できるまで「Loading...」が表示されている", () => {
      const loading = screen.getByText("Loading...");
      expect(loading).toBeVisible();
      expect(loading).toHaveTextContent(/^Loading...$/);
    });

    test("inputの初期値確認", () => {
      const { inputElText, inputElNumber } = getFormChildren();
      // .toHaveValue()で完全一致を確認
      expect(inputElText).toHaveValue(""); //空か確認
      expect(inputElNumber).toHaveValue(0); //0か確認
    });
  });

  describe("リストの登録・削除・エラーチェック", () => {
    // テストデータ登録 → 待つ → 再リスト取得 → 値チェック → 現在リスト数表示
    const checkAddList = async (
      inputElText: HTMLElement,
      inputElNumber: HTMLElement,
      buttonSignup: HTMLElement,
      inputStudyValue: string,
      inputStudyTime: string,
      previousLength: number,
      addValue: string
    ) => {
      // テストデータを登録する
      await addList({
        inputElText,
        inputElNumber,
        buttonSignup,
        inputStudyValue,
        inputStudyTime,
      });
      // リストが増えるのを待つ
      await waitForListLengthChange(previousLength);

      // 再リスト取得(登録後はliが1個以上==NULLではない)
      const { lis, num } = getList();
      const { target } = getLastList(lis, addValue);

      // 入力した値で表示されていること(登録1個目)
      expect(target).toBeVisible();
      expect(target).toHaveTextContent(new RegExp(`^${addValue}$`));
      expect(inputElText).toHaveValue(""); //初期値にもどっていること
      expect(inputElNumber).toHaveValue(0); //初期値にもどっていること
      console.log("after（登録）：" + num + "個");

      return num;
    };

    // テストデータ削除 → 待つ → 再リスト取得 → 値チェック → 現在リスト数表示
    const checkMinusList = async (addValue: string) => {
      // リスト取得
      const { lis: beforelis, num: beforeNum } = getList();
      const { lastItem, lastId } = getLastList(beforelis, addValue);
      console.log(lastId); //削除するリストのID

      // 登録後なので必ず1件以上あるが、0件の場合も考慮
      if (lastItem != null) {
        const button = within(lastItem).getByRole("button", { name: "削除" });
        await user.click(button);
      } else {
        throw new Error("リストが1件ある状態で、削除を実行してください");
      }

      // リストがへるのを待つ
      await waitForListLengthChange(beforeNum, "minus");
      // リスト再取得
      const { lis: afterlis, num: afterNum } = getList();

      // 削除したIDが含まれていないこと(some関数に変更してもOK)
      if (afterlis.length >= 1) {
        const ids = afterlis.map((li) => li.getAttribute("data-id"));
        expect(ids).not.toContain(lastId);
      }
      // リスト数(after)
      console.log("after（削除後）" + afterNum + "個");
    };

    // リスト取得（before） → 登録クリック → エラーメッセージ → リスト取得(after) → 現在リスト数表示
    const errorMessageCheck = async (
      inputElText: HTMLElement,
      buttonSignup: HTMLElement,
      type: string = "blank",
      message: string
    ) => {
      // 再リスト取得（before）
      const { lis: beforelis, num: beforeNum } = getList();
      console.log("before(エラーメッセージ表示前)：" + beforeNum + "個");
      const { lastId: lastIdBefore } = getLastList(beforelis, addValue2);
      console.log(lastIdBefore); //比較するBeforeID

      if (type === "notBlank") {
        await user.type(inputElText, "任意値入力");
      }
      await user.click(buttonSignup);
      // リスト数チェック
      await waitForListLengthChange(beforeNum, "same");
      const error = screen.getByTestId("error-message");
      expect(error).toBeVisible();
      expect(error).toHaveTextContent(new RegExp(`^${message}$`));
      console.log(message);

      // 再リスト取得（after）
      const { lis: afterlis, num: afterNum } = getList();
      console.log("after(エラーメッセージ表示後)：" + afterNum + "個");
      const { lastId: lastIdAfter } = getLastList(afterlis, addValue2);
      console.log(lastIdAfter); //比較するBeforeID

      // IDが変わっていないことを確認
      expect(lastIdAfter).toBe(lastIdBefore);
    };

    beforeEach(async () => {
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
    });

    test("フォームに学習内容と時間を入力して登録ボタンを押すと新たに記録が追加されていること", async () => {
      const { inputElText, inputElNumber, buttonSignup } = getFormChildren();
      // 初回リスト取得
      const { num } = getList();
      console.log("before（登録）：" + num + "個");

      // 登録1回目
      const afterNum = await checkAddList(
        inputElText,
        inputElNumber,
        buttonSignup,
        inputStudyValue1,
        inputStudyTime1,
        num,
        addValue1
      );

      // 登録2回目（2個目登録できるか確認）
      const reAfterNum = await checkAddList(
        inputElText,
        inputElNumber,
        buttonSignup,
        inputStudyValue2,
        inputStudyTime2,
        afterNum,
        addValue2
      );
    });

    // 登録の処理でリストが2個になったので、その状態からスタート
    test("削除ボタンを押すと学習記録が削除される", async () => {
      // 1回目削除（2個→1個）
      await checkMinusList(addValue2);
      // 2回目削除（1個→0個）
      await checkMinusList(addValue1);
    });

    test("入力をしないで登録を押すとエラーが表示される", async () => {
      const { inputElText, inputElNumber, buttonSignup } = getFormChildren();
      // リストの前後変化も確認したいので、テストデータを2件登録する
      const addData = [
        { inputStudyValue: inputStudyValue1, inputStudyTime: inputStudyTime1 },
        { inputStudyValue: inputStudyValue2, inputStudyTime: inputStudyTime2 },
      ];
      // await Promise.all(addData.map(async (data) => {}はリストが並列競合するため使用しない
      for (const data of addData) {
        const { num } = getList();
        await addList({
          inputElText,
          inputElNumber,
          buttonSignup,
          inputStudyValue: data.inputStudyValue,
          inputStudyTime: data.inputStudyTime,
        });
        await waitForListLengthChange(num);
      }

      await errorMessageCheck(
        inputElText,
        buttonSignup,
        "blank",
        "学習内容は必須項目になります"
      );
    });

    test("学習時間を0以下にして登録押すとエラーが表示される", async () => {
      const { inputElText, buttonSignup } = getFormChildren();
      //上記2件登録済みなので、今回は事前登録処理はなし
      await errorMessageCheck(
        inputElText,
        buttonSignup,
        "notBlank",
        "学習時間は1以上の値で入力してください"
      );
    });
  });
});
