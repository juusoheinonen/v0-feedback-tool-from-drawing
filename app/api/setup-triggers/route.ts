import { getSupabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = getSupabaseServer()

  // Create or update the trigger to handle user creation
  const { error } = await supabase.rpc("exec_sql", {
    sql_string: `
      -- Function to handle new user creation
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (
          id,
          full_name,
          role,
          location,
          avatar_url,
          created_at,
          updated_at
        )
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'role',
          NEW.raw_user_meta_data->>'location',
          NEW.raw_user_meta_data->>'avatar_url',
          NOW(),
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Drop the trigger if it exists
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

      -- Create the trigger
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `,
  })

  if (error) {
    console.error("Error setting up triggers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
