// import { expect, test } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
import { user } from "../../vitest.setup";
import { Study } from "../domain/study";
import { vi } from "vitest";
import { randomUUID } from "crypto";
import App from "../App";

// ------------------------------
// テストで追加と削除で使用する値
const inputStudyValue1: string = "追加された学習104"; //学習内容を入力
const inputStudyTime1: string = "4"; //学習時間を入力（型は文字列だが数値で入力）
const inputStudyValue2: string = "追加された学習105"; //学習内容を入力
const inputStudyTime2: string = "5"; //学習時間を入力（型は文字列だが数値で入力）
const waitTimeout: number = 1000; //追加と削除時にまつ最大秒数

// mock
const mockStudyStore = new Map<string, Study>();
const mockGetStudy = vi.fn().mockImplementation(() => {
  // ランダムID生成（テスト用）
  const datas = [
    new Study(randomUUID(), "test102", 2),
    new Study(randomUUID(), "test103", 3),
  ];
  for (const record of datas) {
    const newStudy = new Study(record.id, record.title, record.time);
    mockStudyStore.set(record.id, newStudy); // 削除時にid以外も取得するため使用
  }
  return Promise.resolve(datas);
});

const mockCreateStudy = vi
  .fn()
  .mockImplementation((title: string, time: number) => {
    // ランダムID生成（テスト用）
    const id = randomUUID(); // 36文字のUUID生成
    const newStudy = new Study(id, title, time);
    mockStudyStore.set(id, newStudy); // 削除時にid以外も取得するため使用
    return Promise.resolve(newStudy);
  });
const mockDeleteStudy = vi.fn().mockImplementation((id: string) => {
  const deleted = mockStudyStore.get(id);
  mockStudyStore.delete(id);
  return Promise.resolve(deleted ? deleted : null);
});

// モック対象の study.repository.ts をモック
vi.mock("../modules/study/study.repository", () => {
  return {
    getStudy: () => mockGetStudy(),
    createStudy: (title: string, time: number) => mockCreateStudy(title, time),
    deleteStudy: (id: string) => mockDeleteStudy(id),
  };
});

// ------------------------------
// Supabaseのテーブルを初期化する共通関数（初期化用）:モックにするためコメント
// const resetList = async () => {
//   const data = await getStudy();
//   if (data.length >= 1) {
//     // 1件ずつ await で削除
//     for (const record of data) {
//       // await Promise.all(data.map( async (record) => deleteStudy(record.id)));
//       // Promise.allは並列実行なので順序が保証されないが高速（1つ失敗したらreject）
//       await deleteStudy(record.id);
//     }
//   }
// };

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
};
const getLastList = (lis: HTMLElement[]): TypeGetLastList => {
  if (lis.length >= 1) {
    const lastItem = lis[lis.length - 1];
    const lastId = lastItem.getAttribute("data-id");
    return { lastItem, lastId };
  }
  return { lastItem: null, lastId: null };
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

describe("Appコンポーネントの動作確認", () => {
  // DB初期化
  // await resetList();

  // 各テストの共通の初期化（クリーン処理は「vitest.setup.ts」に記載済み）
  //let debug: () => void; // デバック用
  beforeEach(async () => {
    mockStudyStore.clear(); // 各テスト前にリセット
    render(<App />);
    //const renderResult = render(<App />);
    //debug = renderResult.debug;
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
      //debug(inputElText);
    });
  });

  describe("リストの登録・削除・エラーチェック", () => {
    // テストデータ登録 → 待つ → 再リスト取得 → 値チェック → 現在リスト数表示
    const checkAddList = async (
      inputStudyValue: string,
      inputStudyTime: string,
      previousLength: number
    ) => {
      const { inputElText, inputElNumber, buttonSignup } = getFormChildren();
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
      const { lastItem, lastId } = getLastList(lis);

      if (lastItem) {
        // ユーザー目線で念のため.querySelector("span");ではなく.findByTextを使用
        // テキストが表示されるまで待機
        const target = await within(lastItem).findByText(
          `${inputStudyValue}：${inputStudyTime}`
        );

        // 入力した値で表示されていること(登録1個目)
        expect(target).toBeVisible();
        expect(target).toHaveTextContent(
          new RegExp(`^${inputStudyValue}：${inputStudyTime}$`)
        );
        expect(inputElText).toHaveValue(""); //初期値にもどっていること
        expect(inputElNumber).toHaveValue(0); //初期値にもどっていること
        console.log(`after（登録後）:現リスト${num}個`);
        console.log(
          `登録内容 \n id：${lastId} \n title：${inputStudyValue} \n time：${inputStudyTime}`
        );
        return num;
      } else {
        throw new Error("登録後はリストは存在するはずですが、リストが0個です");
      }
    };

    // テストデータ削除（末のli削除） → 待つ → 再リスト取得 → 値チェック → 現在リスト数表示
    const checkMinusList = async () => {
      // リスト取得
      const { lis: beforelis, num: beforeNum } = getList();
      const { lastItem, lastId } = getLastList(beforelis);
      console.log(`before（削除前）:現リスト${beforeNum}個`);
      console.log(`削除予定ID：${lastId}`); //削除するリストのID

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
      console.log(`after（削除後）:現リスト${afterNum}個`);
      console.log(`削除ID：${lastId}`);
    };

    // リスト取得（before） → 登録クリック → エラーメッセージ → リスト取得(after) → 現在リスト数表示
    const errorMessageCheck = async (
      type: string = "blank",
      message: string
    ) => {
      const { inputElText, buttonSignup } = getFormChildren();
      // リスト取得（before）
      const { lis: beforelis, num: beforeNum } = getList();
      console.log(`before(エラーメッセージ表示前):現リスト${beforeNum}個`);
      const { lastId: lastIdBefore } = getLastList(beforelis);
      console.log(`比較するBeforeID：${lastIdBefore}`);

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
      console.log(`after(エラーメッセージ表示後):現リスト${afterNum}個`);
      const { lastId: lastIdAfter } = getLastList(afterlis);
      console.log(`比較するAfterID：${lastIdAfter}`);

      // IDが変わっていないことを確認
      expect(lastIdAfter).toBe(lastIdBefore);
    };

    beforeEach(async () => {
      await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
    });

    test("フォームに内容と時間を入力して登録すると、リストに項目が追加される", async () => {
      // 初回リスト取得
      const { num } = getList();

      console.log(`before（登録前）:現リスト${num}個`);

      // 登録1回目
      const afterNum = await checkAddList(
        inputStudyValue1,
        inputStudyTime1,
        num
      );
      expect(mockCreateStudy).toHaveBeenCalledTimes(1);

      // 登録2回目（2個目登録できるか確認）
      await checkAddList(inputStudyValue2, inputStudyTime2, afterNum);
      expect(mockCreateStudy).toHaveBeenCalledTimes(2);
    });

    // 登録の処理でリストが2個になったので、その状態からスタート
    test("削除ボタンを押すと学習記録が削除される", async () => {
      // 1回目削除（2個→1個）
      await checkMinusList();
      // 2回目削除（1個→0個）
      await checkMinusList();
    });

    test("入力をしないで登録を押すとエラーが表示される", async () => {
      await errorMessageCheck("blank", "学習内容は必須項目になります");
    });

    test("学習時間を0以下にして登録押すとエラーが表示される", async () => {
      await errorMessageCheck(
        "notBlank",
        "学習時間は1以上の値で入力してください"
      );
    });
  });
});
