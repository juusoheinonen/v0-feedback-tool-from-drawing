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
    redirect("/auth")
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

  return data
}

export async function getFeedbackList() {
  const supabase = getSupabaseServer()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth")
  }

  const userId = session.user.id

  // Get all feedback where the user is either sender or receiver
  const { data: feedbackData, error } = await supabase
    .from("feedback")
    .select(`
      *,
      sender:profiles!feedback_sender_id_fkey(full_name, role, location),
      receiver:profiles!feedback_receiver_id_fkey(full_name, role, location)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feedback:", error)
    return []
  }

  // Transform the data to match our UI needs
  return feedbackData.map((item) => {
    const isSender = item.sender_id === userId
    const otherPerson = isSender ? item.receiver : item.sender

    let status = ""
    if (item.is_wish) {
      status = isSender ? "wish-sent" : "wish-received"
    } else {
      status = isSender ? "sent" : "received"
    }

    return {
      id: item.id,
      person: otherPerson.full_name,
      personId: isSender ? item.receiver_id : item.sender_id,
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
    redirect("/auth")
  }

  const { data, error } = await supabase
    .from("feedback")
    .select(`
      *,
      sender:profiles!feedback_sender_id_fkey(full_name, role, location),
      receiver:profiles!feedback_receiver_id_fkey(full_name, role, location)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching feedback:", error)
    return null
  }

  return {
    id: data.id,
    sender: {
      id: data.sender_id,
      name: data.sender.full_name,
      role: data.sender.role,
      location: data.sender.location,
    },
    receiver: {
      id: data.receiver_id,
      name: data.receiver.full_name,
      role: data.receiver.role,
      location: data.receiver.location,
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
