import { supabase } from "../../lib/supabase";
import { Study } from "../../domain/study";

/* Supabase上のロールの設定
  SELECT : ログイン後、自分で作成したレコードのみ閲覧可能
  INSERT : ログイン後、レコードの作成が可能
  UPDATE : ログイン後、自分で作成したレコードのみ更新可能
  DELETE : ログイン後、自分で作成したレコードのみ削除可能
*/

// 型をStudy型で返す。非同期のため返値Promise<Study[]>
export async function getStudy(): Promise<Study[]> {
  const { data, error } = await supabase.from("study_record").select();
  if (error != null) throw new Error(error.message);

  const res = data.map((study) => {
    return new Study(study.id, study.title, study.time);
  });

  return res;
}

export async function createStudy(title: string, time: number) {
  const { data, error } = await supabase.from("study_record").insert([{
    title,
    time,
  }]).select().single();

  if (error != null) throw new Error(error.message);
  if (!data) throw new Error("作成されたデータが見つかりません");

  return new Study(data.id, data.title, data.time);
}

export async function editStudy(id: string, title: string, time: number) {
  const { data, error } = await supabase.from("study_record").update({
    title,
    time,
  }).eq("id", id).select().single();

  if (error != null) throw new Error(error.message);
  if (!data) throw new Error("更新されたデータが見つかりません");

  return new Study(data.id, data.title, data.time);
}

// テーブルが空になると、IDのAutoIncrementはリセットされない
// 今回はUUIDのため考慮なし
export async function deleteStudy(id: string) {
  const { data, error } = await supabase.from("study_record").delete().eq(
    "id",
    id,
  ).select().single();

  if (error !== null) throw new Error(error.message);
  if (!data) throw new Error("削除されたデータが見つかりません");

  return new Study(data.id, data.title, data.time);
}
