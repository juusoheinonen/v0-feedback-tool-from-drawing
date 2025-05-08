import { getSupabaseServer } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = getSupabaseServer()

  try {
    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error("Error fetching auth users:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const results = {
      updated: 0,
      errors: 0,
      details: [] as string[],
    }

    // Update profiles for each user
    for (const user of authUsers.users) {
      const userData = user.user_metadata

      if (userData && (userData.role || userData.location)) {
        // Update the profile with metadata
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            role: userData.role || null,
            location: userData.location || null,
            full_name: userData.full_name || null,
          })
          .eq("id", user.id)

        if (updateError) {
          results.errors++
          results.details.push(`Error updating profile for ${user.email}: ${updateError.message}`)
        } else {
          results.updated++
          results.details.push(`Updated profile for ${user.email}`)
        }
      } else {
        results.details.push(`No metadata found for ${user.email}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error("Error updating profiles:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
