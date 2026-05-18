// src/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pfoyapvlbpsfwhdlfudk.supabase.co";
const supabaseAnonKey = "sb_publishable_kzgyZLrdkiGytj1QPskYwQ_FBGovUV0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);