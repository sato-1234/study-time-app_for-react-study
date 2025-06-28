// import { expect, test } from "vitest";
// import userEvent from "@testing-library/user-event";
import {
  render,
  screen,
  waitFor,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { user } from "../../vitest.setup";
import { Study } from "../domain/study";
import { vi } from "vitest";
import { randomUUID } from "crypto";
import App from "../App";
import { fail } from "assert";

// ------------------------------
// useAuthをモックしてログイン済みにする。
vi.mock("../providers/AuthProvider", async (importOriginal) => {
  // importOriginalを使い、既存のエクスポート（AuthProviderなど）を維持しつつ、useAuthだけ上書き
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    useAuth: () => ({
      user: { id: "test-user", email: "test@test.com" },
    }),
  };
});

// ------------------------------
// 初回リストデータ
const inputStudyValue1: string = "初回学習101"; //学習内容を入力
const inputStudyTime1: number = 1; //学習時間を入力（型は文字列だが数値で入力）
const inputStudyValue2: string = "初回学習102"; //学習内容を入力
const inputStudyTime2: number = 2; //学習時間を入力（型は文字列だが数値で入力）
const firstList = [
  new Study(randomUUID(), inputStudyValue1, inputStudyTime1),
  new Study(randomUUID(), inputStudyValue2, inputStudyTime2),
];
const firstListLength = firstList.length;

// リストに追加する値
const inputStudyValue3: string = "追加された学習103";
const inputStudyTime3: number = 3;
const inputStudyValue4: string = "追加された学習104";
const inputStudyTime4: number = 4;
const waitTimeout: number = 1000; //追加と削除時にまつ最大秒数

// リストを更新する値
const updateStudyValue: string = "更新された学習105";
const updateStudyTime: number = 5;

// mock 初回リストの値をセットして取得できるようにする
const mockStudyStore = new Map<string, Study>();
const mockGetStudy = vi.fn().mockImplementation(() => {
  // ランダムID生成（テスト用）
  for (const record of firstList) {
    const newStudy = new Study(record.id, record.title, record.time);
    mockStudyStore.set(record.id, newStudy); // 削除時にid以外も取得するため使用
  }
  return Promise.resolve(firstList);
});

// mock リスト作成
const mockCreateStudy = vi
  .fn()
  .mockImplementation((title: string, time: number) => {
    // ランダムID生成（テスト用）
    const id = randomUUID(); // 36文字のUUID生成
    const newStudy = new Study(id, title, time);
    mockStudyStore.set(id, newStudy); // 削除時にid以外も取得するため使用
    return Promise.resolve(newStudy);
  });

// mock リスト編集
const mockEditStudy = vi
  .fn()
  .mockImplementation((id: string, title: string, time: number) => {
    const newStudy = new Study(id, title, time);
    mockStudyStore.set(id, newStudy); // 削除時にid以外も取得するため使用
    return Promise.resolve(newStudy);
  });

// mock リスト削除
const mockDeleteStudy = vi.fn().mockImplementation((id: string) => {
  const deleted = mockStudyStore.get(id);
  mockStudyStore.delete(id);
  return Promise.resolve(deleted ? deleted : null);
});

// mock必須設定 study.repository.ts をモック化する
vi.mock("../modules/study/study.repository", () => {
  return {
    getStudy: () => mockGetStudy(),
    createStudy: (title: string, time: number) => mockCreateStudy(title, time),
    editStudy: (id: string, title: string, time: number) =>
      mockEditStudy(id, title, time),
    deleteStudy: (id: string) => mockDeleteStudy(id),
  };
});

// ------------------------------
// Supabaseのテーブルを初期化する共通関数（モックにするためコメント）
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

// モーダルのFromの子要素取得する共通関数
type TypeGetFormChildren = {
  inputElText: HTMLElement;
  inputElNumber: HTMLElement;
  sendButton: HTMLElement | null;
  backButton: HTMLElement | null;
};
const getFormChildren = async (
  button: HTMLElement
): Promise<TypeGetFormChildren> => {
  await user.click(button);
  // ここでFormモーダルで表示を待つ
  await screen.findByTestId("registration-form");

  const inputElText =
    screen.getByPlaceholderText("学習した内容を入力してください");
  const inputElNumber =
    screen.getByPlaceholderText("学習した時間を入力してください");
  const sendButton = screen.queryByTestId("send-button");
  const backButton = screen.queryByTestId("back-button");
  return { inputElText, inputElNumber, sendButton, backButton };
};

// リストを取得する共通関数
type TypeGetList = {
  trs: HTMLElement[];
  num: number;
};
const getList = (): TypeGetList => {
  const tbody = screen.queryByTestId("study-list");
  if (!tbody) {
    return { trs: [], num: 0 };
  }

  // liの場合は.queryAllByRole("listitem");
  const trs = within(tbody).queryAllByRole("row");
  const num = trs.length;
  return { trs, num };
};

