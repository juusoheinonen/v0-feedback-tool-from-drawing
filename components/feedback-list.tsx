"use client"

import { useState } from "react"
import { User, Filter } from "lucide-react"
import Link from "next/link"
import FilterDialog from "./filter-dialog"
import { Button } from "@/components/ui/button"

interface FeedbackItem {
  id: string
  person: string
  personId: string
  type: string
  date: string
  status: string
  title?: string
  content?: string
}

interface FeedbackListProps {
  initialItems: FeedbackItem[]
}

export default function FeedbackList({ initialItems }: FeedbackListProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    received: true,
    sent: true,
    wishSent: true,
    wishReceived: true,
  })

  // Filter items based on selected filters
  const filteredItems = initialItems.filter((item) => {
    if (item.status === "received" && !filters.received) return false
    if (item.status === "sent" && !filters.sent) return false
    if (item.status === "wish-sent" && !filters.wishSent) return false
    if (item.status === "wish-received" && !filters.wishReceived) return false
    return true
  })

  // Get the appropriate link for each item type
  const getItemLink = (item: FeedbackItem) => {
    switch (item.status) {
      case "received":
        return `/feedback/received/${item.id}`
      case "sent":
        return `/feedback/sent/${item.id}`
      case "wish-sent":
        return `/wish-feedback/sent/${item.id}`
      case "wish-received":
        return `/give-feedback/${item.personId}`
      default:
        return "/"
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          className="flex items-center gap-2 text-gray-700 hover:text-primary border-gray-300 hover:border-primary"
        >
          <Filter size={18} />
          <span>Filter</span>
        </Button>
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      <div className="space-y-4">
        {initialItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-2">No feedback items found</p>
            <p className="text-sm text-gray-400">Give or request feedback to see items here</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No feedback items match your filters</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              href={getItemLink(item)}
              key={item.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium">{item.person}</p>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">{item.date}</div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
