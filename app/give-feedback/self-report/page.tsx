import { getCurrentUser } from "@/lib/api"
import FeedbackForm from "@/components/feedback-form"
import { redirect } from "next/navigation"

export default async function SelfReportPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FeedbackForm
        receiverId={user.id}
        receiverName={user.full_name || user.email}
        receiverRole={user.role || ""}
        receiverLocation={user.location || ""}
        isWish={false}
        isSelfReport={true}
      />
    </div>
  )
}
