import Link from "next/link"
import { getProfiles } from "@/lib/api"
import GiveFeedbackSearch from "@/components/give-feedback-search"

export default async function GiveFeedbackPage() {
  const profiles = await getProfiles()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Give Feedback</h1>

      <GiveFeedbackSearch initialProfiles={profiles} />

      <div className="mb-8">
        <Link
          href="/give-feedback/self-report"
          className="block w-full text-center py-3 border-2 border-secondary text-secondary font-medium rounded-lg hover:bg-secondary hover:bg-opacity-5 transition-colors"
        >
          SELF-REPORT
        </Link>
        <p className="mt-3 text-sm text-gray-600">
          Self report to note down feedback from face to face meetings, Slack or email
        </p>
      </div>
    </div>
  )
}
