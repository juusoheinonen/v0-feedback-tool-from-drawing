"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, LogOut, User } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null)

  // Only show back button on pages other than home
  const showBackButton = pathname !== "/"

  // Show page title based on current path
  const getPageTitle = () => {
    if (pathname === "/") return ""
    if (pathname.includes("/give-feedback")) return "Give Feedback"
    if (pathname.includes("/wish-feedback")) return "Wish Feedback"
    return ""
  }

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        // Get profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", data.user.id)
          .single()

        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: profileData?.full_name || null,
        })
      }
    }

    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
              </Link>
            )}
            {!showBackButton && (
              <Link href="/" className="text-xl font-bold text-secondary">
                Feedback Tool
              </Link>
            )}
            {getPageTitle() && <h1 className="text-xl font-bold">{getPageTitle()}</h1>}
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`font-medium ${
                  pathname === "/" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Feedback
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">
                Reflection
              </Link>
            </nav>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name || user.email}</span>
                </div>
                <button className="text-gray-600 hover:text-gray-900" onClick={handleSignOut}>
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
