// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Agar tu Next.js ya Vite use kar raha hai, toh inko .env file se lena best hota hai
// Par abhi ke liye tera manual URL/Key chal jayega.
const supabaseUrl = 'https://pfoyapvlbpsfwhdlfudk.supabase.co'
const supabaseAnonKey = 'sb_publishable_kzgyZLrdkiGytj1QPskYwQ_FBGovUV0'

// 🔥 UPDATE: Added Database Types support (Optional but recommended)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // Session save rahega browser band hone ke baad bhi
    autoRefreshToken: true,     // Token apne aap refresh hoga
    detectSessionInUrl: true,   // Email confirmation ke baad login auto-detect hoga
    storageKey: 'syncura-auth', // Unique key taaki session "missing" na ho
    flowType: 'pkce',           // Modern auth flow for better security
  },
  realtime: { 
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: { 'x-application-name': 'syncura-smart-bills' },
  }
})

// Helper function: Isse tu kisi bhi page pe current user ki ID turant nikaal payega
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export default supabase