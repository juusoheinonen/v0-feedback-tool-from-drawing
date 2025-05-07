"use server"

import { getSupabaseServer } from "./supabase/server"
import { redirect } from "next/navigation"

export async function seedDatabase() {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  const results = {
    logs: [] as string[],
    success: false,
  }

  try {
    // Log the current user
    results.logs.push(`Current user ID: ${session.user.id}`)

    // Create test users with direct SQL for more reliable execution
    const testUsers = [
      {
        email: "alex@example.com",
        password: "password123",
        full_name: "Alex Johnson",
        role: "Product Manager",
        location: "New York",
      },
      {
        email: "sarah@example.com",
        password: "password123",
        full_name: "Sarah Miller",
        role: "UX Designer",
        location: "San Francisco",
      },
      {
        email: "michael@example.com",
        password: "password123",
        full_name: "Michael Chen",
        role: "Developer",
        location: "Toronto",
      },
      {
        email: "emily@example.com",
        password: "password123",
        full_name: "Emily Wilson",
        role: "Marketing",
        location: "London",
      },
    ]

    const createdUsers = []

    // First, check if we already have users in the profiles table
    const { data: existingProfiles, error: profilesError } = await supabase.from("profiles").select("*").limit(10)

    if (profilesError) {
      results.logs.push(`Error checking existing profiles: ${profilesError.message}`)
      throw new Error(`Error checking existing profiles: ${profilesError.message}`)
    }

    results.logs.push(`Found ${existingProfiles?.length || 0} existing profiles`)

    // If we have the current user's profile, add it to our list
    const currentUserProfile = existingProfiles?.find((profile) => profile.id === session.user.id)
    if (currentUserProfile) {
      results.logs.push(`Found current user profile: ${currentUserProfile.full_name || "Unknown"}`)
    }

    // Create test users if they don't exist
    for (const user of testUsers) {
      // Check if user already exists by email
      const { data: existingUsers, error: existingError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("full_name", user.full_name)

      if (existingError) {
        results.logs.push(`Error checking existing user ${user.email}: ${existingError.message}`)
        continue
      }

      if (existingUsers && existingUsers.length > 0) {
        results.logs.push(`User ${user.email} already exists, skipping creation`)
        createdUsers.push(existingUsers[0])
        continue
      }

      try {
        // Create user with direct SQL to bypass auth
        const { data: newUser, error: createError } = await supabase.rpc("create_user_with_profile", {
          user_email: user.email,
          user_password: user.password,
          user_full_name: user.full_name,
          user_role: user.role,
          user_location: user.location,
        })

        if (createError) {
          results.logs.push(`Error creating user ${user.email}: ${createError.message}`)
          continue
        }

        if (newUser) {
          results.logs.push(`Created user ${user.email} with ID: ${newUser}`)

          // Get the profile for the newly created user
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newUser)
            .single()

          if (profileError) {
            results.logs.push(`Error fetching profile for ${user.email}: ${profileError.message}`)
          } else if (profile) {
            results.logs.push(`Retrieved profile for ${user.email}`)
            createdUsers.push(profile)
          }
        }
      } catch (error: any) {
        results.logs.push(`Exception creating user ${user.email}: ${error.message}`)
      }
    }

    results.logs.push(`Created/found ${createdUsers.length} test users`)

    // Create sample feedback
    const feedbackData = [
      {
        title: "Great collaboration on the Q1 project",
        content: `I wanted to provide some feedback on our recent collaboration for the Q1 project.

I really appreciated your attention to detail and proactive communication throughout the project. You consistently kept everyone updated on your progress and raised potential issues early, which helped us address them before they became problems.

Your technical expertise was invaluable, especially when we faced challenges with the integration. The solution you proposed not only solved our immediate issue but also improved the overall architecture.

One area that could be further improved is documentation. While your code is clean and well-structured, having more comprehensive documentation would make it easier for new team members to understand the system.

Overall, it was a pleasure working with you, and I look forward to our next collaboration!`,
        is_wish: false,
        is_self_report: false,
      },
      {
        title: "Feedback on your presentation skills",
        content: `I wanted to share some feedback on your presentation at the last team meeting.

Your technical knowledge and depth of understanding of the subject matter was impressive. You clearly explained complex concepts in a way that was accessible to everyone, including non-technical team members.

I particularly appreciated how you structured the presentation, starting with the problem statement and then methodically walking through your approach and solution. The visuals you used were also very helpful in illustrating your points.

One suggestion for improvement would be to leave a bit more time for questions at the end. A few team members had questions that we had to address offline after the meeting.

Overall, it was an excellent presentation that showcased both your technical expertise and communication skills. I look forward to your next presentation!`,
        is_wish: false,
        is_self_report: false,
      },
      {
        title: "Request for feedback on my design collaboration",
        content: `I'd really appreciate your feedback on how I've been collaborating with you on the recent design projects.

Specifically, I'd like to know:

1. Am I providing clear and timely requirements for the design tasks?
2. Is my feedback on your designs constructive and helpful?
3. How could I better support you in the design process?
4. Are there any communication improvements you'd suggest?

I value your expertise as a designer and want to ensure I'm being the best collaborator I can be. Any insights you can provide would be extremely helpful for my professional development.

Thank you for considering this request!`,
        is_wish: true,
        is_self_report: false,
      },
    ]

    // Only proceed if we have at least 2 users (including current user)
    if (createdUsers.length >= 1 && currentUserProfile) {
      const currentUserId = session.user.id
      const targetUserId = createdUsers[0].id

      results.logs.push(`Creating feedback between current user (${currentUserId}) and target user (${targetUserId})`)

      try {
        // Check if feedback already exists
        const { data: existingFeedback, error: feedbackError } = await supabase
          .from("feedback")
          .select("*")
          .eq("sender_id", currentUserId)
          .eq("receiver_id", targetUserId)
          .limit(1)

        if (feedbackError) {
          results.logs.push(`Error checking existing feedback: ${feedbackError.message}`)
        } else if (existingFeedback && existingFeedback.length > 0) {
          results.logs.push("Feedback already exists, skipping creation")
        } else {
          // Create feedback from current user to first test user
          const { error: insertError1 } = await supabase.from("feedback").insert({
            sender_id: currentUserId,
            receiver_id: targetUserId,
            title: feedbackData[0].title,
            content: feedbackData[0].content,
            is_wish: feedbackData[0].is_wish,
            is_self_report: feedbackData[0].is_self_report,
          })

          if (insertError1) {
            results.logs.push(`Error creating feedback 1: ${insertError1.message}`)
          } else {
            results.logs.push("Created feedback 1 successfully")
          }

          // Create feedback from first test user to current user
          const { error: insertError2 } = await supabase.from("feedback").insert({
            sender_id: targetUserId,
            receiver_id: currentUserId,
            title: feedbackData[1].title,
            content: feedbackData[1].content,
            is_wish: feedbackData[1].is_wish,
            is_self_report: feedbackData[1].is_self_report,
          })

          if (insertError2) {
            results.logs.push(`Error creating feedback 2: ${insertError2.message}`)
          } else {
            results.logs.push("Created feedback 2 successfully")
          }

          // Create wish from current user to second test user (if available)
          if (createdUsers.length >= 2) {
            const secondUserId = createdUsers[1].id

            const { error: insertError3 } = await supabase.from("feedback").insert({
              sender_id: currentUserId,
              receiver_id: secondUserId,
              title: feedbackData[2].title,
              content: feedbackData[2].content,
              is_wish: feedbackData[2].is_wish,
              is_self_report: feedbackData[2].is_self_report,
            })

            if (insertError3) {
              results.logs.push(`Error creating feedback 3: ${insertError3.message}`)
            } else {
              results.logs.push("Created feedback 3 successfully")
            }
          }
        }
      } catch (error: any) {
        results.logs.push(`Exception creating feedback: ${error.message}`)
      }
    } else {
      results.logs.push("Not enough users to create feedback relationships")
    }

    results.success = true
  } catch (error: any) {
    results.logs.push(`General error: ${error.message}`)
  }

  return results
}
