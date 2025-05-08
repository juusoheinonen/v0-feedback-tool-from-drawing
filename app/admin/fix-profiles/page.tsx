"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FixProfilesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFixProfiles = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/update-profiles")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profiles")
      }

      setResult(data.results)
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Fix User Profiles</CardTitle>
          <CardDescription>
            This tool will update all user profiles with the metadata from auth.users. Use this to fix missing role and
            location data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="font-medium">Results:</p>
              <p>Updated: {result.updated} profiles</p>
              <p>Errors: {result.errors}</p>

              {result.details && result.details.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium">Details:</p>
                  <div className="max-h-60 overflow-y-auto mt-2 text-sm">
                    {result.details.map((detail: string, index: number) => (
                      <div key={index} className="py-1 border-b border-gray-200 last:border-0">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <Button onClick={handleFixProfiles} disabled={loading}>
              {loading ? "Updating Profiles..." : "Fix Profiles"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500 justify-center">
          This action will only update profiles with missing data.
        </CardFooter>
      </Card>
    </div>
  )
}