// リストを追加する共通関数（更新では使用できない）
// 更新用は1回使用しないため共通関数なし
type TypeAddList = {
  inputStudyValue: string;
  inputStudyTime: number;
  button: HTMLElement;
};
const addList = async ({
  inputStudyValue,
  inputStudyTime,
  button,
}: TypeAddList) => {
  const { inputElText, inputElNumber, sendButton } = await getFormChildren(
    button
  );
  await user.type(inputElText, inputStudyValue);
  await user.type(inputElNumber, String(inputStudyTime));
  if (sendButton) await user.click(sendButton);
};

// リストが追加または削除を待つ共通関数
// リスト数の変換有無も確認
const waitForListLengthChange = async (
  previousLength: number,
  type: string = "add"
) => {
  await waitFor(
    () => {
      const { num } = getList();
      // 削除のとき、1個→0個になる場合があるため、previousLength >= 2を追加
      if (
        (num == 0 && type === "add") ||
        (num == 0 && type === "minus" && previousLength >= 2)
      ) {
        fail(
          "tbodyが存在しません。時間「timeout: XXXX」を増やしして再実行してください"
        );
      }

      if (num == previousLength && type !== "same") {
        fail(
          "リスト件数前後に変化がありません。時間「timeout: XXXX」を増やして再実行してください"
        );
      } else if (num != previousLength && type === "same") {
        fail(
          "リスト件数前後に変化があります。バリエーションエラーの際にリストに影響がでております。コードを修正してください"
        );
      }
    },
    { timeout: waitTimeout }
  );
};

// リストの最終trと属性と値を取得する共通関数
type TypeGetLastList = {
  lastItem: HTMLElement | null;
  lastId: string | null;
};
const getLastList = (trs: HTMLElement[]): TypeGetLastList => {
  if (trs.length >= 1) {
    const lastItem = trs[trs.length - 1];
    const lastId = lastItem.getAttribute("data-id");
    if (lastId) {
      return { lastItem, lastId };
    } else {
      fail("key=idが取得できませんでした。");
    }
  } else {
    fail("trsが0個です。");
  }
};

