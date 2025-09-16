"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"

export default function OrgDashboardPage() {
  const { org } = useParams() as { org: string }
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState<string>("")
  const [vendorName, setVendorName] = useState<string>("")

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem("stytch_session_token")
        if (!token) {
          router.replace(`/auth/login?next=${encodeURIComponent(location.pathname)}`)
          return
        }
        const res = await fetch(`${MEDUSA_URL}/vendors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to fetch vendor")
        const actual = data.slug as string
        setSlug(actual)
        setVendorName(data?.vendor?.name || "")
        if (org !== actual) {
          router.replace(`/o/${actual}/dashboard`)
          return
        }
      } catch (e: any) {
        setError(e?.message || "Error")
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <main className="p-6">Loading…</main>
  if (error) return <main className="p-6 text-red-600">{error}</main>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{vendorName || slug}</h1>
      <p className="text-gray-600">Roaster dashboard</p>
      <div className="space-x-3 mt-2">
        <a className="underline" href={`/o/${slug}/orders`}>View orders</a>
        <a className="underline" href={`/o/${slug}/products`}>Manage products</a>
      </div>
    </main>
  )
}

