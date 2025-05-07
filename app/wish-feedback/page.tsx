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
