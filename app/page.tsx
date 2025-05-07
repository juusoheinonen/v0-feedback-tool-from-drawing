import Link from "next/link"
import FeedbackList from "@/components/feedback-list"
import { getFeedbackList } from "@/lib/api"

export default async function Home() {
  const feedbackItems = await getFeedbackList()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Feedback</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/give-feedback" className="btn-primary flex items-center justify-center py-3 text-lg">
            Give Feedback
          </Link>
          <Link href="/wish-feedback" className="btn-outline flex items-center justify-center py-3 text-lg">
            Wish Feedback
          </Link>
        </div>

        <FeedbackList initialItems={feedbackItems} />
      </div>
    </div>
  )
}
