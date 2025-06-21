// Supabaseに接続
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_API_KEY!
);

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
// const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY!;

// // クライアント設定
// export const supabase = createClient(supabaseUrl, supabaseKey);
