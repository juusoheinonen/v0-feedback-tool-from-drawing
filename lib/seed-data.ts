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

  // Create test users
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

  for (const user of testUsers) {
    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("*").eq("full_name", user.full_name).single()

    if (existingUser) {
      createdUsers.push(existingUser)
      continue
    }

    // Create user in auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
        location: user.location,
      },
    })

    if (authError) {
      console.error("Error creating user:", authError)
      continue
    }

    // Get the profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.user.id).single()

    if (profile) {
      // Update profile with role and location
      await supabase
        .from("profiles")
        .update({
          role: user.role,
          location: user.location,
        })
        .eq("id", profile.id)

      createdUsers.push({
        ...profile,
        role: user.role,
        location: user.location,
      })
    }
  }

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

  // Only proceed if we have at least 2 users
  if (createdUsers.length >= 2) {
    const currentUserId = session.user.id

    // Create feedback from current user to first test user
    await supabase.from("feedback").insert({
      sender_id: currentUserId,
      receiver_id: createdUsers[0].id,
      title: feedbackData[0].title,
      content: feedbackData[0].content,
      is_wish: feedbackData[0].is_wish,
      is_self_report: feedbackData[0].is_self_report,
    })

    // Create feedback from first test user to current user
    await supabase.from("feedback").insert({
      sender_id: createdUsers[0].id,
      receiver_id: currentUserId,
      title: feedbackData[1].title,
      content: feedbackData[1].content,
      is_wish: feedbackData[1].is_wish,
      is_self_report: feedbackData[1].is_self_report,
    })

    // Create wish from current user to second test user
    await supabase.from("feedback").insert({
      sender_id: currentUserId,
      receiver_id: createdUsers[1].id,
      title: feedbackData[2].title,
      content: feedbackData[2].content,
      is_wish: feedbackData[2].is_wish,
      is_self_report: feedbackData[2].is_self_report,
    })
  }

  return { success: true }
}