describe("Appコンポーネントの動作確認", () => {
  // await resetList(); // DB初期化

  // 各テストの共通の初期化（クリーン処理は「vitest.setup.ts」に記載済み）
  // let debug: () => void; // デバック用
  beforeEach(() => {
    mockStudyStore.clear(); // 各テスト前にリセット
    // Homeのパスへ移動してレンダリングする。以下で指定パスでテスト可能
    // window.history.pushState({}, "", "/signu");
    render(<App />);
    // const renderResult = render(<App />);
    // debug = renderResult.debug;
  });

  describe("初期表示と初期値の確認", () => {
    test("h2のタイトル「学習記録一覧」があること", () => {
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeVisible(); //DOM上ではなく見える状態か
      //.toHaveTextContentは、display:noneのチェックはしないため.toBeVisible()で確認
      expect(heading).toHaveTextContent(/^学習記録一覧$/); //見た目＋テキスト確認
    });

    test("新規登録ボタンがあること", () => {
      const loading = screen.getByTestId("new-add-button");
      expect(loading).toBeVisible();
      expect(loading).toHaveTextContent(/^新規登録$/);
    });

    test("一覧が1件以上または0件が確定するまでローディング（Loading...）をみることができる", () => {
      const loading = screen.getByTestId("loader-text");
      expect(loading).toBeVisible();
      expect(loading).toHaveTextContent(/^Loading...$/);
    });

    test("新規登録の場合、モーダルのタイトルとinputの初期値確認", async () => {
      const button = screen.getByRole("button", { name: "新規登録" });
      const { inputElText, inputElNumber, backButton } = await getFormChildren(
        button
      );
      // .toHaveValue()で完全一致を確認
      expect(inputElText).toHaveValue(""); //初期値確認
      expect(inputElNumber).toHaveValue(0); //初期値確認

      // 新規登録のモーダルを開いた状態
      const modelTitle = screen.getByTestId("model-title");
      expect(modelTitle).toBeVisible();
      expect(modelTitle).toHaveTextContent(/^新規登録$/);

      if (backButton) await user.click(backButton); //閉じる
    });
  });

  describe("リスト(テーブル)の登録・削除・エラーチェック・更新", () => {
    // リストが表示されるまで待つ各テストの共通処理
    beforeEach(async () => {
      await waitForElementToBeRemoved(() => screen.getByTestId("loader-text"));
    });

    test("リスト一覧（テーブル）をみることができる", () => {
      // モックで登録した初回リスト取得
      const { num } = getList();
      expect(num).toBe(firstListLength);
    });

    test("学習記録が登録できること（内容と時間を入力して登録するとリストに項目が追加される）", async () => {
      // テストデータ登録 → 待つ → 再リスト取得 → 値チェック → 現在リスト数表示
      const checkAddList = async (
        inputStudyValue: string,
        inputStudyTime: number,
        previousLength: number
      ) => {
        // テストデータを登録する（自動でモーダル閉じる）
        const button = screen.getByRole("button", { name: "新規登録" });
        await addList({
          inputStudyValue,
          inputStudyTime,
          button,
        });
        // リストが増えるのを待つ
        await waitForListLengthChange(previousLength);

        // 再リスト取得(登録後はtrが1個以上。NULLではない)
        const { trs, num } = getList();
        const { lastItem, lastId } = getLastList(trs);

        if (lastItem) {
          // ユーザー目線で念のため.querySelector("td");ではなく.findByTextを使用
          // テキストが表示されるまで待機
          const targetTitle = await within(lastItem).findByText(
            inputStudyValue
          );
          const targetTime = await within(lastItem).findByText(
            `${inputStudyTime}h`
          );

          // 入力した値で表示されていること
          expect(targetTitle).toBeVisible();
          expect(targetTime).toBeVisible();
          expect(targetTitle).toHaveTextContent(
            new RegExp(`^${inputStudyValue}$`)
          );
          expect(targetTime).toHaveTextContent(
            new RegExp(`^${inputStudyTime}h$`)
          );

          const { inputElText, inputElNumber } = await getFormChildren(button);
          expect(inputElText).toHaveValue(""); //初期値にもどっていること
          expect(inputElNumber).toHaveValue(0); //初期値にもどっていること

          console.log(`after（登録後）:現リスト${num}個`);
          console.log(
            `登録内容 \n id：${lastId} \n title：${inputStudyValue} \n time：${inputStudyTime}`
          );

          return num;
        } else {
          fail("登録後はリストは存在するはずですがリストが0個です");
        }
      };

      // 初回リスト取得
      const { num } = getList();
      console.log(`before（登録前）:現リスト${num}個`);

      // 登録1回目
      const afterNum = await checkAddList(
        inputStudyValue3,
        inputStudyTime3,
        num
      );
      expect(mockCreateStudy).toHaveBeenCalledTimes(1);

      // 登録2回目（2個目も登録できるか確認）
      await checkAddList(inputStudyValue4, inputStudyTime4, afterNum);
      expect(mockCreateStudy).toHaveBeenCalledTimes(2);
    });

    // モックの初回リストは2個のため、そのリストを削除
    test("削除ボタンを押すと学習記録が削除され、もし一覧が0件の場合「まだ学習記録を登録していません。」が表示されること", async () => {
      // テストデータ削除（末のtr削除） → 待つ → 再リスト取得 → 値チェック → 現在リスト数表示
      const checkMinusList = async () => {
        // ダイアログ表示のときに自動でハイにする（削除ボタン押下後）
        const confirmSpy = vi
          .spyOn(window, "confirm")
          .mockImplementation(() => true);

        // リスト取得
        const { trs: beforelist, num: beforeNum } = getList();
        const { lastItem, lastId } = getLastList(beforelist);
        console.log(`削除予定ID：${lastId}`); //削除するリストのID

        // 登録後なので必ず1件以上あるが、0件の場合も考慮
        if (lastItem != null) {
          const button = within(lastItem).getByTestId("delete-list");
          await user.click(button);
        } else {
          fail("リストが1件ある状態で、削除を実行してください");
        }

        // リストがへるのを待つ
        await waitForListLengthChange(beforeNum, "minus");
        // リスト再取得
        const { trs: afterlist, num: afterNum } = getList();

        // 削除したIDが含まれていないこと(soma関数に変更してもOK)
        if (afterlist.length >= 1) {
          const ids = afterlist.map((tr) => tr.getAttribute("data-id"));
          expect(ids).not.toContain(lastId);
        }
        // リスト数(after)
        console.log(`after（削除後）:現リスト${afterNum}個`);
        console.log(`削除ID：${lastId}`);

        confirmSpy.mockRestore(); //ダイアログ閉じる
      };

      const { num } = getList();
      console.log(`before（削除前）:現リスト${num}個`);

      // 1回目削除（2個→1個）
      await checkMinusList();
      // 2回目削除（1個→0個）
      await checkMinusList();

      const noList = screen.getByTestId("no-list");
      expect(noList).toBeVisible();
      expect(noList).toHaveTextContent(/^まだ学習記録を登録していません。$/);
    });

    // エラーメッセージで使用する共通関数
    // リスト取得（before） → 登録クリック → エラーメッセージ → リスト取得(after) → 現在リスト数表示
    const checkErrorMessage = async (
      message_id: string,
      message_text: string,
      value?: string
    ) => {
      // リスト取得（before）
      const { trs: beforelist, num: beforeNum } = getList();
      const { lastId: lastIdBefore } = getLastList(beforelist);
      console.log(`before(エラーメッセージ表示前):現リスト${beforeNum}個`);
      console.log(`比較するBeforeID：${lastIdBefore}`);

      const button = screen.getByRole("button", { name: "新規登録" });
      const { inputElNumber, sendButton, backButton } = await getFormChildren(
        button
      );

      await user.clear(inputElNumber);
      if (value) await user.type(inputElNumber, value);
      if (sendButton) await user.click(sendButton);

      // リスト数チェック
      await waitForListLengthChange(beforeNum, "same");
      const error = screen.getByTestId(message_id);
      expect(error).toBeVisible();
      expect(error).toHaveTextContent(new RegExp(`^${message_text}$`));
      console.log(message_text);

      if (backButton) await user.click(backButton); //閉じる

      // 再リスト取得（after）
      const { trs: afterlist, num: afterNum } = getList();
      const { lastId: lastIdAfter } = getLastList(afterlist);
      console.log(`after(エラーメッセージ表示後):現リスト${afterNum}個`);
      console.log(`比較するAfterID：${lastIdAfter}`);

      // IDが変わっていないことを確認
      expect(lastIdAfter).toBe(lastIdBefore);
    };

    test("学習内容を空で登録するとエラーがでる", async () => {
      await checkErrorMessage(
        "error-title-message",
        "学習内容の入力は必須です"
      );
    });

    test("学習時間を空で登録するとエラーがでる", async () => {
      await checkErrorMessage("error-time-message", "学習時間の入力は必須です");
    });

    test("学習時間を1以上でないときにエラーがでる", async () => {
      await checkErrorMessage(
        "error-time-message",
        "学習時間は1以上である必要があります",
        "0"
      );
    });

    test("更新の場合、モーダルのタイトルとinputの初期値確認、編集して保存すると更新できる", async () => {
      // リスト取得（before）
      const { trs: beforelist, num: beforeNum } = getList();
      const { lastItem: lastItemBefore, lastId: lastIdBefore } =
        getLastList(beforelist);
      console.log(`before(更新前):現リスト${beforeNum}個`);
      console.log(`比較するBeforeID：${lastIdBefore}`);

      let button: HTMLElement;
      if (lastItemBefore != null) {
        button = within(lastItemBefore).getByTestId("edit-list");
      } else {
        fail("リストが1件ある状態で、更新ボタンを押下してください");
      }

      // 更新用モーダル情報取得
      const { inputElText, inputElNumber, sendButton } = await getFormChildren(
        button
      );

      // 更新用モーダルが開いた状態
      // console.log(inputElText.value);
      // console.log(inputElNumber.value);
      expect(inputElText).toHaveValue(inputStudyValue2); //更新前の値
      expect(inputElNumber).toHaveValue(Number(inputStudyTime2)); //更新前の値
      const modelTitle = screen.getByTestId("model-title");
      // console.log(modelTitle.textContent);
      expect(modelTitle).toBeVisible();
      expect(modelTitle).toHaveTextContent(/^記録編集$/);

      // テストデータを更新する
      // fireEvent.change(inputElText, { target: { value: updateStudyValue } }); の場合クリアなしでもいけるらしい
      await user.clear(inputElText); //一旦クリア（クリアしないと末に追加になる）
      await user.clear(inputElNumber);
      await user.type(inputElText, updateStudyValue);
      await user.type(inputElNumber, String(updateStudyTime));
      if (sendButton) await user.click(sendButton); //自動でモーダル閉じる

      // リスト数チャック（変換なしか）
      await waitForListLengthChange(beforeNum, "same");

      // 再リスト取得（after）
      const { trs: afterlist, num: afterNum } = getList();
      const { lastItem: lastItemAfter, lastId: lastIdAfter } =
        getLastList(afterlist);

      if (lastItemAfter) {
        const targetTitle = await within(lastItemAfter).findByText(
          updateStudyValue
        );
        const targetTime = await within(lastItemAfter).findByText(
          `${updateStudyTime}h`
        );

        // 更新した値で表示されていること
        expect(targetTitle).toBeVisible();
        expect(targetTime).toBeVisible();
        expect(targetTitle).toHaveTextContent(
          new RegExp(`^${updateStudyValue}$`)
        );
        expect(targetTime).toHaveTextContent(
          new RegExp(`^${updateStudyTime}h$`)
        );

        console.log(`after(更新後):現リスト${afterNum}個`);
        console.log(`比較するAfterID：${lastIdAfter}`);

        // IDが変わっていないことを確認
        expect(lastIdAfter).toBe(lastIdBefore);
      }
    });
  });
});
