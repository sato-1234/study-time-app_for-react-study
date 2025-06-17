import { supabase } from "../../lib/supabase";

/* Supabase上のロールの設定（ログイン機能がまだのため一旦全ユーザー）
  alter policy "Enable access for all users"
  on "public"."study_record"
  to anon
  using (true);
*/
export async function getStudy() {
  const {data, error} = await supabase.from("study_record").select();
  if (error != null) throw new Error(error.message);
  return data;
}

export async function createStudy(title: string, time: number) {
  const {data, error} = await supabase.from("study_record").insert([{title,time}]).select().single(); 
  if (error != null) throw new Error(error.message);
  return data;
}

export async function deleteStudy(id: string) {
  const { data, error } = await supabase.from("study_record").delete().eq("id", id).select().single(); 
  if (error !== null) throw new Error(error.message);
  return data;
}
