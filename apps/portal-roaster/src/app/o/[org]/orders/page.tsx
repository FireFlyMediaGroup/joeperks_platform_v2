"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"

type OrderRow = { id: string; created_at?: string; status?: string; email?: string; total?: number; currency_code?: string }

export default function OrgOrdersPage() {
  const { org } = useParams() as { org: string }
  const router = useRouter()
  const [vendorSlug, setVendorSlug] = useState<string>("")
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("stytch_session_token") : null), [])

  useEffect(() => {
    async function run() {
      try {
        setLoading(true)
        setError(null)
        if (!token) {
          router.replace(`/auth/login?next=${encodeURIComponent(location.pathname)}`)
          return
        }
        // 1) validate slug against current vendor
        const meRes = await fetch(`${MEDUSA_URL}/vendors/me`, { headers: { Authorization: `Bearer ${token}` } })
        const me = await meRes.json()
        if (!meRes.ok) throw new Error(me?.message || "Failed to fetch vendor")
        const actual = me.slug as string
        setVendorSlug(actual)
        if (org !== actual) {
          router.replace(`/o/${actual}/orders`)
          return
        }
        // 2) fetch vendor orders - placeholder: use general orders endpoint in dev or vendor-scoped endpoint when available
        const devEnabled = process.env.NODE_ENV !== "production"
        const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
        if (devEnabled && process.env.NEXT_PUBLIC_DEV_ENDPOINT_SECRET) {
          headers["X-Dev-Secret"] = String(process.env.NEXT_PUBLIC_DEV_ENDPOINT_SECRET)
        }
        // For now, use organizations/orders in dev; in prod we will replace with vendor-scoped orders route
        const url = new URL(`${MEDUSA_URL}/organizations/orders`)
        url.searchParams.set("take", "50")
        const res = await fetch(url.toString(), { headers })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to load orders")
        setOrders(data.orders || [])
      } catch (e: any) {
        setError(e?.message || "Error")
      } finally {
        setLoading(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <main className="p-6">Loading…</main>
  if (error) return <main className="p-6 text-red-600">{error}</main>

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Orders — {vendorSlug}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border">Order</th>
              <th className="text-left p-2 border">Created</th>
              <th className="text-left p-2 border">Customer</th>
              <th className="text-left p-2 border">Status</th>
              <th className="text-left p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-2 border font-mono">{o.id}</td>
                <td className="p-2 border">{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</td>
                <td className="p-2 border">{o.email || "-"}</td>
                <td className="p-2 border">{o.status}</td>
                <td className="p-2 border">{typeof o.total === "number" ? `${o.total/100} ${o.currency_code?.toUpperCase()}` : "-"}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={5}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

