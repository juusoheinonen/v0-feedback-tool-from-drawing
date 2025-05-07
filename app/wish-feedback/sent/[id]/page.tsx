import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getFeedbackById } from "@/lib/api"
import { notFound } from "next/navigation"

export default async function SentWishPage({ params }: { params: { id: string } }) {
  const feedback = await getFeedbackById(params.id)

  if (!feedback || !feedback.isWish) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-2">{feedback.title}</h1>
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            To: <span className="font-medium text-gray-900">{feedback.receiver.name}</span> ({feedback.receiver.role})
          </div>
          <div className="text-sm text-gray-600">{feedback.createdAt}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="prose max-w-none">
            {feedback.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
