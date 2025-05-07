"use client"

// Sample data for colleagues
const colleagues = [
  { id: 1, name: "Alex Johnson", role: "Product Manager", location: "New York" },
  { id: 2, name: "Sarah Miller", role: "UX Designer", location: "San Francisco" },
  { id: 3, name: "Michael Chen", role: "Developer", location: "Toronto" },
  { id: 4, name: "Emily Wilson", role: "Marketing", location: "London" },
  { id: 5, name: "David Kim", role: "Data Analyst", location: "Seoul" },
]

import { getProfiles } from "@/lib/api"
import WishFeedbackSearch from "@/components/wish-feedback-search"

export default async function WishFeedbackPage() {
  const profiles = await getProfiles()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wish Feedback</h1>

      <WishFeedbackSearch initialProfiles={profiles} />
    </div>
  )
}
