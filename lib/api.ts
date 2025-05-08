"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServer } from "./supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return {
    id: session.user.id,
    email: session.user.email,
    ...profile,
  }
}

export async function getProfiles(searchQuery = "") {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return []
  }

  let query = supabase.from("profiles").select("*")

  if (searchQuery) {
    query = query.ilike("full_name", `%${searchQuery}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }

  return data || []
}

export async function getFeedbackList() {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return []
  }

  const userId = session.user.id

  // Use simpler query first to avoid foreign key issues
  const { data: feedbackData, error } = await supabase
    .from("feedback")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feedback:", error)
    return []
  }

  // If no data, return early
  if (!feedbackData || feedbackData.length === 0) {
    return []
  }

  // Get all profiles needed for the feedback items
  const profileIds = new Set<string>()
  feedbackData.forEach((item) => {
    profileIds.add(item.sender_id)
    profileIds.add(item.receiver_id)
  })

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", Array.from(profileIds))

  if (profilesError) {
    console.error("Error fetching profiles for feedback:", profilesError)
    return []
  }

  const profilesMap = (profilesData || []).reduce(
    (acc, profile) => {
      acc[profile.id] = profile
      return acc
    },
    {} as Record<string, any>,
  )

  // Transform the data to match our UI needs
  return (feedbackData || []).map((item) => {
    const isSender = item.sender_id === userId
    const otherPersonId = isSender ? item.receiver_id : item.sender_id
    const otherPerson = profilesMap[otherPersonId]

    let status = ""
    if (item.is_wish) {
      status = isSender ? "wish-sent" : "wish-received"
    } else {
      status = isSender ? "sent" : "received"
    }

    return {
      id: item.id,
      person: otherPerson?.full_name || "Unknown",
      personId: otherPersonId,
      type: isSender
        ? item.is_wish
          ? "Wish Sent"
          : "Feedback Sent"
        : item.is_wish
          ? "Wish Received"
          : "Feedback Received",
      date: new Date(item.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status,
      title: item.title,
      content: item.content,
    }
  })
}

export async function getFeedbackById(id: string) {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return null
  }

  // First get the feedback item
  const { data, error } = await supabase.from("feedback").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching feedback:", error)
    return null
  }

  // Now get the sender and receiver profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", [data.sender_id, data.receiver_id])

  if (profilesError) {
    console.error("Error fetching profiles for feedback:", profilesError)
    return null
  }

  const sender = profiles.find((p) => p.id === data.sender_id)
  const receiver = profiles.find((p) => p.id === data.receiver_id)

  return {
    id: data.id,
    sender: {
      id: data.sender_id,
      name: sender?.full_name || "Unknown",
      role: sender?.role || "Unknown",
      location: sender?.location || "Unknown",
    },
    receiver: {
      id: data.receiver_id,
      name: receiver?.full_name || "Unknown",
      role: receiver?.role || "Unknown",
      location: receiver?.location || "Unknown",
    },
    title: data.title,
    content: data.content,
    isWish: data.is_wish,
    isSelfReport: data.is_self_report,
    createdAt: new Date(data.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}

export async function createFeedback(formData: FormData) {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const receiverId = formData.get("receiverId") as string
  const isWish = formData.get("isWish") === "true"
  const isSelfReport = formData.get("isSelfReport") === "true"

  const { error } = await supabase.from("feedback").insert({
    sender_id: session.user.id,
    receiver_id: receiverId,
    title,
    content,
    is_wish: isWish,
    is_self_report: isSelfReport,
  })

  if (error) {
    console.error("Error creating feedback:", error)
    throw new Error("Failed to create feedback")
  }

  revalidatePath("/")
  redirect("/")
}

// Function to set up database relations - called from the home page
export async function setupDatabaseRelations() {
  try {
    const response = await fetch("/api/setup-relations", { method: "GET" })
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error setting up database relations:", error)
    return false
  }
}
