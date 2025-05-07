"use client"

import type React from "react"

import { useState } from "react"
import { Bold, Italic, Underline, List, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createFeedback } from "@/lib/api"

interface FeedbackFormProps {
  receiverId: string
  receiverName: string
  receiverRole: string
  receiverLocation: string
  isWish: boolean
  isSelfReport?: boolean
}

export default function FeedbackForm({
  receiverId,
  receiverName,
  receiverRole,
  receiverLocation,
  isWish,
  isSelfReport = false,
}: FeedbackFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("receiverId", receiverId)
      formData.append("isWish", isWish.toString())
      formData.append("isSelfReport", isSelfReport.toString())

      await createFeedback(formData)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{isWish ? "Wish Feedback From:" : "Give Feedback To:"}</h2>
        <div className="flex items-center gap-2">
          <span className="font-medium">{receiverName}</span>
          <span className="text-sm text-gray-600">
            • {receiverRole}/{receiverLocation}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
        <div className="absolute top-3 right-3">
          <HelpCircle size={18} className="text-blue-500" />
        </div>
        <h3 className="font-medium text-blue-800 mb-2">Guidance</h3>
        <p className="text-sm text-blue-700">
          {isWish
            ? "Be specific about what areas you'd like feedback on. This helps your colleague provide more targeted and useful insights."
            : "Provide specific, actionable feedback that helps your colleague grow. Focus on behaviors rather than personality traits."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Write a title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" className="p-1 text-gray-600 hover:text-gray-900">
                <Bold size={18} />
              </button>
              <button type="button" className="p-1 text-gray-600 hover:text-gray-900">
                <Italic size={18} />
              </button>
              <button type="button" className="p-1 text-gray-600 hover:text-gray-900">
                <Underline size={18} />
              </button>
              <button type="button" className="p-1 text-gray-600 hover:text-gray-900">
                <List size={18} />
              </button>
            </div>

            <textarea
              id="content"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              placeholder={
                isWish
                  ? "Describe what specific areas you'd like feedback on and why this feedback would be valuable to you."
                  : "Describe the context of your feedback. What would you like to encourage and what can be further improved?"
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button type="button" className="text-red-600 hover:text-red-800" onClick={() => router.back()}>
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : isWish ? "Send Request" : "Send"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
