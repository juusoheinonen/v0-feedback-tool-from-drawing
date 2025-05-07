"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a single instance of the Supabase client to be used across client components
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // Server-side - create a new instance each time
    return createClientComponentClient<Database>()
  }

  // Client-side - reuse the instance
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>({
      options: {
        auth: {
          flowType: "pkce",
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      },
    })
  }
  return supabaseClient
}
