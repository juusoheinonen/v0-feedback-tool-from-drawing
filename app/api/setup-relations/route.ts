import { getSupabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = getSupabaseServer()

  // Add foreign key constraints to the feedback table
  const { error } = await supabase.rpc("exec_sql", {
    sql_string: `
      -- First drop any existing constraints to avoid conflicts
      ALTER TABLE IF EXISTS public.feedback 
        DROP CONSTRAINT IF EXISTS feedback_sender_id_fkey,
        DROP CONSTRAINT IF EXISTS feedback_receiver_id_fkey;

      -- Add foreign key constraints
      ALTER TABLE public.feedback
        ADD CONSTRAINT feedback_sender_id_fkey 
        FOREIGN KEY (sender_id) 
        REFERENCES public.profiles(id) ON DELETE CASCADE;

      ALTER TABLE public.feedback
        ADD CONSTRAINT feedback_receiver_id_fkey 
        FOREIGN KEY (receiver_id) 
        REFERENCES public.profiles(id) ON DELETE CASCADE;
    `,
  })

  if (error) {
    console.error("Error setting up relations:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
