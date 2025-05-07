import { getProfiles } from "@/lib/api"
import FeedbackForm from "@/components/feedback-form"

export default async function WishFeedbackPage({ params }: { params: { id: string } }) {
  const profiles = await getProfiles()
  const receiver = profiles.find((profile) => profile.id === params.id)

  if (!receiver) {
    return <div className="text-center py-8">User not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FeedbackForm
        receiverId={receiver.id}
        receiverName={receiver.full_name || ""}
        receiverRole={receiver.role || ""}
        receiverLocation={receiver.location || ""}
        isWish={true}
      />
    </div>
  )
}
