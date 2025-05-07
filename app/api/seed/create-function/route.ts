import { getSupabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = getSupabaseServer()

  // Create the function to create users with profiles
  const { error } = await supabase.rpc("exec_sql", {
    sql_string: `
      -- Function to create a user with a profile in one transaction
      CREATE OR REPLACE FUNCTION create_user_with_profile(
        user_email TEXT,
        user_password TEXT,
        user_full_name TEXT,
        user_role TEXT,
        user_location TEXT
      ) RETURNS UUID AS $$
      DECLARE
        new_user_id UUID;
      BEGIN
        -- Insert into auth.users
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          recovery_sent_at,
          last_sign_in_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        )
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          user_email,
          crypt(user_password, gen_salt('bf')),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}',
          json_build_object('full_name', user_full_name, 'role', user_role, 'location', user_location),
          now(),
          now(),
          '',
          '',
          '',
          ''
        )
        RETURNING id INTO new_user_id;

        -- The trigger will automatically create the profile
        -- But we'll update it with additional info
        UPDATE public.profiles
        SET 
          role = user_role,
          location = user_location
        WHERE id = new_user_id;

        RETURN new_user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create a function to execute SQL (for admin use)
      CREATE OR REPLACE FUNCTION exec_sql(sql_string TEXT) RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_string;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
