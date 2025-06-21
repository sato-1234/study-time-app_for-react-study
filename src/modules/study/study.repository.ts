import { supabase } from "../../lib/supabase";
import { Study } from "../../domain/study"

/* Supabase上のロールの設定（ログイン機能がまだのため一旦全ユーザー）
  alter policy "Enable access for all users"
  on "public"."study_record"
  to anon
  using (true);
*/

// 型をStudy型で返す。非同期のため返値Promise<Study[]>
export async function getStudy(): Promise<Study[]> {
  const {data, error} = await supabase.from("study_record").select();
  if (error != null) throw new Error(error.message);

  const res = data.map((study) => {
    return new Study(study.id, study.title, study.time);
  })
  return res;
}

export async function createStudy(title: string, time: number) {
  const {data, error} = await supabase.from("study_record").insert([{title,time}]).select().single(); 
  if (error != null) throw new Error(error.message);
  return new Study(data.id, data.title, data.time);
}

// テーブルが空になると、IDのAutoIncrementはリセットされない
// 今回はUUIDのため考慮なし
export async function deleteStudy(id: string) {
  const { data, error } = await supabase.from("study_record").delete().eq("id", id).select().single(); 
  if (error !== null) throw new Error(error.message);
  return new Study(data.id, data.title, data.time);
}