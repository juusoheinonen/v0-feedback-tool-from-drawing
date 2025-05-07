"use client"

import { useState, useEffect } from "react"
import { seedDatabase } from "@/lib/seed-data"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [functionCreated, setFunctionCreated] = useState(false)
  const [result, setResult] = useState<{ success: boolean; logs: string[] } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Create the SQL function on page load
    const createFunction = async () => {
      try {
        const response = await fetch("/api/seed/create-function")
        const data = await response.json()
        setFunctionCreated(data.success)
      } catch (error) {
        console.error("Error creating function:", error)
      }
    }

    createFunction()
  }, [])

  const handleSeed = async () => {
    setLoading(true)
    try {
      const result = await seedDatabase()
      setResult(result)
    } catch (error) {
      console.error("Error seeding database:", error)
      setResult({ success: false, logs: [`Error: ${error instanceof Error ? error.message : String(error)}`] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Seed Database</h1>
      <p className="mb-6">
        This will create sample users and feedback data in your database. Use this to quickly populate your application
        with test data.
      </p>

      {!functionCreated && (
        <div className="p-4 mb-6 rounded-md bg-yellow-100">
          <p className="text-yellow-800">Setting up database functions...</p>
        </div>
      )}

      {result && (
        <div className={`p-4 mb-6 rounded-md ${result.success ? "bg-green-100" : "bg-red-100"}`}>
          <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
            {result.success ? "Database seeded successfully!" : "Failed to seed database."}
          </p>

          <div className="mt-4 bg-white p-4 rounded border overflow-auto max-h-96">
            <h3 className="font-medium mb-2">Logs:</h3>
            <pre className="text-xs whitespace-pre-wrap">
              {result.logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={handleSeed} disabled={loading || !functionCreated}>
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
