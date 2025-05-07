"use client"

import { useState } from "react"
import { seedDatabase } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean } | null>(null)
  const router = useRouter()

  const handleSeed = async () => {
    setLoading(true)
    try {
      const result = await seedDatabase()
      setResult(result)
    } catch (error) {
      console.error("Error seeding database:", error)
      setResult({ success: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Seed Database</h1>
      <p className="mb-6">
        This will create sample users and feedback data in your database. Use this to quickly populate your application
        with test data.
      </p>

      {result && (
        <div className={`p-4 mb-6 rounded-md ${result.success ? "bg-green-100" : "bg-red-100"}`}>
          {result.success ? (
            <p className="text-green-800">Database seeded successfully!</p>
          ) : (
            <p className="text-red-800">Failed to seed database. Check console for errors.</p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={handleSeed} disabled={loading}>
          {loading ? "Seeding..." : "Seed Database"}
        </Button>
        {result?.success && (
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  )
}
