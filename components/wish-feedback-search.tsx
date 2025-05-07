"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  full_name: string | null
  role: string | null
  location: string | null
}

interface WishFeedbackSearchProps {
  initialProfiles: Profile[]
}

export default function WishFeedbackSearch({ initialProfiles }: WishFeedbackSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProfiles = initialProfiles.filter(
    (profile) =>
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a colleague"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3 mt-4">
        {searchQuery.length > 0 ? (
          filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/wish-feedback/${profile.id}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{profile.full_name}</h3>
                    <p className="text-sm text-gray-600">
                      {profile.role} • {profile.location}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center py-4 text-gray-500">No colleagues found matching "{searchQuery}"</p>
          )
        ) : (
          <p className="text-center py-4 text-gray-500">Type to search for colleagues</p>
        )}
      </div>
    </div>
  )
}
